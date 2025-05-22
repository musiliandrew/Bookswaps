from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid
from backend.users.models import CustomUser
#from backend.library.models import Book
from django.conf import settings
from django.utils import timezone


def validate_coords(value):
    """Ensure coords is a JSON object with valid latitude and longitude."""
    if not isinstance(value, dict):
        raise ValidationError("Coords must be a JSON object.")
    if 'latitude' not in value or 'longitude' not in value:
        raise ValidationError("Coords must include latitude and longitude.")
    try:
        lat = float(value['latitude'])
        lon = float(value['longitude'])
        if not (-90 <= lat <= 90):
            raise ValidationError("Latitude must be between -90 and 90.")
        if not (-180 <= lon <= 180):
            raise ValidationError("Longitude must be between -180 and 180.")
    except (TypeError, ValueError):
        raise ValidationError("Latitude and longitude must be numbers.")


class Location(models.Model):
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
        db_comment='Geo-coordinates for midpoint calculation and scan verification (e.g., {"latitude": 41.8781, "longitude": -87.6298})'
    )
    city = models.CharField(max_length=100, db_comment='City of the location')
    rating = models.FloatField(
        blank=True,
        null=True,
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        db_comment='User or source rating (0-5)'
    )
    last_fetched = models.DateTimeField(
        blank=True,
        null=True,
        db_comment='When data was last updated from source'
    )
    source = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        db_comment='Data source (e.g., Google Maps, OSM)'
    )
    verified = models.BooleanField(
        default=False,
        db_comment='True if location is human-vetted'
    )
    popularity_score = models.FloatField(
        blank=True,
        null=True,
        db_comment='Ranking metric based on usage and rating (e.g., rating * usage_count)'
    )
    is_active = models.BooleanField(
        default=True,
        db_comment='True if location is available for swaps'
    )

    class Meta:
        db_table = 'locations'
        db_table_comment = 'Caches public exchange spots with coordinates and ratings for swap logic'
        unique_together = (('name', 'city'),)
        indexes = [
            models.Index(fields=['city']),
            models.Index(fields=['type', 'is_active']),
            models.Index(fields=['popularity_score']),
        ]

    def __str__(self):
        return f"{self.name}, {self.city} ({self.coords.get('latitude', 'N/A')}, {self.coords.get('longitude', 'N/A')})"

    @staticmethod
    def calculate_midpoint(coord1, coord2):
        """Calculate midpoint between two coordinates."""
        try:
            lat1 = float(coord1['latitude'])
            lon1 = float(coord1['longitude'])
            lat2 = float(coord2['latitude'])
            lon2 = float(coord2['longitude'])
            return {
                'latitude': (lat1 + lat2) / 2,
                'longitude': (lon1 + lon2) / 2
            }
        except (KeyError, TypeError, ValueError):
            raise ValidationError("Invalid coordinates for midpoint calculation.")


class Swap(models.Model):
    STATUS_CHOICES = [
        ('Requested', 'Requested'),
        ('Accepted', 'Accepted'),
        ('Confirmed', 'Confirmed'),
        ('Completed', 'Completed'),
        ('Cancelled', 'Cancelled')
    ]

    swap_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    initiator = models.ForeignKey(
        CustomUser,
        related_name='initiated_swaps',
        on_delete=models.SET_NULL,
        null=True,
        db_comment='User proposing the swap'
    )
    receiver = models.ForeignKey(
        CustomUser,
        related_name='received_swaps',
        on_delete=models.SET_NULL,
        null=True,
        db_comment='User receiving the swap proposal'
    )
    initiator_book = models.ForeignKey(
        'library.Book',
        related_name='initiated_swaps',
        on_delete=models.SET_NULL,
        null=True,
        db_comment='Book offered by initiator'
    )
    receiver_book = models.ForeignKey(
        'library.Book',
        related_name='received_swaps',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_comment='Book offered by receiver (optional)'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='Requested',
        db_comment='Current status of the swap'
    )
    meetup_location = models.ForeignKey(
        Location,
        related_name='swaps',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_comment='Public location for swap meetup'
    )
    meetup_time = models.DateTimeField(
        null=True,
        blank=True,
        db_comment='Scheduled meetup time'
    )
    locked_until = models.DateTimeField(
        null=True,
        blank=True,
        db_comment='Time until swap is locked (e.g., pending confirmation)'
    )
    qr_code_url = models.URLField(
        max_length=500,
        null=True,
        blank=True,
        unique=True,
        db_comment='S3 URL for QR code used in swap confirmation'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_comment='When swap was created'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        db_comment='When swap was last updated'
    )

    class Meta:
        db_table = 'swaps'
        db_table_comment = 'Manages book swaps between users'
        indexes = [
            models.Index(fields=['initiator']),
            models.Index(fields=['receiver']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        initiator = self.initiator.username if self.initiator else 'Anonymous'
        receiver = self.receiver.username if self.receiver else 'Anonymous'
        return f"Swap {self.swap_id}: {initiator} ↔ {receiver}"

    def clean(self):
        """Validate swap constraints."""
        if self.initiator == self.receiver:
            raise ValidationError("Initiator and receiver cannot be the same user.")
        if self.initiator_book and self.initiator and self.initiator_book.user != self.initiator:
            raise ValidationError("Initiator book must belong to initiator.")
        if self.receiver_book and self.receiver and self.receiver_book.user != self.receiver:
            raise ValidationError("Receiver book must belong to receiver.")

    def set_status(self, new_status):
        """Update status with valid transitions."""
        valid_transitions = {
            'Requested': ['Accepted', 'Cancelled'],
            'Accepted': ['Confirmed', 'Cancelled'],
            'Confirmed': ['Completed', 'Cancelled'],
            'Completed': [],
            'Cancelled': []
        }
        if new_status not in valid_transitions[self.status]:
            raise ValidationError(f"Invalid status transition: {self.status} to {new_status}")
        self.status = new_status
        self.save()

    def calculate_midpoint(self):
        """Calculate midpoint between initiator and receiver locations."""
        if not (self.initiator and self.receiver):
            raise ValidationError("Both initiator and receiver must be set.")
        # Assume CustomUser has location in chat_preferences or city
        coord1 = self.initiator.chat_preferences.get('location', {'latitude': 0, 'longitude': 0})
        coord2 = self.receiver.chat_preferences.get('location', {'latitude': 0, 'longitude': 0})
        return Location.calculate_midpoint(coord1, coord2)

    def save(self, *args, **kwargs):
        """Validate before saving."""
        self.clean()
        super().save(*args, **kwargs)


class Share(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed')
    ]

    share_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        CustomUser,
        related_name='shares',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_comment='User sharing the content'
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
        db_comment='Type of content being shared'
    )
    content_id = models.UUIDField(db_comment='UUID of the shared content')
    destination = models.CharField(
        max_length=50,
        choices=[
            ('x', 'X'),
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
        db_comment='Platform that initiated the share'
    )
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='pending',
        db_comment='Status of the share attempt'
    )
    is_reshare = models.BooleanField(
        default=False,
        db_comment='Marks whether a share is original or repeated'
    )
    metadata = models.JSONField(
        blank=True,
        null=True,
        db_comment='Sharing metadata (e.g., {"url": "https://x.com/...", "text": "Swapped a book!"})'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_comment='When share was created'
    )

    class Meta:
        db_table = 'shares'
        db_table_comment = 'Tracks sharing of content for visibility analysis'
        unique_together = (('user', 'content_type', 'content_id', 'destination'),)
        indexes = [
            models.Index(fields=['user', 'content_type', 'content_id']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        username = self.user.username if self.user else 'Anonymous'
        return f"{username} shared {self.content_type} on {self.destination}"

    def clean(self):
        """Validate content_id against content_type."""
        if self.content_type == 'swap':
            if not Swap.objects.filter(swap_id=self.content_id).exists():
                raise ValidationError("Invalid swap_id for swap content type.")
        # Add similar checks for other content types as needed
        if self.metadata and not isinstance(self.metadata, dict):
            raise ValidationError("Metadata must be a JSON object.")
        if self.metadata and not self.metadata.get('url'):
            raise ValidationError("Metadata must include a URL.")

    def save(self, *args, **kwargs):
        """Validate before saving."""
        self.clean()
        super().save(*args, **kwargs)

class Notification(models.Model):
    TYPE_CHOICES = [
        ('swap_proposed', 'Swap Proposed'),
        ('swap_accepted', 'Swap Accepted'),
        ('swap_confirmed', 'Swap Confirmed'),
        ('swap_completed', 'Swap Completed'),
        ('swap_cancelled', 'Swap Cancelled'),
        ('message_received', 'Message Received'),
        ('message_edited', 'Message Edited'),
        ('message_read', 'Message Read'),
        ('message_reaction', 'Message Reaction'),
        ('discussion_deleted', 'Discussion Deleted'),
        ('note_added', 'Note Added'),
        ('note_liked', 'Note Liked'),
        ('discussion_upvoted', 'Discussion Upvoted'),
    ]

    notification_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_comment='Recipient of the notification'
    )
    book = models.ForeignKey(
        'library.Book',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_comment='Book related to the notification (optional)'
    )
    swap = models.ForeignKey(
        'swaps.Swap',
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        db_comment='Swap related to the notification'
    )
    type = models.CharField(
        max_length=50,
        choices=TYPE_CHOICES,
        db_comment='Type of notification for UI and tracking'
    )
    message = models.TextField(
        db_comment='Notification message',
        validators=[MaxValueValidator(500, message="Message must be 500 characters or less")]
    )
    content_type = models.CharField(
        max_length=50,
        blank=True,
        null=True,
        db_comment='Type of content (e.g., chat, society_message)'
    )
    content_id = models.UUIDField(
        blank=True,
        null=True,
        db_comment='ID of the related content (e.g., chat_id)'
    )
    is_read = models.BooleanField(
        default=False,
        db_comment='Tracks read/unread state'
    )
    is_archived = models.BooleanField(
        default=False,
        db_comment='Tracks archived state'
    )
    delivered_at = models.DateTimeField(
        blank=True,
        null=True,
        db_comment='Delivery timestamp for WebSocket diagnostics'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_comment='When notification was created'
    )

    class Meta:
        db_table = 'notifications'
        db_table_comment = 'Sends alerts for swaps, messages, and other events'
        indexes = [
            models.Index(fields=['user', 'is_read']),
            models.Index(fields=['created_at']),
            models.Index(fields=['swap']),
            models.Index(fields=['content_type', 'content_id']),
        ]

    def __str__(self):
        username = self.user.username if self.user else 'Anonymous'
        return f"{username}: {self.type} notification"
    
class Exchange(models.Model):
    """
    Tracks the actual exchange event of books between users after a swap is confirmed.
    Represents the physical handover or exchange of books.
    """
    exchange_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    swap = models.OneToOneField(
        Swap,
        on_delete=models.CASCADE,
        related_name='exchange',
        db_comment='The swap this exchange is associated with'
    )
    exchange_date = models.DateTimeField(
        db_comment='When the physical exchange occurred'
    )
    location = models.ForeignKey(
        Location,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_comment='Where the exchange took place'
    )
    initiator_confirmed = models.BooleanField(
        default=False,
        db_comment='Whether the initiator confirmed the exchange'
    )
    receiver_confirmed = models.BooleanField(
        default=False,
        db_comment='Whether the receiver confirmed the exchange'
    )
    qr_scanned = models.BooleanField(
        default=False,
        db_comment='Whether the QR code was scanned during exchange'
    )
    notes = models.TextField(
        blank=True,
        null=True,
        db_comment='Additional notes about the exchange'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        db_comment='When the exchange record was created'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        db_comment='When the exchange record was last updated'
    )

    class Meta:
        db_table = 'exchanges'
        db_table_comment = 'Records of physical book exchanges between users'
        indexes = [
            models.Index(fields=['swap']),
            models.Index(fields=['exchange_date']),
        ]

    def __str__(self):
        return f"Exchange for {self.swap}"

    def is_complete(self):
        """Check if both users have confirmed the exchange."""
        return self.initiator_confirmed and self.receiver_confirmed

    def confirm_exchange(self, user, confirmed=True):
        """Confirm exchange from either initiator or receiver."""
        if user == self.swap.initiator:
            self.initiator_confirmed = confirmed
        elif user == self.swap.receiver:
            self.receiver_confirmed = confirmed
        else:
            raise ValidationError("User is not part of this exchange.")
        
        self.save()
        
        # If both users confirmed, update the swap status to completed
        if self.is_complete():
            self.swap.set_status('Completed')
            
            # Update book ownership
            if self.swap.initiator_book and self.swap.receiver:
                self.swap.initiator_book.owner = self.swap.receiver
                self.swap.initiator_book.save()
                
            if self.swap.receiver_book and self.swap.initiator:
                self.swap.receiver_book.owner = self.swap.initiator
                self.swap.receiver_book.save()