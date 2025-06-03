from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Discussion, Note, Like, Upvote, Reprint
from .serializers import DiscussionDetailSerializer, NoteSerializer, LikeResponseSerializer, UpvoteResponseSerializer, ReprintSerializer
from django.db import transaction
from django.db.models import Count
import json

CustomUser = get_user_model()

class DiscussionConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.discussion_id = self.scope['url_route']['kwargs']['discussion_id']
        self.group_name = f"discussion_{self.discussion_id}"
        user = self.scope['user']

        if not user.is_authenticated:
            await self.close(code=4001)  # Unauthorized
            return

        # Verify discussion exists
        if await self.is_valid_discussion(self.discussion_id):
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
        else:
            await self.close(code=4004)  # Not Found

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({'error': 'Invalid JSON data.'}))
            return

        action = data.get('action')
        if action == 'add_note':
            await self.handle_add_note(data)
        elif action == 'like_note':
            await self.handle_like_note(data)
        elif action == 'upvote_post':
            await self.handle_upvote_post(data)
        elif action == 'reprint_post':
            await self.handle_reprint_post(data)
        else:
            await self.send(text_data=json.dumps({'error': 'Invalid action.'}))

    async def handle_add_note(self, data):
        content = data.get('content')
        parent_note_id = data.get('parent_note_id')
        user = self.scope['user']

        if not content:
            await self.send(text_data=json.dumps({'error': 'Note content cannot be empty.'}))
            return

        note = await self.create_note(user, content, parent_note_id)
        if note:
            serialized_note = await database_sync_to_async(NoteSerializer)(note, context={'discussion': note.discussion}).data
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'note_added',
                    'note': serialized_note,
                }
            )
        else:
            await self.send(text_data=json.dumps({'error': 'Failed to add note.'}))

    async def handle_like_note(self, data):
        note_id = data.get('note_id')
        user = self.scope['user']

        if not note_id:
            await self.send(text_data=json.dumps({'error': 'Note ID is required.'}))
            return

        note = await self.toggle_like_note(user, note_id)
        if note:
            serialized_note = await database_sync_to_async(LikeResponseSerializer)(note).data
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'note_liked',
                    'note': serialized_note,
                }
            )
        else:
            await self.send(text_data=json.dumps({'error': 'Failed to like/unlike note.'}))

    async def handle_upvote_post(self, data):
        user = self.scope['user']
        discussion = await self.get_discussion()

        if not discussion:
            await self.send(text_data=json.dumps({'error': 'Discussion not found.'}))
            return

        discussion = await self.toggle_upvote_post(user, discussion)
        if discussion:
            serialized_discussion = await database_sync_to_async(UpvoteResponseSerializer)(discussion).data
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'post_upvoted',
                    'discussion': serialized_discussion,
                }
            )
        else:
            await self.send(text_data=json.dumps({'error': 'Failed to upvote/unupvote post.'}))

    async def handle_reprint_post(self, data):
        comment = data.get('comment', '')
        user = self.scope['user']
        discussion = await self.get_discussion()

        if not discussion:
            await self.send(text_data=json.dumps({'error': 'Discussion not found.'}))
            return

        reprint = await self.create_reprint(user, discussion, comment)
        if reprint:
            serialized_reprint = await database_sync_to_async(ReprintSerializer)(reprint).data
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'post_reprinted',
                    'reprint': serialized_reprint,
                }
            )
        else:
            await self.send(text_data=json.dumps({'error': 'Failed to reprint post.'}))

    async def discussion_created(self, event):
        await self.send(text_data=json.dumps({
            'type': 'discussion_created',
            'discussion': event['discussion']
        }))

    async def note_added(self, event):
        await self.send(text_data=json.dumps({
            'type': 'note_added',
            'note': event['note']
        }))

    async def note_liked(self, event):
        await self.send(text_data=json.dumps({
            'type': 'note_liked',
            'note': event['note']
        }))

    async def post_upvoted(self, event):
        await self.send(text_data=json.dumps({
            'type': 'post_upvoted',
            'discussion': event['discussion']
        }))

    async def post_reprinted(self, event):
        await self.send(text_data=json.dumps({
            'type': 'post_reprinted',
            'reprint': event['reprint']
        }))

    @database_sync_to_async
    def is_valid_discussion(self, discussion_id):
        return Discussion.objects.filter(discussion_id=discussion_id, status='active').exists()

    @database_sync_to_async
    def get_discussion(self):
        try:
            return Discussion.objects.get(discussion_id=self.discussion_id, status='active')
        except Discussion.DoesNotExist:
            return None

    @database_sync_to_async
    def create_note(self, user, content, parent_note_id):
        try:
            discussion = Discussion.objects.get(discussion_id=self.discussion_id, status='active')
            data = {'content': content}
            if parent_note_id:
                data['parent_note_id'] = str(parent_note_id)  # Ensure UUID is string
            serializer = NoteSerializer(data=data, context={'discussion': discussion, 'request': {'user': user}})
            if serializer.is_valid():
                return serializer.save()
            return None
        except Discussion.DoesNotExist:
            return None

    @database_sync_to_async
    def toggle_like_note(self, user, note_id):
        try:
            note = Note.objects.get(note_id=note_id, discussion__discussion_id=self.discussion_id, status='active')
            with transaction.atomic():
                like, created = Like.objects.get_or_create(note=note, user=user)
                if not created:
                    like.delete()
                note = Note.objects.filter(note_id=note_id).annotate(likes_count=Count('likes')).first()
                return note
        except Note.DoesNotExist:
            return None

    @database_sync_to_async
    def toggle_upvote_post(self, user, discussion):
        with transaction.atomic():
            upvote, created = Upvote.objects.get_or_create(discussion=discussion, user=user)
            if not created:
                upvote.delete()
            discussion = Discussion.objects.filter(discussion_id=discussion.discussion_id).annotate(upvotes_count=Count('upvotes')).first()
            return discussion

    @database_sync_to_async
    def create_reprint(self, user, discussion, comment):
        try:
            with transaction.atomic():
                reprint, created = Reprint.objects.get_or_create(
                    discussion=discussion,
                    user=user,
                    defaults={'comment': comment}
                )
                if not created:
                    return None
                return reprint
        except Exception:
            return None