from django.urls import path
from .views import (
    SendMessageView, EditMessageView, DeleteMessageView, MessageListView, MarkReadView,
    AddReactionView, ListReactionsView, CreateSocietyView, JoinSocietyView, LeaveSocietyView,
    SocietyListView, SendSocietyMessageView, EditSocietyMessageView, DeleteSocietyMessageView,
    SocietyMessageListView, PinMessageView
)

app_name = 'chat'

urlpatterns = [
    path('messages/send/', SendMessageView.as_view(), name='send_message'),
    path('messages/<uuid:chat_id>/edit/', EditMessageView.as_view(), name='edit_message'),
    path('messages/<uuid:chat_id>/delete/', DeleteMessageView.as_view(), name='delete_message'),
    path('messages/<uuid:chat_id>/read/', MarkReadView.as_view(), name='mark_read'),
    path('messages/<uuid:chat_id>/react/', AddReactionView.as_view(), name='add_reaction'),
    path('messages/<uuid:chat_id>/reactions/', ListReactionsView.as_view(), name='list_reactions'),
    path('messages/', MessageListView.as_view(), name='message_list'),
    path('societies/', CreateSocietyView.as_view(), name='create_society'),
    path('societies/<uuid:society_id>/join/', JoinSocietyView.as_view(), name='join_society'),
    path('societies/<uuid:society_id>/leave/', LeaveSocietyView.as_view(), name='leave_society'),
    path('societies/', SocietyListView.as_view(), name='list_societies'),
    path('societies/<uuid:society_id>/messages/', SocietyMessageListView.as_view(), name='society_messages'),
    path('societies/<uuid:society_id>/messages/send/', SendSocietyMessageView.as_view(), name='send_society_message'),
    path('societies/<uuid:society_id>/messages/<uuid:message_id>/edit/', EditSocietyMessageView.as_view(), name='edit_society_message'),
    path('societies/<uuid:society_id>/messages/<uuid:message_id>/delete/', DeleteSocietyMessageView.as_view(), name='delete_society_message'),
    path('societies/<uuid:society_id>/messages/<uuid:message_id>/pin/', PinMessageView.as_view(), name='pin_society_message'),
    path('societies/<uuid:society_id>/messages/<uuid:message_id>/react/', AddReactionView.as_view(), name='add_society_reaction'),
    path('societies/<uuid:society_id>/messages/<uuid:message_id>/reactions/', ListReactionsView.as_view(), name='list_society_reactions'),
]