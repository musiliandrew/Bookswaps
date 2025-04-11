from django.db import models
from backend.library.models import Books
from django.conf import settings



class Swaps(models.Model):
    swap_id = models.UUIDField(primary_key=True)
    initiator = models.ForeignKey(settings.AUTH_USER_MODEL, models.DO_NOTHING, blank=True, null=True)
    receiver = models.ForeignKey(settings.AUTH_USER_MODEL, models.DO_NOTHING, related_name='swaps_receiver_set', blank=True, null=True)
    initiator_book = models.ForeignKey(Books, models.DO_NOTHING, blank=True, null=True)
    receiver_book = models.ForeignKey(Books, models.DO_NOTHING, related_name='swaps_receiver_book_set', blank=True, null=True)
    type = models.TextField()
    status = models.TextField(blank=True, null=True)
    location_name = models.TextField(blank=True, null=True)
    location_coords = models.JSONField(blank=True, null=True)
    meetup_time = models.DateTimeField(blank=True, null=True)
    qr_code_id = models.TextField(unique=True, blank=True, null=True, db_comment='QR used for scanning and verifying meetup')
    initiator_scan_at = models.DateTimeField(blank=True, null=True)
    receiver_scan_at = models.DateTimeField(blank=True, null=True)
    locked_until = models.DateTimeField(blank=True, null=True, db_comment='Ensures item unavailability after exchange')
    dispute_reason = models.TextField(blank=True, null=True)
    review_status = models.TextField(blank=True, null=True, db_comment='Tracks if feedback was left post-swap')
    resolved_at = models.DateTimeField(blank=True, null=True)
    cancelled_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'swaps'
        db_table_comment = 'Tracks book exchange logic, locations, statuses, and confirmations between users'
        
        
class Shares(models.Model):
    share_id = models.UUIDField(primary_key=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.DO_NOTHING, blank=True, null=True)
    content_type = models.TextField()
    content_id = models.TextField()
    destination = models.TextField()
    platform = models.TextField(blank=True, null=True, db_comment='Platform that initiated the share (e.g., Web, Mobile)')
    is_reshare = models.BooleanField(blank=True, null=True, db_comment='Marks whether a share is original or repeated')
    metadata = models.JSONField(blank=True, null=True, db_comment='Stores additional sharing metadata in flexible structure')
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        db_table = 'shares'
        unique_together = (('user', 'content_type', 'content_id', 'destination'),)
        db_table_comment = 'Tracks sharing of books, discussions, profiles, and swaps for visibility analysis'
        
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
        
        
class Locations(models.Model):
    location_id = models.UUIDField(primary_key=True)
    name = models.TextField()
    type = models.TextField()
    coords = models.JSONField(db_comment='Geo-coordinates used for midpoint calculation and scan verification')
    city = models.TextField()
    rating = models.FloatField(blank=True, null=True)
    last_fetched = models.DateTimeField(blank=True, null=True)
    source = models.TextField(blank=True, null=True, db_comment='Data source e.g. Google, OSM')
    verified = models.BooleanField(blank=True, null=True, db_comment='True if spot is human-vetted')
    popularity_score = models.FloatField(blank=True, null=True, db_comment='Ranking metric based on usage and rating')
    is_active = models.BooleanField(blank=True, null=True)

    class Meta:
        db_table = 'locations'
        unique_together = (('name', 'city'),)
        db_table_comment = 'Caches public exchange spots with coordinates and ratings for swap logic'
