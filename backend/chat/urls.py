from django.urls import path
from .views import SendMessageView, MessageListView, MarkReadView, CreateSocietyView, JoinSocietyView, LeaveSocietyView, SocietyListView, SendSocietyMessageView, PinMessageView, SocietyListView

urlpatterns = [
    path('messages/', SendMessageView.as_view(), name='send-private-message'),
    path('messages/', MessageListView.as_view(), name='chat-message-list'),
    path('messages/<uuid:chat_id>/read/', MarkReadView.as_view(), name='mark-message-read'),
    path('societies/', CreateSocietyView.as_view(), name='create-society'),
    path('societies/', SocietyListView.as_view(),name='list-societies'),
    path('societies/<uuid:society_id>/join/', JoinSocietyView.as_view(), name='join_society'),
    path('societies/<uuid:society_id>/leave/', LeaveSocietyView.as_view(), name='leave_society'),
    path('societies/<uuid:society_id>/messages/', SocietyListView.as_view(), name='society-list'),
    path('chat/societies/<uuid:society_id>/messages/', SendSocietyMessageView.as_view(), name='send-society-message'),
    path('societies/<uuid:society_id>/messages/<uuid:message_id>/pin/',PinMessageView.as_view(),name='pin-society-message'),
]
