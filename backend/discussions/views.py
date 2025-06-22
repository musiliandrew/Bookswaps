from django.forms import ValidationError
from rest_framework import status, generics, permissions, serializers
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from .pagination import StandardPagination
from rest_framework.exceptions import NotFound, PermissionDenied
from django.core.cache import cache
from django.db.models import Count, Q, Case, When, IntegerField
from django.utils.timezone import now
from django.utils import timezone
from django.db import transaction
import uuid
from .models import Discussion, Note, Reprint, Society, SocietyMember, SocietyEvent, Like, Upvote
from .serializers import (
    CreateDiscussionSerializer, DiscussionFeedSerializer, DiscussionDetailSerializer,
    NoteSerializer, LikeResponseSerializer, UpvoteResponseSerializer, ReprintSerializer,
    ReprintCreateSerializer, TopPostSerializer, SocietySerializer, CreateSocietySerializer,
    SocietyMemberSerializer, SocietyEventSerializer, CreateSocietyEventSerializer
)
from backend.users.models import Follows
from backend.library.models import Bookmark
from backend.swaps.models import Notification
from backend.utils.websocket import send_notification_to_user
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync


class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class CreateDiscussionView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CreateDiscussionSerializer

    def perform_create(self, serializer):
        discussion = serializer.save()
        notification = Notification.objects.create(
            user=self.request.user,
            type='discussion_created',
            message=f"You created a new discussion: {discussion.title}",
            content_type='discussion',
            content_id=discussion.discussion_id
        )
        # Send WebSocket notification
        send_notification_to_user(
            self.request.user.user_id,
            {
                "notification_id": str(notification.notification_id),
                "message": f"You created a new discussion: {discussion.title}",
                "type": "discussion_created",
                "content_type": "discussion",
                "content_id": str(discussion.discussion_id),
                "follow_id": None
            }
        )
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"discussion_{discussion.discussion_id}",
            {
                "type": "discussion_created",
                "discussion": DiscussionDetailSerializer(discussion).data
            }
        )


class PostListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    serializer_class = DiscussionFeedSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        user = self.request.user
        params = self.request.query_params
        cache_key = f"post_list_{user.user_id if user.is_authenticated else 'anon'}_{params}"
        cached_queryset = cache.get(cache_key)
        if cached_queryset:
            print(f"Cache hit for key: {cache_key}")
            return cached_queryset

        queryset = Discussion.objects.select_related('user', 'book').filter(status='active')
        
        try:
            queryset = queryset.annotate(
                upvote_count=Count('upvotes'),
                note_count=Count('notes'),
                reprint_count=Count('reprints')
            )
        except Exception as e:
            print(f"Annotation error: {str(e)}")
            raise

        if params.get('followed') == 'true' and user.is_authenticated:
            followed_ids = Follows.objects.filter(follower=user).values_list('followed_id', flat=True)
            print(f"Followed IDs: {list(followed_ids)}")
            queryset = queryset.filter(user__id__in=followed_ids)

        if params.get('book_id'):
            print(f"Filtering by book_id: {params['book_id']}")
            queryset = queryset.filter(book__book_id=params['book_id'])

        if params.get('type') in ['Article', 'Synopsis', 'Query']:
            print(f"Filtering by type: {params['type']}")
            queryset = queryset.filter(type=params['type'])

        if params.get('tag'):
            print(f"Filtering by tag: {params['tag']}")
            queryset = queryset.filter(tags__contains=[params['tag']])

        if user.is_authenticated:
            bookmarked_book_ids = Bookmark.objects.filter(user=user, active=True).values_list('book_id', flat=True)
            print(f"Bookmarked book IDs: {list(bookmarked_book_ids)}")
            queryset = queryset.annotate(
                is_bookmarked=Case(
                    When(book__book_id__in=bookmarked_book_ids, then=1),
                    default=0,
                    output_field=IntegerField()
                )
            ).order_by('-is_bookmarked', '-created_at')
        else:
            queryset = queryset.order_by('-created_at')

        print(f"Queryset count: {queryset.count()}")
        cache.set(cache_key, queryset, timeout=300)  # 5 minutes
        return queryset
    
class PostDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    serializer_class = DiscussionDetailSerializer
    lookup_field = 'discussion_id'

    def get_queryset(self):
        return Discussion.objects.select_related('user', 'book').filter(status='active').annotate(
            upvote_count=Count('upvotes'),  # Changed from upvotes to upvote_count
            note_count=Count('notes'),
            reprint_count=Count('reprints')
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views += 1
        instance.save(update_fields=['views'])  # Optimize save
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

class DeletePostView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'discussion_id'

    def get_queryset(self):
        return Discussion.objects.filter(user=self.request.user, status='active')

    def perform_destroy(self, instance):
        instance.status = 'deleted'
        instance.save(update_fields=['status'])  # Optimize save
        try:
            notification = Notification.objects.create(
                user=self.request.user,
                type='discussion_deleted',
                message=f"You deleted your discussion: {instance.title}"[:500],
                content_type='discussion',
                content_id=instance.discussion_id
            )
            # Send notification via WebSocket to the user's group
            send_notification_to_user(
                self.request.user.user_id,
                {
                    "notification_id": str(notification.notification_id),
                    "message": f"You deleted your discussion: {instance.title}"[:500],
                    "type": "discussion_deleted",
                    "content_type": "discussion",
                    "content_id": str(instance.discussion_id),
                    "follow_id": None
                }
            )
        except Exception as e:
            print(f"Notification creation failed: {str(e)}")

class AddNoteView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = NoteSerializer

    def create(self, request, *args, **kwargs):
        discussion_id = self.kwargs['discussion_id']
        try:
            discussion = Discussion.objects.get(discussion_id=discussion_id, status='active')
        except Discussion.DoesNotExist:
            raise NotFound("Discussion not found.")

        serializer = self.get_serializer(data=request.data, context={'discussion': discussion, 'request': request})
        serializer.is_valid(raise_exception=True)
        note = serializer.save()

        try:
            notification = Notification.objects.create(
                user=discussion.user,
                type='note_added',
                message=f"{request.user.username} commented on your discussion: {discussion.title}"[:500],
                content_type='note',
                content_id=note.note_id
            )
            # Send notification via WebSocket to the user's group
            send_notification_to_user(
                discussion.user.user_id,
                {
                    "notification_id": str(notification.notification_id),
                    "message": f"{request.user.username} commented on your discussion: {discussion.title}"[:500],
                    "type": "note_added",
                    "content_type": "note",
                    "content_id": str(note.note_id),
                    "follow_id": None
                }
            )
        except Exception as e:
            print(f"Notification creation failed: {str(e)}")

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"discussion_{discussion.discussion_id}",
            {
                "type": "note_added",
                "note": serializer.data
            }
        )
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class NotesListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    serializer_class = NoteSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        discussion_id = self.kwargs['discussion_id']
        cache_key = f"notes_list_{discussion_id}"
        cached_queryset = cache.get(cache_key)
        if cached_queryset:
            print(f"Cache hit for key: {cache_key}")
            return cached_queryset

        try:
            discussion = Discussion.objects.get(discussion_id=discussion_id, status='active')
        except Discussion.DoesNotExist:
            raise NotFound("Discussion not found.")
        
        queryset = Note.objects.filter(discussion=discussion, status='active').select_related('user', 'parent_note').order_by('created_at')
        cache.set(cache_key, queryset, timeout=300)  # 5 minutes
        return queryset

class LikeCommentView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = LikeResponseSerializer
    lookup_field = 'note_id'

    def get_queryset(self):
        return Note.objects.filter(status='active').annotate(likes_count=Count('likes'))

    def update(self, request, *args, **kwargs):
        note = self.get_object()
        user = request.user

        with transaction.atomic():
            like, created = Like.objects.get_or_create(
                note=note,
                user=user,
                defaults={'created_at': timezone.now()}
            )
            if not created:
                like.delete()
                action = 'unliked'
            else:
                action = 'liked'

        if action == 'liked' and note.user != user:
            try:
                notification = Notification.objects.create(
                    user=note.user,
                    type='note_liked',
                    message=f"{user.username} liked your comment on {note.discussion.title}"[:500],
                    content_type='note',
                    content_id=note.note_id
                )
                # Send notification via WebSocket to the note owner's group
                send_notification_to_user(
                    note.user.user_id,
                    {
                        "notification_id": str(notification.notification_id),
                        "message": f"{user.username} liked your comment on {note.discussion.title}"[:500],
                        "type": "note_liked",
                        "content_type": "note",
                        "content_id": str(note.note_id),
                        "follow_id": None
                    }
                )
            except Exception as e:
                print(f"Notification creation failed: {str(e)}")

        note = Note.objects.filter(note_id=note.note_id).annotate(likes_count=Count('likes')).first()
        serializer = self.get_serializer(note)

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"discussion_{note.discussion.discussion_id}",
            {
                "type": "note_liked",
                "note": serializer.data
            }
        )
        return Response(serializer.data)

class UpvotePostView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UpvoteResponseSerializer
    lookup_field = 'discussion_id'

    def get_queryset(self):
        return Discussion.objects.filter(status='active').annotate(upvotes_count=Count('upvotes'))

    def update(self, request, *args, **kwargs):
        discussion = self.get_object()
        user = request.user

        with transaction.atomic():
            upvote, created = Upvote.objects.get_or_create(
                discussion=discussion,
                user=user,
                defaults={'created_at': timezone.now()}
            )
            if not created:
                upvote.delete()
                action = 'unupvoted'
            else:
                action = 'upvoted'

        if action == 'upvoted' and discussion.user != user:
            try:
                notification = Notification.objects.create(
                    user=discussion.user,
                    type='discussion_upvoted',
                    message=f"{user.username} upvoted your discussion: {discussion.title}"[:500],
                    content_type='discussion',
                    content_id=discussion.discussion_id
                )
                # Send notification via WebSocket to the user's group
                send_notification_to_user(
                    discussion.user.user_id,
                    {
                        "notification_id": str(notification.notification_id),
                        "message": f"{user.username} upvoted your discussion: {discussion.title}"[:500],
                        "type": "discussion_upvoted",
                        "content_type": "discussion",
                        "content_id": str(discussion.discussion_id),
                        "follow_id": None
                    }
                )
            except Exception as e:
                print(f"Notification creation failed: {str(e)}")

        discussion = Discussion.objects.filter(discussion_id=discussion.discussion_id).annotate(upvotes_count=Count('upvotes')).first()
        serializer = self.get_serializer(discussion)

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"discussion_{discussion.discussion_id}",
            {
                "type": "post_upvoted",
                "discussion": serializer.data
            }
        )
        return Response(serializer.data)


class ReprintPostView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ReprintCreateSerializer

    def create(self, request, *args, **kwargs):
        discussion_id = self.kwargs['discussion_id']
        try:
            discussion = Discussion.objects.get(discussion_id=discussion_id, status='active')
        except Discussion.DoesNotExist:
            raise NotFound("Discussion not found.")

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            reprint, created = Reprint.objects.get_or_create(
                discussion=discussion,
                user=request.user,
                defaults={
                    'reprint_id': uuid.uuid4(),
                    'comment': serializer.validated_data.get('comment', ''),
                    'created_at': timezone.now()
                }
            )
            if not created:
                raise serializers.ValidationError("You have already reprinted this discussion.")

            if discussion.user != request.user:
                try:
                    notification = Notification.objects.create(
                        user=discussion.user,
                        type='discussion_reprinted',
                        message=f"{request.user.username} reposted your discussion: {discussion.title}"[:500],
                        content_type='reprint',
                        content_id=reprint.reprint_id
                    )
                    # Send notification via WebSocket to the user's group
                    send_notification_to_user(
                        discussion.user.user_id,
                        {
                            "notification_id": str(notification.notification_id),
                            "message": f"{request.user.username} reposted your discussion: {discussion.title}"[:500],
                            "type": "discussion_reprinted",
                            "content_type": "reprint",
                            "content_id": str(reprint.reprint_id),
                            "follow_id": None
                        }
                    )
                except Exception as e:
                    print(f"Notification creation failed: {str(e)}")

        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"discussion_{discussion.discussion_id}",
            {
                "type": "post_reprinted",
                "reprint": ReprintSerializer(reprint).data
            }
        )
        return Response(ReprintSerializer(reprint).data, status=status.HTTP_201_CREATED)
class ListTopPostsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    serializer_class = TopPostSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        params = self.request.query_params
        cache_key = "top_posts_" + "&".join(f"{k}={v}" for k, v in sorted(params.items()))
        cached_queryset = cache.get(cache_key)
        if cached_queryset is not None:
            return cached_queryset

        queryset = Discussion.objects.filter(status='active').annotate(
            upvotes_count=Count('upvotes', distinct=True),
            note_count=Count('notes', distinct=True),
            engagement=Count('upvotes', distinct=True) + Count('notes', distinct=True) * 2
        ).distinct()

        if params.get('book_id'):
            try:
                uuid.UUID(params['book_id'])
                queryset = queryset.filter(book__book_id=params['book_id'])
            except ValueError:
                raise serializers.ValidationError("Invalid book_id format.")
        if params.get('type'):
            if params['type'] in ['Article', 'Synopsis', 'Query']:
                queryset = queryset.filter(type=params['type'])
            else:
                raise serializers.ValidationError("Invalid type. Must be Article, Synopsis, or Query.")

        queryset = queryset.order_by('-engagement', '-upvotes_count')
        limit = params.get('limit', '5')
        try:
            limit = int(limit)
            if limit <= 0:
                raise ValueError
            queryset = queryset[:limit]
        except ValueError:
            raise serializers.ValidationError("Limit must be a positive integer.")

        cache.set(cache_key, queryset, timeout=3600)  # 1 hour
        return queryset


class CreateSocietyView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CreateSocietySerializer

    def perform_create(self, serializer):
        society = serializer.save(creator=self.request.user)
        SocietyMember.objects.create(
            society=society,
            user=self.request.user,
            role='admin',
            joined_at=now()
        )
        notification = Notification.objects.create(
            user=self.request.user,
            type='society_created',
            message=f"You created a new society: {society.name}",
            content_type='society',
            content_id=society.society_id
        )
        # Send notification via WebSocket to the user's group
        send_notification_to_user(
            self.request.user.user_id,
            {
                "notification_id": str(notification.notification_id),
                "message": f"You created a new society: {society.name}",
                "type": "society_created",
                "content_type": "society",
                "content_id": str(society.society_id),
                "follow_id": None
            }
        )

class SocietyDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    serializer_class = SocietySerializer
    lookup_field = 'society_id'

    def get_queryset(self):
        return Society.objects.annotate(member_count=Count('members'))


class JoinSocietyView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = SocietyMemberSerializer

    def create(self, request, *args, **kwargs):
        society_id = self.kwargs['society_id']
        try:
            society = Society.objects.get(society_id=society_id)
        except Society.DoesNotExist:
            raise NotFound("Society not found.")

        if society.visibility == 'private' and not SocietyMember.objects.filter(
            society=society, user=request.user, role='admin'
        ).exists():
            raise PermissionDenied("Cannot join private society without invitation.")

        if SocietyMember.objects.filter(society=society, user=request.user).exists():
            raise ValidationError("You are already a member.")

        member = SocietyMember.objects.create(
            society=society,
            user=request.user,
            role='member',
            joined_at=now()
        )
        notification = Notification.objects.create(
            user=request.user,
            type='society_joined',
            message=f"You joined the society: {society.name}",
            content_type='society',
            content_id=society.society_id
        )
        # Send notification via WebSocket to the user's group
        send_notification_to_user(
            request.user.user_id,
            {
                "notification_id": str(notification.notification_id),
                "message": f"You joined the society: {society.name}",
                "type": "society_joined",
                "content_type": "society",
                "content_id": str(society.society_id),
                "follow_id": None
            }
        )
        return Response(SocietyMemberSerializer(member).data, status=status.HTTP_201_CREATED)


class LeaveSocietyView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'society_id'

    def get_object(self):
        society_id = self.kwargs['society_id']
        try:
            return SocietyMember.objects.get(society__society_id=society_id, user=self.request.user)
        except SocietyMember.DoesNotExist:
            raise NotFound("You are not a member of this society.")

    def perform_destroy(self, instance):
        society = instance.society
        if instance.role == 'admin' and SocietyMember.objects.filter(society=society, role='admin').count() == 1:
            raise PermissionDenied("Cannot leave as the only admin.")
        instance.delete()
        notification = Notification.objects.create(
            user=self.request.user,
            type='society_left',
            message=f"You left the society: {society.name}",
            content_type='society',
            content_id=society.society_id
        )
        # Send notification via WebSocket to the user's group
        send_notification_to_user(
            self.request.user.user_id,
            {
                "notification_id": str(notification.notification_id),
                "message": f"You left the society: {society.name}",
                "type": "society_left",
                "content_type": "society",
                "content_id": str(society.society_id),
                "follow_id": None
            }
        )

class CreateSocietyEventView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CreateSocietyEventSerializer

    def create(self, request, *args, **kwargs):
        society_id = self.kwargs['society_id']
        try:
            society = Society.objects.get(society_id=society_id)
        except Society.DoesNotExist:
            raise NotFound("Society not found.")

        if not SocietyMember.objects.filter(society=society, user=request.user, role='admin').exists():
            raise PermissionDenied("Only admins can create events.")

        serializer = self.get_serializer(data=request.data, context={'society': society, 'request': request})
        serializer.is_valid(raise_exception=True)
        event = serializer.save()
        notification = Notification.objects.create(
            user=request.user,
            type='society_event_created',
            message=f"New event created in {society.name}: {event.title}",
            content_type='society_event',
            content_id=event.event_id
        )
        # Send notification via WebSocket to the user's group
        send_notification_to_user(
            request.user.user_id,
            {
                "notification_id": str(notification.notification_id),
                "message": f"New event created in {society.name}: {event.title}",
                "type": "society_event_created",
                "content_type": "society_event",
                "content_id": str(event.event_id),
                "follow_id": None
            }
        )
        return Response(SocietyEventSerializer(event).data, status=status.HTTP_201_CREATED)


class SocietyEventListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    serializer_class = SocietyEventSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        society_id = self.kwargs['society_id']
        try:
            society = Society.objects.get(society_id=society_id)
        except Society.DoesNotExist:
            raise NotFound("Society not found.")
        return SocietyEvent.objects.filter(society=society).select_related('book').order_by('event_date')