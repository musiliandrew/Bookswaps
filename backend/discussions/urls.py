from django.urls import path, re_path
from .views import (
    CreateDiscussionView, PostListView, PostDetailView, DeletePostView,
    AddNoteView, NotesListView, LikeCommentView, UpvotePostView, ReprintPostView,
    ListTopPostsView
)
from . import consumers

app_name = 'discussions'

urlpatterns = [
    path('posts/', CreateDiscussionView.as_view(), name='create_discussion'),
    path('posts/list/', PostListView.as_view(), name='list_posts'),
    path('posts/<uuid:discussion_id>/', PostDetailView.as_view(), name='post_detail'),
    path('posts/<uuid:discussion_id>/delete/', DeletePostView.as_view(), name='delete_post'),
    path('posts/<uuid:discussion_id>/notes/', AddNoteView.as_view(), name='add_note'),
    path('posts/<uuid:discussion_id>/notes/list/', NotesListView.as_view(), name='list_notes'),
    path('notes/<uuid:note_id>/like/', LikeCommentView.as_view(), name='like_note'),
    path('posts/<uuid:discussion_id>/upvote/', UpvotePostView.as_view(), name='upvote_post'),
    path('posts/<uuid:discussion_id>/reprint/', ReprintPostView.as_view(), name='reprint_post'),
    path('top-posts/', ListTopPostsView.as_view(), name='top_posts'),
    re_path(r'^ws/discussions/(?P<discussion_id>[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/$', consumers.DiscussionConsumer.as_asgi()),
]