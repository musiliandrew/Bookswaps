from rest_framework import serializers
from .models import Swaps, Locations, Notifications, Shares
from users.models import CustomUser
from library.models import Books, Libraries
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.conf import settings
from discussions.models import Discussions
from chat.models import Societies
from users.serializers import UserSerializer
from library.serializers import BookSerializer

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
        
class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Locations
        fields = ['location_id', 'name', 'city', 'coords', 'type', 'rating', 'verified', 'popularity_score']

class SwapSerializer(serializers.ModelSerializer):
    initiator = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)
    initiator_book = BookSerializer(read_only=True)
    receiver_book = BookSerializer(read_only=True)
    meetup_location = LocationSerializer(read_only=True)
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
        fields = ['meetup_location', 'meetup_time', 'status']

    def validate_meetup_location(self, value):
        if not Locations.objects.filter(location_id=value.location_id, is_active=True).exists():
            raise serializers.ValidationError("Invalid or inactive location")
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


        
class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Locations
        fields = ['location_id', 'name', 'city', 'coords', 'type', 'rating', 'verified', 'popularity_score']
        
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
    user = UserSerializer(read_only=True)

    class Meta:
        model = Shares
        fields = [
            'share_id', 'user', 'content_type', 'content_id', 'destination',
            'platform', 'is_reshare', 'metadata', 'created_at'
        ]
        read_only_fields = ['user', 'share_id', 'created_at']

    def validate(self, data):
        content_type = data.get('content_type')
        content_id = data.get('content_id')

        # Validate content_id based on content_type
        content_models = {
            'book': Books,
            'discussion': Discussions,
            'profile': CustomUser,
            'swap': Swaps,
            'society': Societies
        }
        if content_type not in content_models:
            raise serializers.ValidationError(f"Invalid content_type: {content_type}")
        
        model = content_models[content_type]
        if not model.objects.filter(**{f"{content_type}_id": content_id}).exists():
            raise serializers.ValidationError(f"No {content_type} found with ID {content_id}")

        # Validate metadata (optional)
        metadata = data.get('metadata')
        if metadata and not isinstance(metadata, dict):
            raise serializers.ValidationError("Metadata must be a JSON object")

        return data

    def create(self, validated_data):
        return Shares.objects.create(
            user=self.context['user'],
            **validated_data
        )