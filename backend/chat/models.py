from django.db import models
from django.conf import settings
from backend.library.models import Book
import uuid

class Chats(models.Model):
    STATUS_CHOICES = (
        ('UNREAD', 'Unread'),
        ('READ', 'Read'),
        ('REPLIED', 'Replied'),
    )

    chat_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='sent_chats'
    )
    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='received_chats'
    )
    content = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='UNREAD')
    book = models.ForeignKey(
        Book,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_comment='Links to ExchangeNow swaps'
    )
    is_deleted_by_sender = models.BooleanField(default=False)
    is_deleted_by_receiver = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True, db_comment='Tracks last update')
    edited_at = models.DateTimeField(auto_now=True, db_comment='Tracks last edit')

    class Meta:
        db_table = 'chats'
        db_table_comment = 'Stores private Chat Forum messages'
        indexes = [
            models.Index(fields=['sender', 'receiver']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.sender.username if self.sender else 'Deleted'} to {self.receiver.username if self.receiver else 'Deleted'}: {self.content[:50]}..."

class MessageReaction(models.Model):
    REACTION_CHOICES = (
        ('LIKE', 'Like'),
        ('LOVE', 'Love'),
        ('HAHA', 'Haha'),
        ('WOW', 'Wow'),
        ('SAD', 'Sad'),
    )

    reaction_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    chat = models.ForeignKey(
        Chats,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='reactions'
    )
    society_message = models.ForeignKey(
        'discussions.SocietyMessage',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='reactions'
    )
    reaction_type = models.CharField(max_length=20, choices=REACTION_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'message_reactions'
        db_table_comment = 'Stores reactions to private and society messages'
        indexes = [
            models.Index(fields=['chat']),
            models.Index(fields=['society_message']),
        ]

    def __str__(self):
        target = self.chat or self.society_message
        return f"{self.user.username} reacted {self.reaction_type} to {target}"