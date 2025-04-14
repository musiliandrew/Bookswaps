from rest_framework import serializers
from .models import Swaps, Locations, Notifications, Shares
from users.models import CustomUser
from library.models import Books, Libraries
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.conf import settings

User = get_user_model()

class SwapCreateSerializer(serializers.ModelSerializer):
    receiver_id = serializers.UUIDField(write_only=True)
    initiator_book_id = serializers.UUIDField(write_only=True)
    receiver_book_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Swaps
        fields = ['receiver_id', 'initiator_book_id', 'receiver_book_id']

    def validate(self, data):
        initiator = self.context.get('initiator')
        receiver_id = data.get('receiver_id')
        initiator_book_id = data.get('initiator_book_id')
        receiver_book_id = data.get('receiver_book_id')

        try:
            receiver = CustomUser.objects.get(id=receiver_id)
            initiator_book = Books.objects.get(book_id=initiator_book_id)
            receiver_book = Books.objects.get(book_id=receiver_book_id) if receiver_book_id else None
        except (CustomUser.DoesNotExist, Books.DoesNotExist):
            raise serializers.ValidationError("Invalid user or book IDs.")

        if not Libraries.objects.filter(user=initiator, book=initiator_book).exists():
            raise serializers.ValidationError("You do not own the initiator book.")

        if receiver_book and not Libraries.objects.filter(user=receiver, book=receiver_book).exists():
            raise serializers.ValidationError("Receiver does not own the selected book.")

        now = timezone.now()
        if initiator_book.locked_until and initiator_book.locked_until > now:
            raise serializers.ValidationError("Your book is currently locked.")

        if receiver_book and receiver_book.locked_until and receiver_book.locked_until > now:
            raise serializers.ValidationError("Receiver's book is currently locked.")

        data['initiator'] = initiator
        data['receiver'] = receiver
        data['initiator_book'] = initiator_book
        data['receiver_book'] = receiver_book

        return data

    def create(self, validated_data):
        return Swaps.objects.create(
            initiator=validated_data['initiator'],
            receiver=validated_data['receiver'],
            initiator_book=validated_data['initiator_book'],
            receiver_book=validated_data.get('receiver_book'),
            qr_code_id=self.context.get('qr_code_id'),  # 💥 Injected here
            status='Requested'
        )
class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username']

class BookMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Books
        fields = ['book_id', 'title']

class SwapSerializer(serializers.ModelSerializer):
    initiator = UserMiniSerializer()
    receiver = UserMiniSerializer()
    initiator_book = BookMiniSerializer()
    receiver_book = BookMiniSerializer(allow_null=True)
    qr_url = serializers.SerializerMethodField()

    class Meta:
        model = Swaps
        fields = ['swap_id', 'initiator', 'receiver', 'initiator_book', 'receiver_book', 'status', 'meetup_location', 'meetup_time', 'locked_until', 'qr_url']
        
    def get_qr_url(self, obj):
        if obj.qr_code_id:
            return f"{settings.STATIC_URL}qr/{obj.qr_code_id}.png"
        return None
    
class SwapAcceptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Swaps
        fields = ['meetup_time', 'meetup_location', 'status']

    def validate_meetup_location(self, value):
        required_keys = {'latitude', 'longitude', 'address'}
        if not all(key in value for key in required_keys):
            raise serializers.ValidationError("meetup_location must include latitude, longitude, and address")
        return value
    
class SwapConfirmSerializer(serializers.Serializer):
    qr_code_id = serializers.CharField(required=True)
    
class UserShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class BookShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Books
        fields = ['book_id', 'title']


        
class LocationSerializer(serializers.Serializer):
    latitude = serializers.FloatField()
    longitude = serializers.FloatField()
    is_default = serializers.BooleanField(default=False)

    def validate_latitude(self, value):
        if not -90 <= value <= 90:
            raise serializers.ValidationError("Latitude must be between -90 and 90.")
        return value

    def validate_longitude(self, value):
        if not -180 <= value <= 180:
            raise serializers.ValidationError("Longitude must be between -180 and 180.")
        return value

    def create(self, validated_data):
        user = self.context['request'].user
        coords = {
            "lat": validated_data.pop("latitude"),
            "lng": validated_data.pop("longitude")
        }

        location = Locations.objects.create(
            user=user,
            coords=coords,
            is_default=validated_data.get('is_default', False),
            name="User Drop",
            type="User Submitted",
            city="Unknown",  # optional, can be updated later with reverse geocode
            is_active=True,
            verified=False,
        )
        return location

    def to_representation(self, instance):
        return {
            "location_id": str(instance.location_id),
            "latitude": instance.coords.get("lat"),
            "longitude": instance.coords.get("lng"),
            "is_default": instance.is_default
        }
        
class NotificationSerializer(serializers.ModelSerializer):
    # Serialize related book information if it exists
    book_title = serializers.CharField(source='book.title', read_only=True)

    class Meta:
        model = Notifications
        fields = [
            'notification_id', 'type', 'message', 'is_read', 
            'is_archived', 'delivered_at', 'created_at', 'book_title'
        ]
        
class ShareSerializer(serializers.ModelSerializer):
    book_id = serializers.UUIDField(write_only=True, required=False)
    swap_id = serializers.UUIDField(write_only=True, required=False)

    class Meta:
        model = Shares
        fields = ['share_id', 'user', 'book_id', 'swap_id', 'platform', 'content', 'book', 'swap']
        read_only_fields = ['share_id', 'user', 'book', 'swap']

    def validate_platform(self, value):
        allowed = ['Twitter', 'Facebook', 'LinkedIn', 'WhatsApp']
        if value not in allowed:
            raise serializers.ValidationError(f"Unsupported platform. Choose from: {', '.join(allowed)}.")
        return value

    def validate(self, attrs):
        if not attrs.get('book_id') and not attrs.get('swap_id'):
            raise ValidationError("You must provide either a book_id or a swap_id to share.")
        return attrs

    def create(self, validated_data):
        user = self.context['request'].user
        book = None
        swap = None

        if 'book_id' in validated_data:
            book = Books.objects.get(book_id=validated_data.pop('book_id'))

        if 'swap_id' in validated_data:
            swap = Swaps.objects.get(swap_id=validated_data.pop('swap_id'))

        return Shares.objects.create(user=user, book=book, swap=swap, **validated_data)