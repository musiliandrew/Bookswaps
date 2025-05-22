from django.db import models
from django.conf import settings
import uuid
from backend.library.models import Book

class Discussion(models.Model):
    discussion_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    type = models.CharField(max_length=20, choices=[('Article', 'Article'), ('Synopsis', 'Synopsis'), ('Query', 'Query')])
    title = models.CharField(max_length=200)
    content = models.TextField()
    book = models.ForeignKey(Book, on_delete=models.SET_NULL, null=True, blank=True)
    tags = models.JSONField(default=list)
    media_urls = models.JSONField(default=list)
    spoiler_flag = models.BooleanField(default=False)
    status = models.CharField(max_length=20, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    last_edited_at = models.DateTimeField(auto_now=True)
    views = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'discussions'
        db_table_comment = 'Stores user discussions'

class Note(models.Model):
    note_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE, related_name='notes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    parent_note = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True)
    depth = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=20, default='active')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notes'
        db_table_comment = 'Stores comments on discussions'

class Like(models.Model):
    like_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    note = models.ForeignKey(Note, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'likes'
        db_table_comment = 'Stores note likes'
        unique_together = (('note', 'user'),)
        indexes = [models.Index(fields=['note', 'user'])]

class Upvote(models.Model):
    upvote_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE, related_name='upvotes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'upvotes'
        db_table_comment = 'Stores discussion upvotes'
        unique_together = (('discussion', 'user'),)
        indexes = [models.Index(fields=['discussion', 'user'])]
class Reprint(models.Model):
    reprint_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE, related_name='reprints')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reprints'
        db_table_comment = 'Stores discussion shares'

class Society(models.Model):
    STATUS_CHOICES = (
        ('ACTIVE', 'Active'),
        ('INACTIVE', 'Inactive'),
        ('ARCHIVED', 'Archived'),
    )
    VISIBILITY_CHOICES = (
        ('public', 'Public'),
        ('private', 'Private'),
    )

    society_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True, null=True)
    creator = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True
    )
    visibility = models.CharField(max_length=20, choices=VISIBILITY_CHOICES, default='public')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    focus_type = models.CharField(
        max_length=20,
        choices=[('Book', 'Book'), ('Genre', 'Genre')],
        blank=True,
        null=True
    )
    focus_id = models.CharField(
        max_length=36,
        blank=True,
        null=True,
        db_comment='UUID for Book or genre string'
    )
    icon_url = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'societies'
        db_table_comment = 'Stores Societies for discussions and group chats'
        indexes = [models.Index(fields=['focus_type', 'focus_id'])]

    def __str__(self):
        return f"{self.name} ({self.focus_type or 'General'})"

class SocietyMember(models.Model):
    STATUS_CHOICES = (
        ('ACTIVE', 'Active'),
        ('PENDING', 'Pending'),
        ('BANNED', 'Banned'),
        ('REMOVED', 'Removed'),
    )
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('member', 'Member'),
    )

    member_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    society = models.ForeignKey(Society, on_delete=models.CASCADE, related_name='members')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'society_members'
        unique_together = (('society', 'user'),)
        db_table_comment = 'Tracks Society membership and roles'
        indexes = [models.Index(fields=['society', 'user'])]

    def __str__(self):
        return f"{self.user.username} in {self.society.name} ({self.role})"

class SocietyEvent(models.Model):
    event_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    society = models.ForeignKey(Society, on_delete=models.CASCADE, related_name='events')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    book = models.ForeignKey(Book, on_delete=models.SET_NULL, null=True, blank=True)
    event_date = models.DateTimeField()
    location = models.CharField(max_length=200, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'society_events'
        db_table_comment = 'Stores Society events'

class SocietyMessage(models.Model):
    STATUS_CHOICES = (
        ('ACTIVE', 'Active'),
        ('EDITED', 'Edited'),
        ('DELETED', 'Deleted'),
        ('FLAGGED', 'Flagged'),
    )

    message_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    society = models.ForeignKey(Society, on_delete=models.CASCADE, related_name='messages')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    book = models.ForeignKey(
        Book,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    is_pinned = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ACTIVE')
    created_at = models.DateTimeField(auto_now_add=True)
    edited_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'society_messages'
        db_table_comment = 'Stores Society group chat messages'
        indexes = [
            models.Index(fields=['society']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.user.username} in {self.society.name}: {self.content[:50]}..."
    
class Upvote(models.Model):
    upvote_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    discussion = models.ForeignKey(Discussion, on_delete=models.CASCADE, related_name='upvotes')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'upvotes'
        db_table_comment = 'Stores discussion upvotes'
        unique_together = (('discussion', 'user'),)  # Prevent duplicate upvotes
        indexes = [models.Index(fields=['discussion', 'user'])]

    def __str__(self):
        return f"{self.user.username} upvoted {self.discussion.title}"