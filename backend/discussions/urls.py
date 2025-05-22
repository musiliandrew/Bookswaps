from django.urls import path
from .views import (
    CreateDiscussionView, PostListView, PostDetailView, DeletePostView,
    AddNoteView, NotesListView, LikeCommentView, UpvotePostView, ReprintPostView,
    ListTopPostsView, CreateSocietyView, SocietyDetailView, JoinSocietyView,
    LeaveSocietyView, CreateSocietyEventView, SocietyEventListView
)

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
    path('societies/', CreateSocietyView.as_view(), name='create_society'),
    path('societies/<uuid:society_id>/', SocietyDetailView.as_view(), name='society_detail'),
    path('societies/<uuid:society_id>/join/', JoinSocietyView.as_view(), name='join_society'),
    path('societies/<uuid:society_id>/leave/', LeaveSocietyView.as_view(), name='leave_society'),
    path('societies/<uuid:society_id>/events/', CreateSocietyEventView.as_view(), name='create_society_event'),
    path('societies/<uuid:society_id>/events/', SocietyEventListView.as_view(), name='list_society_events'),
    # WebSocket placeholder: /ws/discussions/<discussion_id>/
]