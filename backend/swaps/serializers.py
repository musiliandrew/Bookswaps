from rest_framework import serializers
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.conf import settings
from backend.users.models import CustomUser
from backend.users.serializers import UserSerializer
from backend.library.models import Books
from backend.library.serializers import BookSerializer
from backend.swaps.models import Swap, Share, Notification, Location
from backend.users.models import Follows


class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username']


class BookMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Books
        fields = ['book_id', 'title']


class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['location_id', 'name', 'city', 'coords', 'type', 'rating', 'verified', 'popularity_score']

    def validate_coords(self, value):
        """Ensure coords are valid for Google Maps integration."""
        try:
            lat = float(value['latitude'])
            lon = float(value['longitude'])
            if not (-90 <= lat <= 90 and -180 <= lon <= 180):
                raise serializers.ValidationError("Invalid latitude or longitude range.")
        except (KeyError, TypeError, ValueError):
            raise serializers.ValidationError("Coords must include valid latitude and longitude.")
        return value


class SwapCreateSerializer(serializers.ModelSerializer):
    receiver_id = serializers.UUIDField(write_only=True)
    initiator_book_id = serializers.UUIDField(write_only=True)
    receiver_book_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Swap
        fields = ['receiver_id', 'initiator_book_id', 'receiver_book_id']

    def validate(self, data):
        initiator = self.context.get('request').user
        receiver_id = data.get('receiver_id')
        initiator_book_id = data.get('initiator_book_id')
        receiver_book_id = data.get('receiver_book_id')

        # Validate user and book existence
        try:
            receiver = CustomUser.objects.get(id=receiver_id)
            initiator_book = Books.objects.get(book_id=initiator_book_id)
            receiver_book = Books.objects.get(book_id=receiver_book_id) if receiver_book_id else None
        except (CustomUser.DoesNotExist, Books.DoesNotExist):
            raise serializers.ValidationError("Invalid user or book IDs.")

        # Prevent self-swaps
        if initiator == receiver:
            raise serializers.ValidationError("Cannot initiate a swap with yourself.")

        # Check follow relationship (assumes mutual followers)
        if not Follows.objects.filter(follower=initiator, followed=receiver, active=True).exists():
            raise serializers.ValidationError("You must follow the receiver to initiate a swap.")

        # Validate book ownership (assumes Books.owner exists)
        if initiator_book.owner != initiator:
            raise serializers.ValidationError("You do not own the initiator book.")
        if receiver_book and receiver_book.owner != receiver:
            raise serializers.ValidationError("Receiver does not own the selected book.")

        # Check book lock status
        now = timezone.now()
        if initiator_book.locked_until and initiator_book.locked_until > now:
            raise serializers.ValidationError("Your book is currently locked.")
        if receiver_book and receiver_book.locked_until and receiver_book.locked_until > now:
            raise serializers.ValidationError("Receiver's book is currently locked.")

        # Populate validated data
        data['initiator'] = initiator
        data['receiver'] = receiver
        data['initiator_book'] = initiator_book
        data['receiver_book'] = receiver_book

        return data

    def create(self, validated_data):
        qr_code_url = self.context.get('qr_code_url')  # Injected by Celery task
        return Swap.objects.create(
            initiator=validated_data['initiator'],
            receiver=validated_data['receiver'],
            initiator_book=validated_data['initiator_book'],
            receiver_book=validated_data.get('receiver_book'),
            qr_code_url=qr_code_url,
            status='Requested'
        )


class SwapSerializer(serializers.ModelSerializer):
    initiator = UserMiniSerializer(read_only=True)
    receiver = UserMiniSerializer(read_only=True)
    initiator_book = BookMiniSerializer(read_only=True)
    receiver_book = BookMiniSerializer(read_only=True)
    meetup_location = LocationSerializer(read_only=True)
    qr_url = serializers.SerializerMethodField()

    class Meta:
        model = Swap
        fields = [
            'swap_id', 'initiator', 'receiver', 'initiator_book', 'receiver_book',
            'status', 'meetup_location', 'meetup_time', 'locked_until', 'qr_url',
            'created_at', 'updated_at'
        ]

    def get_qr_url(self, obj):
        if obj.qr_code_url:
            return obj.qr_code_url  # S3 URL (e.g., https://bookswap-bucket.s3.amazonaws.com/qr/<swap_id>.png)
        return None


class SwapAcceptSerializer(serializers.ModelSerializer):
    meetup_location_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Swap
        fields = ['meetup_location_id', 'meetup_time', 'status']

    def validate_meetup_location_id(self, value):
        if not Location.objects.filter(location_id=value, is_active=True).exists():
            raise serializers.ValidationError("Invalid or inactive location.")
        return value

    def validate_meetup_time(self, value):
        if value <= timezone.now():
            raise serializers.ValidationError("Meetup time must be in the future.")
        return value

    def validate_status(self, value):
        if value != 'Accepted':
            raise serializers.ValidationError("Status must be 'Accepted' for this action.")
        return value

    def validate(self, data):
        swap = self.instance
        if swap.status != 'Requested':
            raise serializers.ValidationError("Only requested swaps can be accepted.")
        data['meetup_location'] = Location.objects.get(location_id=data.pop('meetup_location_id'))
        return data


class SwapConfirmSerializer(serializers.Serializer):
    qr_code_url = serializers.URLField(required=True)

    def validate_qr_code_url(self, value):
        if not Swap.objects.filter(qr_code_url=value, status='Accepted').exists():
            raise serializers.ValidationError("Invalid or inactive QR code.")
        return value


class SwapHistorySerializer(serializers.ModelSerializer):
    initiator = UserMiniSerializer(read_only=True)
    receiver = UserMiniSerializer(read_only=True)
    initiator_book = BookMiniSerializer(read_only=True)
    receiver_book = BookMiniSerializer(read_only=True)

    class Meta:
        model = Swap
        fields = [
            'swap_id', 'initiator', 'receiver', 'initiator_book', 'receiver_book',
            'status', 'created_at', 'updated_at'
        ]


class NotificationSerializer(serializers.ModelSerializer):
    book_title = serializers.CharField(source='book.title', read_only=True, allow_null=True)
    swap_id = serializers.UUIDField(source='swap.swap_id', read_only=True, allow_null=True)

    class Meta:
        model = Notification
        fields = [
            'notification_id', 'type', 'message', 'is_read', 'is_archived',
            'delivered_at', 'created_at', 'book_title', 'swap_id'
        ]


class ShareSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)

    class Meta:
        model = Share
        fields = [
            'share_id', 'user', 'content_type', 'content_id', 'destination',
            'platform', 'status', 'is_reshare', 'metadata', 'created_at'
        ]
        read_only_fields = ['user', 'share_id', 'created_at', 'status']

    def validate(self, data):
        content_type = data.get('content_type')
        content_id = data.get('content_id')

        # Validate content_id
        content_models = {
            'book': Books,
            'profile': CustomUser,
            'swap': Swap
            # Add Discussions, Societies when defined
        }
        if content_type not in content_models:
            raise serializers.ValidationError(f"Invalid content_type: {content_type}")
        
        model = content_models[content_type]
        field = 'id' if content_type == 'profile' else f'{content_type}_id'
        if not model.objects.filter(**{field: content_id}).exists():
            raise serializers.ValidationError(f"No {content_type} found with ID {content_id}")

        # Validate metadata
        metadata = data.get('metadata')
        if metadata and not isinstance(metadata, dict):
            raise serializers.ValidationError("Metadata must be a JSON object.")
        if metadata and not metadata.get('url'):
            raise serializers.ValidationError("Metadata must include a URL.")
        if content_type == 'swap' and metadata:
            metadata['text'] = metadata.get('text', 'Check out my book swap on BookSwap!')

        return data

    def create(self, validated_data):
        return Share.objects.create(
            user=self.context['request'].user,
            status='pending',
            **validated_data
        )