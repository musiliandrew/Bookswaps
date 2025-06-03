from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Chats, MessageReaction
from backend.discussions.models import Society, SocietyMember, SocietyMessage
from .serializers import ChatSerializer, SocietyMessageSerializer, MessageReactionSerializer
import json

CustomUser = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.chat_id = self.scope['url_route']['kwargs']['chat_id']
        self.group_name = f"chat_{self.chat_id}"
        user = self.scope['user']

        if not user.is_authenticated:
            await self.close(code=4001)  # Unauthorized
            return

        # Verify user is part of the chat
        if await self.is_valid_chat_member(user, self.chat_id):
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
        else:
            await self.close(code=4003)  # Forbidden

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
        if action == 'send_message':
            await self.handle_send_message(data)
        elif action == 'add_reaction':
            await self.handle_add_reaction(data)
        else:
            await self.send(text_data=json.dumps({'error': 'Invalid action.'}))

    async def handle_send_message(self, data):
        content = data.get('content')
        book_id = data.get('book_id')
        user = self.scope['user']

        if not content:
            await self.send(text_data=json.dumps({'error': 'Message content cannot be empty.'}))
            return

        chat = await self.create_chat_message(user, content, book_id)
        if chat:
            serialized_chat = await database_sync_to_async(ChatSerializer)(chat).data
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'chat_message',
                    'message': serialized_chat,
                }
            )
        else:
            await self.send(text_data=json.dumps({'error': 'Failed to send message.'}))

    async def handle_add_reaction(self, data):
        reaction_type = data.get('reaction_type')
        user = self.scope['user']

        if not reaction_type:
            await self.send(text_data=json.dumps({'error': 'Reaction type is required.'}))
            return

        reaction = await self.create_reaction(user, reaction_type)
        if reaction:
            serialized_reaction = await database_sync_to_async(MessageReactionSerializer)(reaction).data
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'reaction_added',
                    'reaction': serialized_reaction,
                }
            )
        else:
            await self.send(text_data=json.dumps({'error': 'Failed to add reaction.'}))

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message']
        }))

    async def reaction_added(self, event):
        await self.send(text_data=json.dumps({
            'type': 'reaction_added',
            'reaction': event['reaction']
        }))

    @database_sync_to_async
    def is_valid_chat_member(self, user, chat_id):
        try:
            chat = Chats.objects.get(chat_id=chat_id)
            return user in (chat.sender, chat.receiver)
        except Chats.DoesNotExist:
            return False

    @database_sync_to_async
    def create_chat_message(self, user, content, book_id):
        try:
            chat = Chats.objects.get(chat_id=self.chat_id)
            receiver = chat.receiver if chat.sender == user else chat.sender
            data = {'content': content, 'receiver_id': str(receiver.user_id)}  # Ensure UUID is string
            if book_id:
                data['book_id'] = str(book_id)  # Ensure UUID is string
            serializer = ChatSerializer(data=data, context={'sender': user})
            if serializer.is_valid():
                return serializer.save()
            return None
        except Chats.DoesNotExist:
            return None

    @database_sync_to_async
    def create_reaction(self, user, reaction_type):
        try:
            chat = Chats.objects.get(chat_id=self.chat_id)
            serializer = MessageReactionSerializer(
                data={'reaction_type': reaction_type},
                context={'chat': chat, 'user': user}
            )
            if serializer.is_valid():
                return serializer.save()
            return None
        except Chats.DoesNotExist:
            return None

class SocietyConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.society_id = self.scope['url_route']['kwargs']['society_id']
        self.group_name = f"society_{self.society_id}"
        user = self.scope['user']

        if not user.is_authenticated:
            await self.close(code=4001)  # Unauthorized
            return

        # Verify user is a society member
        if await self.is_society_member(user, self.society_id):
            await self.channel_layer.group_add(self.group_name, self.channel_name)
            await self.accept()
        else:
            await self.close(code=4003)  # Forbidden

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
        if action == 'send_message':
            await self.handle_send_society_message(data)
        elif action == 'add_reaction':
            await self.handle_add_society_reaction(data)
        else:
            await self.send(text_data=json.dumps({'error': 'Invalid action.'}))

    async def handle_send_society_message(self, data):
        content = data.get('content')
        book_id = data.get('book_id')
        user = self.scope['user']

        if not content:
            await self.send(text_data=json.dumps({'error': 'Message content cannot be empty.'}))
            return

        message = await self.create_society_message(user, content, book_id)
        if message:
            serialized_message = await database_sync_to_async(SocietyMessageSerializer)(message).data
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'society_message',
                    'message': serialized_message,
                }
            )
        else:
            await self.send(text_data=json.dumps({'error': 'Failed to send message.'}))

    async def handle_add_society_reaction(self, data):
        reaction_type = data.get('reaction_type')
        message_id = data.get('message_id')
        user = self.scope['user']

        if not reaction_type or not message_id:
            await self.send(text_data=json.dumps({'error': 'Reaction type and message ID are required.'}))
            return

        reaction = await self.create_society_reaction(user, message_id, reaction_type)
        if reaction:
            serialized_reaction = await database_sync_to_async(MessageReactionSerializer)(reaction).data
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'reaction_added',
                    'reaction': serialized_reaction,
                }
            )
        else:
            await self.send(text_data=json.dumps({'error': 'Failed to add reaction.'}))

    async def society_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'society_message',
            'message': event['message']
        }))

    async def reaction_added(self, event):
        await self.send(text_data=json.dumps({
            'type': 'reaction_added',
            'reaction': event['reaction']
        }))

    @database_sync_to_async
    def is_society_member(self, user, society_id):
        return SocietyMember.objects.filter(
            society__society_id=society_id, user=user, status='ACTIVE'
        ).exists()

    @database_sync_to_async
    def create_society_message(self, user, content, book_id):
        try:
            society = Society.objects.get(society_id=self.society_id)
            data = {'content': content}
            if book_id:
                data['book_id'] = str(book_id)  # Ensure UUID is string
            serializer = SocietyMessageSerializer(
                data=data,
                context={'society_id': self.society_id, 'user': user}
            )
            if serializer.is_valid():
                return serializer.save()
            return None
        except Society.DoesNotExist:
            return None

    @database_sync_to_async
    def create_society_reaction(self, user, message_id, reaction_type):
        try:
            society_message = SocietyMessage.objects.get(
                message_id=message_id, society__society_id=self.society_id, status='ACTIVE'
            )
            serializer = MessageReactionSerializer(
                data={'reaction_type': reaction_type},
                context={'society_message': society_message, 'user': user}
            )
            if serializer.is_valid():
                return serializer.save()
            return None
        except SocietyMessage.DoesNotExist:
            return None