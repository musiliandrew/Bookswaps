from django.forms import ValidationError
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import NotFound, PermissionDenied
from django.core.cache import cache
from django.db.models import Count, Q
from django.utils.timezone import now
from django.db import transaction
from .models import Discussion, Note, Reprint, Society, SocietyMember, SocietyEvent
from .serializers import (
    CreateDiscussionSerializer, DiscussionFeedSerializer, DiscussionDetailSerializer,
    NoteSerializer, LikeResponseSerializer, UpvoteResponseSerializer, ReprintSerializer,
    ReprintCreateSerializer, TopPostSerializer, SocietySerializer, CreateSocietySerializer,
    SocietyMemberSerializer, SocietyEventSerializer, CreateSocietyEventSerializer
)
from backend.users.models import Follows
from backend.library.models import Bookmark
from backend.swaps.models import Notification
# Placeholder for WebSocket integration
# from channels.layers import get_channel_layer
# from asgiref.sync import async_to_sync


class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


class CreateDiscussionView(generics.CreateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = CreateDiscussionSerializer

    def perform_create(self, serializer):
        discussion = serializer.save()
        Notification.objects.create(
            user=self.request.user,
            type='discussion_created',
            message=f"You created a new discussion: {discussion.title}",
            content_type='discussion',
            content_id=discussion.discussion_id
        )
        # WebSocket placeholder
        # channel_layer = get_channel_layer()
        # async_to_sync(channel_layer.group_send)(
        #     f"discussion_{discussion.discussion_id}",
        #     {"type": "discussion.created", "data": DiscussionResponseSerializer(discussion).data}
        # )


class PostListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    serializer_class = DiscussionFeedSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        user = self.request.user
        params = self.request.query_params
        cache_key = f"post_list_{user.id if user.is_authenticated else 'anon'}_{params}"
        cached_queryset = cache.get(cache_key)
        if cached_queryset:
            return cached_queryset

        queryset = Discussion.objects.select_related('user', 'book').filter(status='active').annotate(
            upvotes=Count('upvotes'),
            note_count=Count('notes'),
            reprint_count=Count('reprints')
        )

        if params.get('followed') == 'true' and user.is_authenticated:
            followed_ids = Follows.objects.filter(follower=user).values_list('followed_id', flat=True)
            queryset = queryset.filter(user__id__in=followed_ids)

        if params.get('book_id'):
            queryset = queryset.filter(book__book_id=params['book_id'])

        if params.get('type') in ['Article', 'Synopsis', 'Query']:
            queryset = queryset.filter(type=params['type'])

        if params.get('tag'):
            queryset = queryset.filter(tags__contains=[params['tag']])

        if user.is_authenticated:
            bookmarked_book_ids = Bookmark.objects.filter(user=user, active=True).values_list('book_id', flat=True)
            queryset = queryset.order_by(
                Q(book__book_id__in=bookmarked_book_ids).desc(),
                '-created_at'
            )
        else:
            queryset = queryset.order_by('-created_at')

        cache.set(cache_key, queryset, timeout=300)  # 5 minutes
        return queryset


class PostDetailView(generics.RetrieveAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    serializer_class = DiscussionDetailSerializer
    lookup_field = 'discussion_id'

    def get_queryset(self):
        return Discussion.objects.select_related('user', 'book').filter(status='active').annotate(
            upvotes=Count('upvotes'),
            note_count=Count('notes'),
            reprint_count=Count('reprints')
        )

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.views += 1
        instance.save()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class DeletePostView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'discussion_id'

    def get_queryset(self):
        return Discussion.objects.filter(user=self.request.user, status='active')

    def perform_destroy(self, instance):
        instance.status = 'deleted'
        instance.save()
        Notification.objects.create(
            user=self.request.user,
            type='discussion_deleted',
            message=f"You deleted your discussion: {instance.title}",
            content_type='discussion',
            content_id=instance.discussion_id
        )


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

        Notification.objects.create(
            user=discussion.user,
            type='note_added',
            message=f"{request.user.username} commented on your discussion: {discussion.title}",
            content_type='note',
            content_id=note.note_id
        )
        # WebSocket placeholder
        # channel_layer = get_channel_layer()
        # async_to_sync(channel_layer.group_send)(
        #     f"discussion_{discussion.discussion_id}",
        #     {"type": "note.added", "data": serializer.data}
        # )
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class NotesListView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    serializer_class = NoteSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        discussion_id = self.kwargs['discussion_id']
        try:
            discussion = Discussion.objects.get(discussion_id=discussion_id, status='active')
        except Discussion.DoesNotExist:
            raise NotFound("Discussion not found.")
        return Note.objects.filter(discussion=discussion, status='active').select_related('user', 'parent_note').order_by('created_at')


class LikeCommentView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = LikeResponseSerializer
    lookup_field = 'note_id'

    def get_queryset(self):
        return Note.objects.filter(status='active')

    def update(self, request, *args, **kwargs):
        note = self.get_object()
        note.likes += 1
        note.save()
        serializer = self.get_serializer(note)
        Notification.objects.create(
            user=note.user,
            type='note_liked',
            message=f"{request.user.username} liked your comment on {note.discussion.title}",
            content_type='note',
            content_id=note.note_id
        )
        return Response(serializer.data)


class UpvotePostView(generics.UpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = UpvoteResponseSerializer
    lookup_field = 'discussion_id'

    def get_queryset(self):
        return Discussion.objects.filter(status='active')

    def update(self, request, *args, **kwargs):
        discussion = self.get_object()
        discussion.upvotes += 1
        discussion.save()
        serializer = self.get_serializer(discussion)
        Notification.objects.create(
            user=discussion.user,
            type='discussion_upvoted',
            message=f"{request.user.username} upvoted your discussion: {discussion.title}",
            content_type='discussion',
            content_id=discussion.discussion_id
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
            reprint = Reprint.objects.create(
                reprint_id=uuid.uuid4(),
                discussion=discussion,
                user=request.user,
                comment=serializer.validated_data.get('comment', ''),
                created_at=now()
            )
            Notification.objects.create(
                user=discussion.user,
                type='discussion_reprinted',
                message=f"{request.user.username} reposted your discussion: {discussion.title}",
                content_type='reprint',
                content_id=reprint.reprint_id
            )
        return Response(ReprintSerializer(reprint).data, status=status.HTTP_201_CREATED)


class ListTopPostsView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    serializer_class = TopPostSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        params = self.request.query_params
        cache_key = f"top_posts_{params}"
        cached_queryset = cache.get(cache_key)
        if cached_queryset:
            return cached_queryset

        queryset = Discussion.objects.filter(status='active').annotate(
            upvotes=Count('upvotes'),
            note_count=Count('notes'),
            engagement=Count('upvotes') + Count('notes') * 2
        )

        if params.get('book_id'):
            queryset = queryset.filter(book__book_id=params['book_id'])
        if params.get('type'):
            queryset = queryset.filter(type=params['type'])

        queryset = queryset.order_by('-engagement', '-upvotes')
        limit = params.get('limit', '5')
        if limit.isdigit():
            queryset = queryset[:int(limit)]

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
        Notification.objects.create(
            user=self.request.user,
            type='society_created',
            message=f"You created a new society: {society.name}",
            content_type='society',
            content_id=society.society_id
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
        Notification.objects.create(
            user=request.user,
            type='society_joined',
            message=f"You joined the society: {society.name}",
            content_type='society',
            content_id=society.society_id
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
        Notification.objects.create(
            user=self.request.user,
            type='society_left',
            message=f"You left the society: {society.name}",
            content_type='society',
            content_id=society.society_id
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
        Notification.objects.create(
            user=request.user,
            type='society_event_created',
            message=f"New event created in {society.name}: {event.title}",
            content_type='society_event',
            content_id=event.event_id
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