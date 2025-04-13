from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
import uuid
from django.utils.timezone import now
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.exceptions import NotFound
from rest_framework.pagination import PageNumberPagination
from .serializers import CreateDiscussionSerializer, DiscussionResponseSerializer, DiscussionFeedSerializer, DiscussionDetailSerializer, NoteSerializer, LikeResponseSerializer, UpvoteResponseSerializer,ReprintSerializer, ReprintCreateSerializer, TopPostSerializer 
from .models import Discussions, Notes, Reprints
from users.models import Follows
from library.models import Bookmarks
from django.db.models import Count, Q, F, Value, CharField
from django.db.models.functions import Left

class CreateDiscussionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = CreateDiscussionSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            discussion = serializer.save()
            response_serializer = DiscussionResponseSerializer(discussion)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PostListView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        user = request.user
        query_params = request.query_params
        posts = Discussions.objects.select_related('user', 'book')

        # Personalized filtering
        if query_params.get('followed') == 'true' and user.is_authenticated:
            followed_ids = Follows.objects.filter(follower=user).values_list('followed_id', flat=True)
            posts = posts.filter(user__id__in=followed_ids)

        if query_params.get('book_id'):
            posts = posts.filter(book__id=query_params.get('book_id'))

        if query_params.get('type') in ['Article', 'Synopsis', 'Query']:
            posts = posts.filter(type=query_params.get('type'))

        if query_params.get('tag'):
            tag = query_params.get('tag')
            posts = posts.filter(tags__icontains=tag)

        # Optional: Prioritize bookmarked books (if needed)
        if user.is_authenticated:
            bookmarked_book_ids = Bookmarks.objects.filter(user=user).values_list('book_id', flat=True)
            posts = posts.annotate(priority=Count('id')).order_by(
                F('book__id').in_(bookmarked_book_ids).desc(nulls_last=True),
                '-created_at'
            )
        else:
            posts = posts.order_by('-created_at')

        paginator = PageNumberPagination()
        result_page = paginator.paginate_queryset(posts, request)
        serializer = DiscussionFeedSerializer(result_page, many=True, context={'request': request})

        return paginator.get_paginated_response(serializer.data)
    
class PostDetailView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, discussion_id):
        try:
            # Fetch the post with the related book and user
            discussion = Discussions.objects.select_related('user', 'book').get(discussion_id=discussion_id)
        except Discussions.DoesNotExist:
            return Response({"detail": "Post not found"}, status=status.HTTP_404_NOT_FOUND)

        # Fetch notes and reprints counts
        note_count = Notes.objects.filter(discussion=discussion).count()
        reprint_count = Reprints.objects.filter(discussion=discussion).count()

        # Prepare the response data
        response_data = {
            'discussion_id': discussion.discussion_id,
            'type': discussion.type,
            'title': discussion.title,
            'user': {
                'user_id': str(discussion.user.id),
                'username': discussion.user.username
            },
            'book': {
                'book_id': str(discussion.book.id),
                'title': discussion.book.title
            },
            'content': discussion.content,
            'tags': discussion.tags.split(",") if discussion.tags else [],
            'media_urls': discussion.media_urls.split(",") if discussion.media_urls else [],
            'spoiler_flag': discussion.spoiler_flag,
            'upvotes': discussion.upvotes,
            'note_count': note_count,
            'reprint_count': reprint_count
        }

        return Response(response_data, status=status.HTTP_200_OK)
    
class DeletePostView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, discussion_id):
        try:
            # Fetch the post that the current user owns
            discussion = Discussions.objects.get(discussion_id=discussion_id, user=request.user)

            # Delete the discussion and its associated notes and reprints
            discussion.delete()

            return Response(status=status.HTTP_204_NO_CONTENT)

        except Discussions.DoesNotExist:
            return Response({"error": "Not your post"}, status=status.HTTP_403_FORBIDDEN)
        
class AddNoteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, discussion_id):
        try:
            # Fetch the discussion
            discussion = Discussions.objects.get(discussion_id=discussion_id)
        except Discussions.DoesNotExist:
            return Response({"detail": "Discussion not found."}, status=status.HTTP_404_NOT_FOUND)

        # Pass the discussion and user to the serializer context
        serializer = NoteSerializer(data=request.data, context={'discussion': discussion, 'user': request.user})

        if serializer.is_valid():
            note = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class NotesPagination(PageNumberPagination):
    page_size = 10  # You can adjust the page size to fit your needs
    page_size_query_param = 'page_size'
    max_page_size = 100

class NotesListView(generics.ListAPIView):
    serializer_class = NoteSerializer
    pagination_class = NotesPagination

    def get_queryset(self):
        discussion_id = self.kwargs.get('discussion_id')
        try:
            # Validate the discussion exists
            discussion = Discussions.objects.get(discussion_id=discussion_id)
        except Discussions.DoesNotExist:
            raise NotFound(detail="Discussion not found")

        # Fetch notes and include their threaded structure based on parent_note_id
        return Notes.objects.filter(discussion=discussion).order_by('created_at')

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
class LikeCommentView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        note_id = self.kwargs.get('note_id')

        try:
            # Fetch the note that the user is trying to like
            note = Notes.objects.get(note_id=note_id)
        except Notes.DoesNotExist:
            raise NotFound(detail="Note not found")

        # Increment the likes count
        note.likes = (note.likes or 0) + 1
        note.save()

        # Serialize and return the updated note data
        serializer = LikeResponseSerializer(note)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
class UpvotePostView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        discussion_id = self.kwargs.get('discussion_id')

        try:
            # Fetch the discussion that the user is trying to upvote
            discussion = Discussions.objects.get(discussion_id=discussion_id)
        except Discussions.DoesNotExist:
            raise NotFound(detail="Discussion post not found")

        # Increment the upvotes count
        discussion.upvotes = (discussion.upvotes or 0) + 1
        discussion.save()

        # Serialize and return the updated discussion data
        serializer = UpvoteResponseSerializer(discussion)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ReprintPostView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, discussion_id):
        # Validate discussion existence
        try:
            discussion = Discussions.objects.get(discussion_id=discussion_id)
        except Discussions.DoesNotExist:
            raise NotFound("Discussion not found.")

        # Validate request body
        serializer = ReprintCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        comment = serializer.validated_data.get('comment', '')

        # Create new Reprint
        reprint = Reprints.objects.create(
            reprint_id=uuid.uuid4(),
            discussion=discussion,
            user=request.user,
            comment=comment,
            created_at=now()
        )

        response_serializer = ReprintSerializer(reprint)
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
class ListTopPostsView(APIView):
    def get(self, request):
        book_id = request.query_params.get('book_id')
        post_type = request.query_params.get('type')
        limit = request.query_params.get('limit')

        posts = Discussions.objects.all()

        if book_id:
            posts = posts.filter(book__book_id=book_id)
        
        if post_type:
            posts = posts.filter(type=post_type)

        posts = posts.order_by('-upvotes')

        if limit and limit.isdigit():
            posts = posts[:int(limit)]
        else:
            posts = posts[:5]  # default limit

        serializer = TopPostSerializer(posts, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class AddNoteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, discussion_id):
        content = request.data.get("content", "").strip()
        parent_note_id = request.data.get("parent_note_id", None)

        if not content:
            return Response({"detail": "Content is required."}, status=status.HTTP_400_BAD_REQUEST)
        if len(content) > 280:
            return Response({"detail": "Content exceeds 280 characters."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            discussion = Discussions.objects.get(discussion_id=discussion_id)
        except Discussions.DoesNotExist:
            return Response({"detail": "Discussion not found."}, status=status.HTTP_404_NOT_FOUND)

        parent_note = None
        if parent_note_id:
            try:
                parent_note = Notes.objects.get(note_id=parent_note_id)
            except Notes.DoesNotExist:
                return Response({"detail": "Parent note not found."}, status=status.HTTP_400_BAD_REQUEST)

        note = Notes.objects.create(
            note_id=uuid.uuid4(),
            discussion=discussion,
            user=request.user,
            content=content,
            parent_note=parent_note,
            thread=parent_note.thread if parent_note and parent_note.thread else parent_note,
            depth=(parent_note.depth + 1) if parent_note and parent_note.depth is not None else 0,
            created_at=now()
        )

        return Response({
            "note_id": str(note.note_id),
            "discussion_id": str(discussion.discussion_id),
            "user": {
                "user_id": str(request.user.id),
                "username": request.user.username
            },
            "content": note.content,
            "parent_note_id": str(parent_note.note_id) if parent_note else None
        }, status=status.HTTP_201_CREATED)