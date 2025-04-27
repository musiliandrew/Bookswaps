from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings
import uuid
import re
#from backend.swaps.models import Swap


def validate_isbn(value):
    """Validate ISBN-10 or ISBN-13 format."""
    if not value:
        return
    cleaned = re.sub(r'[- ]', '', value)
    if not re.match(r'^(?:97[89][0-9]{10}|[0-9]{9}[0-9X])$', cleaned):
        raise ValidationError("Invalid ISBN-10 or ISBN-13 format.")
    return cleaned


def validate_cover_image_url(value):
    """Sanitize cover image URL (HTTPS, valid domains)."""
    if not value:
        return
    if not value.startswith('https://'):
        raise ValidationError("Cover image URL must use HTTPS.")
    allowed_domains = ['openlibrary.org', 'bookswap-bucket.s3.amazonaws.com']
    if not any(domain in value for domain in allowed_domains):
        raise ValidationError("Cover image URL must be from an allowed domain.")
    return value


class Book(models.Model):
    book_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, db_comment='Book title')
    author = models.CharField(max_length=255, db_comment='Author(s), comma-separated or JSON')
    year = models.IntegerField(
        blank=True, null=True,
        validators=[MinValueValidator(0), MaxValueValidator(9999)],
        db_comment='Publication year'
    )
    genre = models.CharField(max_length=100, blank=True, null=True, db_comment='Book genre')
    isbn = models.CharField(
        max_length=13, unique=True, blank=True, null=True,
        validators=[validate_isbn], db_comment='ISBN-10 or ISBN-13'
    )
    cover_image_url = models.URLField(
        max_length=500, blank=True, null=True,
        validators=[validate_cover_image_url], db_comment='Cover image URL (Open Library or S3)'
    )
    original_owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name='originally_owned_books',
        on_delete=models.SET_NULL, blank=True, null=True,
        db_comment='User who first added the book'
    )
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, related_name='owned_books',
        on_delete=models.SET_NULL, blank=True, null=True,
        db_comment='Current owner of the book'
    )
    qr_code_url = models.URLField(
        max_length=500, unique=True, blank=True, null=True,
        db_comment='S3 URL for QR code used in swaps'
    )
    available_for_exchange = models.BooleanField(
        default=True, db_comment='True if available for swapping'
    )
    available_for_borrow = models.BooleanField(
        default=True, db_comment='True if available for borrowing'
    )
    condition = models.CharField(
        max_length=50, blank=True, null=True,
        choices=[('new', 'New'), ('good', 'Good'), ('fair', 'Fair'), ('poor', 'Poor')],
        db_comment='Physical condition of the book'
    )
    synopsis = models.TextField(blank=True, null=True, db_comment='Book summary')
    copy_count = models.IntegerField(
        default=1, validators=[MinValueValidator(1)],
        db_comment='Number of copies (for multiple identical books)'
    )
    locked_until = models.DateTimeField(
        blank=True, null=True, db_comment='Prevents re-swaps during cooldown'
    )
    created_at = models.DateTimeField(auto_now_add=True, db_comment='When book was added')
    updated_at = models.DateTimeField(auto_now=True, db_comment='When book was last updated')

    class Meta:
        db_table = 'books'
        db_table_comment = 'Central catalog tracking book ownership, metadata, and availability for swap/borrow'
        indexes = [
            models.Index(fields=['owner']),
            models.Index(fields=['isbn']),
            models.Index(fields=['available_for_exchange', 'available_for_borrow']),
        ]

    def __str__(self):
        return f"{self.title} by {self.author or 'Unknown'}"

    def clean(self):
        """Validate book constraints."""
        if self.copy_count < 1:
            raise ValidationError("Copy count must be positive.")
        if self.isbn:
            self.isbn = validate_isbn(self.isbn)


class BookHistory(models.Model):
    STATUS_CHOICES = [
        ('swapped', 'Swapped'),
        ('borrowed', 'Borrowed'),
        ('returned', 'Returned'),
        ('added', 'Added')
    ]

    history_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    book = models.ForeignKey(
        'Book', on_delete=models.CASCADE, related_name='history',
        db_comment='Book involved in the interaction'
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, blank=True, null=True,
        db_comment='User involved in the interaction'
    )
    swap = models.ForeignKey(
        'swaps.Swap', on_delete=models.SET_NULL, blank=True, null=True,
        db_comment='Associated swap (if applicable)'
    )
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES,
        db_comment='Type of interaction (swapped, borrowed, returned, added)'
    )
    start_date = models.DateTimeField(
        blank=True, null=True, db_comment='Start of interaction'
    )
    end_date = models.DateTimeField(
        blank=True, null=True, db_comment='End of interaction (e.g., return)'
    )
    notes = models.TextField(
        blank=True, null=True, db_comment='Optional comments about the interaction'
    )

    class Meta:
        db_table = 'book_history'
        db_table_comment = 'Ledger of all user-book interactions for transparency and timeline rendering'
        indexes = [
            models.Index(fields=['book']),
            models.Index(fields=['user']),
            models.Index(fields=['swap']),
            models.Index(fields=['start_date']),
        ]

    def __str__(self):
        username = self.user.username if self.user else 'Anonymous'
        return f"{self.book.title}: {self.status} by {username}"


class Bookmark(models.Model):
    bookmark_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='bookmarks',
        db_comment='User who bookmarked the book'
    )
    book = models.ForeignKey(
        'Book', on_delete=models.CASCADE, related_name='bookmarked_by',
        db_comment='Book of interest'
    )
    notify_on_available = models.BooleanField(
        default=False, db_comment='Notify user when book becomes available'
    )
    active = models.BooleanField(
        default=True, db_comment='True if bookmark is active'
    )
    notified_at = models.DateTimeField(
        blank=True, null=True, db_comment='When availability notification was sent'
    )
    created_at = models.DateTimeField(
        auto_now_add=True, db_comment='When bookmark was created'
    )

    class Meta:
        db_table = 'bookmarks'
        db_table_comment = 'Tracks user interest in books and notifies when available for exchange'
        unique_together = (('user', 'book'),)
        indexes = [
            models.Index(fields=['user', 'active']),
            models.Index(fields=['book', 'notify_on_available']),
        ]

    def __str__(self):
        return f"{self.user.username} bookmarked {self.book.title}"


class Favorite(models.Model):
    favorite_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='favorites',
        db_comment='User who favorited the book'
    )
    book = models.ForeignKey(
        'Book', on_delete=models.CASCADE, related_name='favorited_by',
        db_comment='Favorite book'
    )
    reason = models.TextField(
        blank=True, null=True, db_comment='Why the book was favorited'
    )
    active = models.BooleanField(
        default=True, db_comment='True if favorite is active'
    )
    notified_on_match = models.BooleanField(
        default=False, db_comment='Notify user on matching recommendations'
    )
    created_at = models.DateTimeField(
        auto_now_add=True, db_comment='When favorite was created'
    )

    class Meta:
        db_table = 'favorites'
        db_table_comment = 'Stores users’ favorite books to drive ExchangeNow and Favourites tab'
        unique_together = (('user', 'book'),)
        indexes = [
            models.Index(fields=['user', 'active']),
            models.Index(fields=['book']),
        ]

    def __str__(self):
        return f"{self.user.username} favorited {self.book.title}"


class Library(models.Model):
    library_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='library',
        db_comment='User who owns the library entry'
    )
    book = models.ForeignKey(
        'Book', on_delete=models.CASCADE, related_name='library_entries',
        db_comment='Book in the user’s library'
    )
    status = models.CharField(
        max_length=20, 
        choices=[('owned', 'Owned'), ('borrowed', 'Borrowed'), ('exchanged', 'Exchanged')],
        db_comment='Status of the book in the user’s library'
    )
    added_at = models.DateTimeField(
        auto_now_add=True, db_comment='When book was added to library'
    )
    last_status_change_at = models.DateTimeField(
        auto_now=True, db_comment='When status last changed'
    )

    class Meta:
        db_table = 'libraries'
        db_table_comment = 'Links users to their books, forming their personal library and swap trail'
        unique_together = (('user', 'book'),)
        indexes = [
            models.Index(fields=['user']),
            models.Index(fields=['book']),
        ]

    def __str__(self):
        return f"{self.user.username}’s {self.book.title} ({self.status})"


class PopularBook(models.Model):
    book = models.OneToOneField(
        'Book', on_delete=models.CASCADE, primary_key=True,
        db_comment='Book with popularity metrics'
    )
    swap_count = models.PositiveIntegerField(
        default=0, db_comment='Number of swaps for this book'
    )
    last_updated = models.DateTimeField(
        auto_now=True, db_comment='When popularity was last updated'
    )

    class Meta:
        db_table = 'popular_books'
        db_table_comment = 'Tracks book swap popularity for recommendations'

    def __str__(self):
        return f"{self.book.title}: {self.swap_count} swaps"