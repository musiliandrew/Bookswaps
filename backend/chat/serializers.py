from rest_framework import serializers
from .models import Chats, Societies, SocietyMembers, SocietyMessages
from users.models import CustomUser
from backend.library.models import Books
from uuid import UUID

class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['user_id', 'username']

class BookMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Books
        fields = ['book_id', 'title']

class ChatSerializer(serializers.ModelSerializer):
    sender = UserMiniSerializer(read_only=True)
    receiver = UserMiniSerializer(read_only=True)
    book = BookMiniSerializer(read_only=True)

    receiver_id = serializers.UUIDField(write_only=True)
    content = serializers.CharField(write_only=True)
    book_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Chats
        fields = [
            'chat_id', 'sender', 'receiver', 'content', 'status',
            'book', 'created_at',
            'receiver_id', 'book_id'  # write-only fields
        ]
        read_only_fields = ['chat_id', 'status', 'created_at']

    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError("Message content cannot be empty.")
        return value

    def create(self, validated_data):
        sender = self.context['sender']
        receiver = CustomUser.objects.get(user_id=validated_data.pop('receiver_id'))
        book_id = validated_data.pop('book_id', None)
        book = None

        if book_id:
            book = Books.objects.get(book_id=book_id)

        chat = Chats.objects.create(
            sender=sender,
            receiver=receiver,
            content=validated_data['content'],
            book=book,
            status='Sent'
        )
        return chat
    
class ChatReadStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chats
        fields = ['chat_id', 'status']
        
class SocietyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Societies
        fields = ['name', 'focus_type', 'focus_id', 'is_public']

    def validate_focus_type(self, value):
        # Validate that focus_type is either 'Book' or 'Genre'
        if value not in ['Book', 'Genre']:
            raise serializers.ValidationError("focus_type must be either 'Book' or 'Genre'.")
        return value

    def validate_focus_id(self, value):
        # If focus_type is 'Book', we expect focus_id to be a valid UUID for a book
        if self.initial_data.get('focus_type') == 'Book':
            try:
                # Try to parse focus_id as UUID if the type is 'Book'
                UUID(value)
            except ValueError:
                raise serializers.ValidationError("focus_id must be a valid UUID when focus_type is 'Book'.")
        return value
    
class SocietySerializer(serializers.ModelSerializer):
    creator = serializers.SerializerMethodField()

    class Meta:
        model = Societies
        fields = ['society_id', 'name', 'focus_type', 'focus_id', 'is_public', 'creator']

    def get_creator(self, obj):
        # Return the username of the creator
        return {
            "user_id": str(obj.creator.id),
            "username": obj.creator.username
        }
    
class LeaveSocietySerializer(serializers.Serializer):
    # This serializer is optional in this case since no data is required for the DELETE request
    pass

class SocietySerializer(serializers.ModelSerializer):
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Societies
        fields = [
            'society_id', 'name', 'focus_type', 'focus_id',
            'is_public', 'member_count'
        ]

    def get_member_count(self, obj):
        return SocietyMembers.objects.filter(society=obj).count()
    
class SocietyMessageSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    book = serializers.SerializerMethodField()

    class Meta:
        model = SocietyMessages
        fields = [
            'message_id', 'society', 'user',
            'content', 'book'
        ]

    def get_user(self, obj):
        return {
            'user_id': str(obj.user.id),
            'username': obj.user.username
        }

    def get_book(self, obj):
        if obj.book:
            return {
                'book_id': str(obj.book.book_id),
                'title': obj.book.title
            }
        return None

    def create(self, validated_data):
        society_id = self.context['society']
        user = self.context['user']
        content = validated_data.get('content')
        book_id = self.initial_data.get('book_id')

        book = None
        if book_id:
            from .models import Books
            book = Books.objects.filter(book_id=book_id).first()

        return SocietyMessages.objects.create(
            society_id=society_id,
            user=user,
            content=content,
            book=book
        )