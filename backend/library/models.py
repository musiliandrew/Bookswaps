from django.db import models
from django.conf import settings


class BookHistory(models.Model):
    history_id = models.UUIDField(primary_key=True)
    book = models.ForeignKey('Books', models.DO_NOTHING)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.DO_NOTHING, blank=True, null=True)
    status = models.TextField(db_comment='Captures type of custody: ownership, borrowing, or swapping')
    start_date = models.DateTimeField(blank=True, null=True)
    end_date = models.DateTimeField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True, db_comment='Optional comments about the book or transaction')
    source = models.TextField(blank=True, null=True)

    class Meta:
        db_table = 'book_history'
        db_table_comment = 'Ledger of all user-book interactions for transparency and timeline rendering'


class Bookmarks(models.Model):
    bookmark_id = models.UUIDField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.DO_NOTHING, blank=True, null=True)
    book = models.ForeignKey('Books', models.DO_NOTHING, blank=True, null=True)
    notify_on_available = models.BooleanField(blank=True, null=True, db_comment='Whether user wants to be alerted on availability')
    active = models.BooleanField(blank=True, null=True, db_comment='Soft-deletion toggle for managing bookmarks without purging history')
    notified_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'bookmarks'
        db_table_comment = 'Tracks user interest in books and optionally notifies when available for exchange'


class Books(models.Model):
    book_id = models.UUIDField(primary_key=True)
    title = models.TextField()
    author = models.TextField()
    year = models.IntegerField(blank=True, null=True)
    genre = models.TextField(blank=True, null=True)
    isbn = models.TextField(unique=True, blank=True, null=True)
    cover_image_url = models.TextField(blank=True, null=True)
    original_owner = models.ForeignKey(settings.AUTH_USER_MODEL, models.DO_NOTHING, blank=True, null=True)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, models.DO_NOTHING, related_name='books_owner_set', blank=True, null=True)
    qr_code_id = models.TextField(unique=True, db_comment='Ties book to physical instance via QR. Used during swaps.')
    available_for_exchange = models.BooleanField(blank=True, null=True)
    available_for_borrow = models.BooleanField(blank=True, null=True)
    condition = models.TextField(blank=True, null=True)
    synopsis = models.TextField(blank=True, null=True)
    copy_count = models.IntegerField(blank=True, null=True)
    locked_until = models.DateTimeField(blank=True, null=True, db_comment='Prevents immediate re-swaps, enforces cooling-off post-exchange.')
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'books'
        db_table_comment = 'Central catalog tracking book ownership, metadata, and availability for swap/borrow.'
        
        
class Favorites(models.Model):
    favorite_id = models.UUIDField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.DO_NOTHING, blank=True, null=True)
    book = models.ForeignKey(Books, models.DO_NOTHING, blank=True, null=True)
    reason = models.TextField(blank=True, null=True, db_comment='Captures why the book was favorited for future personalization')
    active = models.BooleanField(blank=True, null=True, db_comment='Soft deletion to track un-favorited books without losing data')
    notified_on_match = models.BooleanField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'favorites'
        db_table_comment = 'Stores users’ favorite books to drive ExchangeNow and Favourites tab'

class Libraries(models.Model):
    library_id = models.UUIDField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.DO_NOTHING, blank=True, null=True)
    book = models.ForeignKey(Books, models.DO_NOTHING)
    status = models.TextField(blank=True, null=True, db_comment='Tracks whether book is owned, exchanged, or borrowed by the user')
    added_at = models.DateTimeField(blank=True, null=True)
    last_status_change_at = models.DateTimeField(blank=True, null=True, db_comment='Tracks last transition for audit or analytics')

    class Meta:
        db_table = 'libraries'
        unique_together = (('user', 'book'),)
        db_table_comment = 'Links users to their books, forming their personal library and swap trail'
