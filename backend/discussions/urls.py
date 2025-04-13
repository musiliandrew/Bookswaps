from django.urls import path
from .views import CreateDiscussionView, PostListView, PostDetailView, DeletePostView, NotesListView, LikeCommentView, UpvotePostView, ReprintPostView, ListTopPostsView, AddNoteView

urlpatterns = [
    path('posts/', CreateDiscussionView.as_view(), name='create-discussion'),
    path('posts/', PostListView.as_view(), name='list-posts'),
    path('posts/<uuid:discussion_id>/', PostDetailView.as_view(), name='view-post-detail'),
    path('posts/<uuid:discussion_id>/delete', DeletePostView.as_view(), name='delete-post'),
    path('posts/<uuid:discussion_id>/notes/', AddNoteView.as_view(), name='add_note'),
    path('posts/<uuid:discussion_id>/notes/', NotesListView.as_view(), name='list_comments'),
    path('notes/<uuid:note_id>/like', LikeCommentView.as_view(), name='like_comment'),
    path('posts/<uuid:discussion_id>/upvote/', UpvotePostView.as_view(), name='upvote_post'),
    path('posts/<uuid:discussion_id>/reprint/', ReprintPostView.as_view(), name='reprint_post'),
    path('top-posts/', ListTopPostsView.as_view(), name='top_posts'),
]
