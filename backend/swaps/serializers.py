from rest_framework import serializers
from django.utils import timezone
from django.core.exceptions import ValidationError
from .models import Swap, Location, Notification, Share
from backend.users.models import CustomUser, Follows
from backend.library.models import Book
from datetime import timedelta

class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['user_id', 'username']

class BookMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['book_id', 'title', 'isbn']

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = [
            'location_id', 'name', 'type', 'coords', 'city', 'rating',
            'last_fetched', 'source', 'verified', 'popularity_score', 'is_active'
        ]

    def validate_coords(self, value):
        from .models import validate_coords
        validate_coords(value)
        return value

class SwapCreateSerializer(serializers.ModelSerializer):
    initiator_book_id = serializers.UUIDField(write_only=True)
    receiver_id = serializers.UUIDField(write_only=True)
    receiver_book_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Swap
        fields = ['initiator_book_id', 'receiver_id', 'receiver_book_id']

    def validate_initiator_book_id(self, value):
        try:
            book = Book.objects.get(book_id=value)
            if book.user != self.context['request'].user:
                raise serializers.ValidationError("Not your book.")
            if book.locked_until and book.locked_until > timezone.now():
                raise serializers.ValidationError("Book is locked.")
            return value
        except Book.DoesNotExist:
            raise serializers.ValidationError("Invalid book ID.")

    def validate_receiver_id(self, value):
        try:
            receiver = CustomUser.objects.get(user_id=value)
            if receiver == self.context['request'].user:
                raise serializers.ValidationError("Cannot swap with yourself.")
            if not Follows.objects.filter(
                follower=self.context['request'].user,
                followed=receiver,
                active=True
            ).exists():
                raise serializers.ValidationError("You must follow the receiver to initiate a swap.")
            return value
        except CustomUser.DoesNotExist:
            raise serializers.ValidationError("Invalid receiver ID.")

    def validate_receiver_book_id(self, value):
        if value:
            try:
                book = Book.objects.get(book_id=value)
                receiver = CustomUser.objects.get(user_id=self.initial_data['receiver_id'])
                if book.user != receiver:
                    raise serializers.ValidationError("Receiver book must belong to receiver.")
                if book.locked_until and book.locked_until > timezone.now():
                    raise serializers.ValidationError("Receiver book is locked.")
                return value
            except Book.DoesNotExist:
                raise serializers.ValidationError("Invalid receiver book ID.")
        return value

    def validate(self, data):
        initiator = self.context['request'].user
        receiver = CustomUser.objects.get(user_id=data['receiver_id'])
        initiator_book = Book.objects.get(book_id=data['initiator_book_id'])
        receiver_book = Book.objects.get(book_id=data['receiver_book_id']) if data.get('receiver_book_id') else None

        data['initiator'] = initiator
        data['receiver'] = receiver
        data['initiator_book'] = initiator_book
        data['receiver_book'] = receiver_book
        return data

    def create(self, validated_data):
        qr_code_url = self.context.get('qr_code_url')
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
        return obj.qr_code_url if obj.qr_code_url else None

class SwapAcceptSerializer(serializers.ModelSerializer):
    meetup_location_id = serializers.UUIDField(write_only=True, required=False)
    meetup_time = serializers.DateTimeField(required=False)

    class Meta:
        model = Swap
        fields = ['status', 'meetup_location_id', 'meetup_time']

    def validate_meetup_location_id(self, value):
        try:
            location = Location.objects.get(location_id=value, is_active=True)
            return location
        except Location.DoesNotExist:
            raise serializers.ValidationError("Invalid or inactive location.")

    def validate_meetup_time(self, value):
        if value and value <= timezone.now():
            raise serializers.ValidationError("Meetup time must be in the future.")
        return value

    def validate_status(self, value):
        if value != 'Accepted':
            raise serializers.ValidationError("Status must be 'Accepted' for this action.")
        return value

    def validate(self, data):
        if self.instance.status != 'Requested':
            raise serializers.ValidationError("Only requested swaps can be accepted.")
        return data

    def update(self, instance, validated_data):
        instance.status = validated_data.get('status', instance.status)
        if 'meetup_location_id' in validated_data:
            instance.meetup_location = validated_data['meetup_location_id']
        if 'meetup_time' in validated_data:
            instance.meetup_time = validated_data['meetup_time']
        instance.save()
        return instance

class SwapConfirmSerializer(serializers.Serializer):
    qr_code_url = serializers.URLField()

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
    book = BookMiniSerializer(read_only=True)
    swap = SwapSerializer(read_only=True)
    book_title = serializers.CharField(source='book.title', read_only=True, allow_null=True)
    swap_id = serializers.UUIDField(source='swap.swap_id', read_only=True, allow_null=True)

    class Meta:
        model = Notification
        fields = [
            'notification_id', 'user', 'book', 'swap', 'type', 'message',
            'is_read', 'is_archived', 'delivered_at', 'created_at',
            'book_title', 'swap_id'
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

        content_models = {
            'book': Book,
            'profile': CustomUser,
            'swap': Swap,
            # 'discussion': Discussion,  # Uncomment when defined
            # 'society': Society
        }
        if content_type not in content_models:
            raise serializers.ValidationError(f"Invalid content_type: {content_type}")

        model = content_models[content_type]
        field = 'user_id' if content_type == 'profile' else f'{content_type}_id'
        if not model.objects.filter(**{field: content_id}).exists():
            raise serializers.ValidationError(f"No {content_type} found with ID {content_id}")

        metadata = data.get('metadata', {})
        if not isinstance(metadata, dict):
            raise serializers.ValidationError("Metadata must be a JSON object.")
        if not metadata.get('url'):
            raise serializers.ValidationError("Metadata must include a URL.")
        if content_type == 'swap':
            metadata['text'] = metadata.get('text', 'Check out my book swap on BookSwap!')

        data['metadata'] = metadata
        return data

    def create(self, validated_data):
        return Share.objects.create(
            user=self.context['request'].user,
            status='pending',
            **validated_data
        )