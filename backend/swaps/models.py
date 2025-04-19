from django.db import models
from backend.library.models import Books
from django.conf import settings
from backend.users.models import CustomUser
import uuid
from django.core.exceptions import ValidationError

class Swaps(models.Model):
    swap_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    initiator = models.ForeignKey('users.CustomUser', related_name='initiated_swaps', on_delete=models.SET_NULL, null=True)
    receiver = models.ForeignKey('users.CustomUser', related_name='received_swaps', on_delete=models.SET_NULL, null=True)
    initiator_book = models.ForeignKey('library.Books', related_name='initiated_swaps', on_delete=models.SET_NULL, null=True)
    receiver_book = models.ForeignKey('library.Books', related_name='received_swaps', on_delete=models.SET_NULL, null=True, blank=True)
    status = models.CharField(max_length=20, choices=[
        ('Requested', 'Requested'),
        ('Accepted', 'Accepted'),
        ('Confirmed', 'Confirmed'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled')
    ], default='Requested')
    meetup_location = models.ForeignKey(
        'swaps.Locations',
        related_name='swaps',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_comment='Public location for swap meetup'
    )
    meetup_time = models.DateTimeField(null=True, blank=True)
    locked_until = models.DateTimeField(null=True, blank=True)
    qr_code_id = models.TextField(unique=True, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'swaps'
        db_table_comment = 'Manages book swaps and borrows'
        indexes = [
            models.Index(fields=['initiator', 'receiver']),
            models.Index(fields=['status']),
        ]

    def __str__(self):
        return f"Swap {self.swap_id}: {self.initiator.username if self.initiator else 'Anonymous'} ↔ {self.receiver.username if self.receiver else 'Anonymous'}"
        
        
class Shares(models.Model):
    share_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        CustomUser,
        related_name='shares',
        on_delete=models.SET_NULL,  # Changed from DO_NOTHING for data integrity
        blank=True,
        null=True
    )
    content_type = models.CharField(
        max_length=20,
        choices=[
            ('book', 'Book'),
            ('discussion', 'Discussion'),
            ('profile', 'Profile'),
            ('swap', 'Swap'),
            ('society', 'Society')
        ],
        db_comment='Type of content being shared (e.g., book, discussion)'
    )
    content_id = models.UUIDField(db_comment='UUID of the shared content')
    destination = models.CharField(
        max_length=50,
        choices=[
            ('twitter', 'Twitter'),
            ('facebook', 'Facebook'),
            ('linkedin', 'LinkedIn'),
            ('external', 'External Link'),
            ('email', 'Email')
        ],
        db_comment='Where the content is shared'
    )
    platform = models.CharField(
        max_length=20,
        choices=[
            ('web', 'Web'),
            ('mobile', 'Mobile'),
            ('api', 'API')
        ],
        blank=True,
        null=True,
        db_comment='Platform that initiated the share (e.g., Web, Mobile)'
    )
    is_reshare = models.BooleanField(
        default=False,
        db_comment='Marks whether a share is original or repeated'
    )
    metadata = models.JSONField(
        blank=True,
        null=True,
        db_comment='Stores additional sharing metadata (e.g., {"url": "...", "text": "..."})'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'shares'
        db_table_comment = 'Tracks sharing of books, discussions, profiles, and swaps for visibility analysis'
        unique_together = (('user', 'content_type', 'content_id', 'destination'),)
        indexes = [
            models.Index(fields=['user', 'content_type', 'content_id']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        username = self.user.username if self.user else 'Anonymous'
        return f"{username} shared {self.content_type} on {self.destination}"
        
class Notifications(models.Model):
    notification_id = models.UUIDField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.DO_NOTHING, blank=True, null=True)
    book = models.ForeignKey(Books, models.DO_NOTHING, blank=True, null=True)
    type = models.TextField(db_comment='Type of notification for UI segmentation and tracking')
    message = models.TextField()
    is_read = models.BooleanField(blank=True, null=True, db_comment='Tracks read/unread state for engagement metrics')
    is_archived = models.BooleanField(blank=True, null=True)
    delivered_at = models.DateTimeField(blank=True, null=True, db_comment='Delivery timestamp for latency and alert system diagnostics')
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'notifications'
        db_table_comment = 'Sends alerts for swaps, bookmarks, chats, and system events'
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"{self.user.username}: {self.type} notification"
        
def validate_coords(value):
    """Ensure coords is a JSON object with latitude and longitude."""
    if not isinstance(value, dict):
        raise ValidationError("Coords must be a JSON object.")
    if 'latitude' not in value or 'longitude' not in value:
        raise ValidationError("Coords must include latitude and longitude.")
    try:
        float(value['latitude'])
        float(value['longitude'])
    except (TypeError, ValueError):
        raise ValidationError("Latitude and longitude must be numbers.")

class Locations(models.Model):
    location_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255, db_comment='Name of the location (e.g., Central Library)')
    type = models.CharField(
        max_length=50,
        choices=[
            ('library', 'Library'),
            ('cafe', 'Cafe'),
            ('bookstore', 'Bookstore'),
            ('park', 'Park'),
            ('other', 'Other')
        ],
        db_comment='Type of exchange spot'
    )
    coords = models.JSONField(
        validators=[validate_coords],
        db_comment='Geo-coordinates used for midpoint calculation and scan verification (e.g., {"latitude": 41.8781, "longitude": -87.6298})'
    )
    city = models.CharField(max_length=100, db_comment='City of the location')
    rating = models.FloatField(blank=True, null=True, db_comment='User or source rating (0-5)')
    last_fetched = models.DateTimeField(blank=True, null=True, db_comment='When data was last updated')
    source = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        db_comment='Data source (e.g., Google, OSM)'
    )
    verified = models.BooleanField(
        default=False,
        db_comment='True if spot is human-vetted'
    )
    popularity_score = models.FloatField(
        blank=True,
        null=True,
        db_comment='Ranking metric based on usage and rating'
    )
    is_active = models.BooleanField(
        default=True,
        db_comment='True if location is available for swaps'
    )

    class Meta:
        db_table = 'locations'
        unique_together = (('name', 'city'),)
        db_table_comment = 'Caches public exchange spots with coordinates and ratings for swap logic'
        indexes = [
            models.Index(fields=['city']),
            models.Index(fields=['type', 'is_active']),
            models.Index(fields=['popularity_score']),
        ]

    def __str__(self):
        return f"{self.name}, {self.city} ({self.coords.get('latitude', 'N/A')}, {self.coords.get('longitude', 'N/A')})"