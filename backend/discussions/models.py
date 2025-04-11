from django.db import models
from backend.library.models import Books
from django.conf import settings


class Discussions(models.Model):
    discussion_id = models.UUIDField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.DO_NOTHING, blank=True, null=True)
    type = models.TextField()
    book = models.ForeignKey(Books, models.DO_NOTHING, blank=True, null=True)
    title = models.TextField()
    content = models.TextField()
    tags = models.TextField(blank=True, null=True)  # This field type is a guess.
    media_urls = models.TextField(blank=True, null=True)  # This field type is a guess.
    spoiler_flag = models.BooleanField(blank=True, null=True, db_comment='Warns users if post contains major plot details')
    upvotes = models.IntegerField(blank=True, null=True)
    views = models.IntegerField(blank=True, null=True)
    status = models.TextField(blank=True, null=True, db_comment='Controls visibility and moderation state of a post')
    created_at = models.DateTimeField(blank=True, null=True)
    last_edited_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'discussions'
        db_table_comment = 'User-generated content around books for community interaction'


class Notes(models.Model):
    note_id = models.UUIDField(primary_key=True)
    discussion = models.ForeignKey(Discussions, models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.DO_NOTHING, blank=True, null=True)
    content = models.TextField(db_comment='Limited to 280 chars to ensure short-form responses')
    likes = models.IntegerField(blank=True, null=True)
    parent_note = models.ForeignKey('self', models.DO_NOTHING, blank=True, null=True)
    thread = models.ForeignKey('self', models.DO_NOTHING, related_name='notes_thread_set', blank=True, null=True, db_comment='Groups notes into top-level threads for organized display')
    depth = models.IntegerField(blank=True, null=True)
    status = models.TextField(blank=True, null=True, db_comment='Controls moderation visibility of the comment')
    created_at = models.DateTimeField(blank=True, null=True)
    edited_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'notes'
        db_table_comment = 'Stores threaded comments under Discussion posts'

class Reprints(models.Model):
    reprint_id = models.UUIDField(primary_key=True)
    discussion = models.ForeignKey(Discussions, models.DO_NOTHING, blank=True, null=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.DO_NOTHING, blank=True, null=True)
    comment = models.TextField(blank=True, null=True, db_comment='Optional personal comment (max 280 chars)')
    status = models.TextField(blank=True, null=True, db_comment='For content moderation and visibility control')
    created_at = models.DateTimeField(blank=True, null=True)
    edited_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'reprints'
        db_table_comment = 'Tracks reposts of Discussion Tab posts (Reprints)'