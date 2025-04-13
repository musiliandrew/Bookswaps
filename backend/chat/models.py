from django.db import models
from backend.library.models import Books
from django.conf import settings



class Chats(models.Model):
    chat_id = models.UUIDField(primary_key=True)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, models.DO_NOTHING, blank=True, null=True)
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, models.DO_NOTHING, related_name='chats_receiver_set', blank=True, null=True)
    content = models.TextField()
    status = models.TextField(blank=True, null=True, db_comment='Tracks chat lifecycle (Unread, Read, Replied)')
    book = models.ForeignKey(Books, models.DO_NOTHING, blank=True, null=True, db_comment='Links to ExchangeNow swaps for contextual chats')
    parent_chat = models.ForeignKey('self', models.DO_NOTHING, blank=True, null=True)
    is_deleted_by_sender = models.BooleanField(blank=True, null=True, db_comment='Used to soft-delete from sender view')
    is_deleted_by_receiver = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)
    updated_at = models.DateTimeField(blank=True, null=True, db_comment='Tracks last update (e.g., message edited, read)')

    class Meta:
        db_table = 'chats'
        db_table_comment = 'Stores private Chat Forum messages'
        indexes = [
            models.Index(fields=['sender', 'receiver']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.sender.username} to {self.receiver.username}: {self.content[:50]}..."

class Societies(models.Model):
    society_id = models.UUIDField(primary_key=True)
    name = models.TextField()
    description = models.TextField(blank=True, null=True)
    focus_type = models.TextField(blank=True, null=True)
    focus_id = models.TextField(blank=True, null=True, db_comment='Links to Books.book_id or genre string')
    icon_url = models.TextField(blank=True, null=True)
    creator = models.ForeignKey(settings.AUTH_USER_MODEL, models.DO_NOTHING, blank=True, null=True)
    is_public = models.BooleanField(blank=True, null=True)
    status = models.TextField(blank=True, null=True, db_comment='Lifecycle state: Active, Inactive, Archived')
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'societies'
        db_table_comment = 'Stores Chat Forum Societies (group chats)'
        indexes = [models.Index(fields=['focus_type', 'focus_id'])]

    def __str__(self):
        return f"{self.name} ({self.focus_type})"
        
class SocietyMembers(models.Model):
    member_id = models.UUIDField(primary_key=True)
    society = models.ForeignKey(Societies, models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.DO_NOTHING, blank=True, null=True)
    role = models.TextField(blank=True, null=True)
    status = models.TextField(blank=True, null=True, db_comment='Active, Pending, Removed, or Banned membership state')
    is_creator = models.BooleanField(blank=True, null=True, db_comment='True if user is the founding member of the society')
    joined_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'society_members'
        unique_together = (('society', 'user'),)
        db_table_comment = 'Tracks Society membership, roles, and member lifecycle'
        indexes = [models.Index(fields=['society', 'user'])]

    def __str__(self):
        return f"{self.user.username} in {self.society.name} ({self.role})"


class SocietyMessages(models.Model):
    message_id = models.UUIDField(primary_key=True)
    society = models.ForeignKey(Societies, models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.DO_NOTHING, blank=True, null=True)
    content = models.TextField()
    book = models.ForeignKey(Books, models.DO_NOTHING, blank=True, null=True)
    is_pinned = models.BooleanField(blank=True, null=True, db_comment='Highlights key group messages in UI')
    status = models.TextField(blank=True, null=True, db_comment='Tracks message state: active, edited, flagged, or deleted')
    created_at = models.DateTimeField(blank=True, null=True)
    edited_at = models.DateTimeField(blank=True, null=True, db_comment='Timestamp of last message edit')

    class Meta:
        db_table = 'society_messages'
        db_table_comment = 'Stores Society chat messages for group interactions'
        indexes = [
            models.Index(fields=['society']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.user.username} in {self.society.name}: {self.content[:50]}..."