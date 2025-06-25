from django.db import models
import uuid
from django.utils import timezone

class Chats(models.Model):
    STATUS_CHOICES = (
        ('SENT', 'Sent'),
        ('DELIVERED', 'Delivered'),
        ('READ', 'Read'),
        ('REPLIED', 'Replied'),
    )

    MESSAGE_TYPE_CHOICES = (
        ('TEXT', 'Text'),
        ('IMAGE', 'Image'),
        ('AUDIO', 'Audio'),
        ('VIDEO', 'Video'),
        ('VOICE_NOTE', 'Voice Note'),
        ('BOOK_REFERENCE', 'Book Reference'),
        ('FILE', 'File'),
    )

    chat_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sender = models.ForeignKey(
        'users.CustomUser',
        on_delete=models.SET_NULL,
        null=True,
        related_name='sent_chats'
    )
    receiver = models.ForeignKey(
        'users.CustomUser',
        on_delete=models.SET_NULL,
        null=True,
        related_name='received_chats'
    )
    content = models.TextField(blank=True, null=True)  # Optional for media messages
    message_type = models.CharField(max_length=20, choices=MESSAGE_TYPE_CHOICES, default='TEXT')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SENT')

    # Media fields
    media_url = models.URLField(max_length=500, blank=True, null=True, db_comment='URL for uploaded media files')
    media_thumbnail = models.URLField(max_length=500, blank=True, null=True, db_comment='Thumbnail for videos/images')
    media_duration = models.IntegerField(blank=True, null=True, db_comment='Duration in seconds for audio/video')
    media_size = models.BigIntegerField(blank=True, null=True, db_comment='File size in bytes')
    media_filename = models.CharField(max_length=255, blank=True, null=True, db_comment='Original filename')

    book = models.ForeignKey(
        'library.Book',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_comment='Links to ExchangeNow swaps'
    )

    # Message status tracking
    sent_at = models.DateTimeField(default=timezone.now)
    delivered_at = models.DateTimeField(blank=True, null=True)
    read_at = models.DateTimeField(blank=True, null=True)

    is_deleted_by_sender = models.BooleanField(default=False)
    is_deleted_by_receiver = models.BooleanField(default=False)
    created_at = models.DateTimeField(default=timezone.now)
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
        content_preview = self.content[:50] if self.content else f"[{self.message_type}]"
        return f"{self.sender.username if self.sender else 'Deleted'} to {self.receiver.username if self.receiver else 'Deleted'}: {content_preview}..."

    def mark_as_delivered(self):
        """Mark message as delivered"""
        if self.status == 'SENT':
            self.status = 'DELIVERED'
            self.delivered_at = timezone.now()
            self.save(update_fields=['status', 'delivered_at'])

    def mark_as_read(self):
        """Mark message as read"""
        if self.status in ['SENT', 'DELIVERED']:
            self.status = 'READ'
            self.read_at = timezone.now()
            self.save(update_fields=['status', 'read_at'])


class ChatTypingStatus(models.Model):
    """Track typing status for real-time indicators"""
    typing_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        'users.CustomUser',
        on_delete=models.CASCADE,
        related_name='typing_statuses'
    )
    chat_partner = models.ForeignKey(
        'users.CustomUser',
        on_delete=models.CASCADE,
        related_name='partner_typing_statuses'
    )
    is_typing = models.BooleanField(default=False)
    last_typing_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'chat_typing_status'
        unique_together = ['user', 'chat_partner']
        indexes = [
            models.Index(fields=['user', 'chat_partner']),
            models.Index(fields=['last_typing_at']),
        ]

    def __str__(self):
        return f"{self.user.username} typing to {self.chat_partner.username}: {self.is_typing}"

class MessageReaction(models.Model):
    REACTION_CHOICES = (
        ('LIKE', 'Like'),
        ('LOVE', 'Love'),
        ('HAHA', 'Haha'),
        ('WOW', 'Wow'),
        ('SAD', 'Sad'),
        ('ANGRY', 'Angry'),
    )

    reaction_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        'users.CustomUser', 
        on_delete=models.CASCADE,
        related_name='reactions'
    )
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
            models.Index(fields=['user']),
        ]
        constraints = [
            models.CheckConstraint(
                check=models.Q(chat__isnull=False, society_message__isnull=True) |
                      models.Q(chat__isnull=True, society_message__isnull=False),
                name='one_message_type'
            ),
        ]

    def __str__(self):
        target = self.chat or self.society_message
        return f"{self.user.username} reacted {self.reaction_type} to {target}"