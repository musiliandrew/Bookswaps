from rest_framework import serializers
from backend.discussions.models import Society, SocietyMember, SocietyMessage
from backend.users.models import CustomUser
from backend.library.models import Book
from backend.swaps.models import Notification, Exchange
from .models import Chats, MessageReaction
import bleach
from markdown import markdown
from uuid import UUID

class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['user_id', 'username', 'profile_picture']

class BookMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['book_id', 'title']

class MessageReactionSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)
    reaction_type = serializers.ChoiceField(choices=MessageReaction.REACTION_CHOICES)

    class Meta:
        model = MessageReaction
        fields = ['reaction_id', 'user', 'reaction_type', 'created_at']
        read_only_fields = ['reaction_id', 'created_at']

    def create(self, validated_data):
        chat = self.context.get('chat')
        society_message = self.context.get('society_message')
        user = self.context['user']
        reaction = MessageReaction.objects.create(
            user=user,
            chat=chat,
            society_message=society_message,
            **validated_data
        )
        target_user = chat.sender if chat else society_message.user
        Notification.objects.create(
            user=target_user,
            type='message_reaction',
            message=f"{user.username} reacted to your message.",
            content_type='chat' if chat else 'society_message',
            content_id=chat.chat_id if chat else society_message.message_id
        )
        return reaction
class ChatSerializer(serializers.ModelSerializer):
    sender = UserMiniSerializer(read_only=True)
    receiver = UserMiniSerializer(read_only=True)
    book = BookMiniSerializer(read_only=True)
    receiver_id = serializers.UUIDField(write_only=True)
    content = serializers.CharField()
    book_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    can_note = serializers.SerializerMethodField()
    reactions = MessageReactionSerializer(many=True, read_only=True)

    class Meta:
        model = Chats
        fields = [
            'chat_id', 'sender', 'receiver', 'content', 'status',
            'book', 'created_at', 'edited_at', 'receiver_id', 'book_id',
            'can_note', 'reactions'
        ]
        read_only_fields = ['chat_id', 'status', 'created_at', 'edited_at', 'reactions']

    def get_can_note(self, obj):
        return True  # Frontend triggers new message

    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError("Message content cannot be empty.")
        return bleach.clean(
            markdown(value),
            tags=['p', 'strong', 'em', 'a', 'code'],
            attributes={'a': ['href']},
            protocols=['https']
        )

    def validate_receiver_id(self, value):
        if not CustomUser.objects.filter(user_id=value).exists():
            raise serializers.ValidationError("Receiver does not exist.")
        if value == self.context['sender'].user_id:
            raise serializers.ValidationError("Cannot send message to self.")
        return value

    def validate_book_id(self, value):
        if value:
            if not Book.objects.filter(book_id=value).exists():
                raise serializers.ValidationError("Invalid book ID.")
            receiver_id = self.initial_data.get('receiver_id')
            if receiver_id:
                sender = self.context['sender']
                receiver = CustomUser.objects.get(user_id=receiver_id)
                if not Exchange.objects.filter(
                    swap__initiator_book__book_id=value,
                    swap__initiator__in=[sender, receiver]
                ).exists() and not Exchange.objects.filter(
                    swap__receiver_book__book_id=value,
                    swap__receiver__in=[sender, receiver]
                ).exists():
                    raise serializers.ValidationError(
                        "Book must be part of a swap involving sender or receiver."
                    )
        return value

    def create(self, validated_data):
        sender = self.context['sender']
        receiver = CustomUser.objects.get(user_id=validated_data.pop('receiver_id'))
        book_id = validated_data.pop('book_id', None)
        book = Book.objects.get(book_id=book_id) if book_id else None

        chat = Chats.objects.create(
            sender=sender,
            receiver=receiver,
            book=book,
            status='UNREAD',
            **validated_data
        )
        Notification.objects.create(
            user=receiver,
            type='message_received',
            message=f"{sender.username} sent you a message.",
            content_type='chat',
            content_id=chat.chat_id
        )
        return chat

    def update(self, instance, validated_data):
        instance.content = validated_data.get('content', instance.content)
        instance.save()
        return instance
    
class ChatReadStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chats
        fields = ['chat_id', 'status']

class SocietyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Society
        fields = ['name', 'description', 'visibility', 'focus_type', 'focus_id', 'icon_url']

    def validate_name(self, value):
        if Society.objects.filter(name=value).exists():
            raise serializers.ValidationError("Society name must be unique.")
        return value

    def validate_focus_type(self, value):
        if value not in ['Book', 'Genre']:
            raise serializers.ValidationError("focus_type must be 'Book' or 'Genre'.")
        return value

    def validate_focus_id(self, value):
        if self.initial_data.get('focus_type') == 'Book' and value:
            try:
                UUID(value)
                if not Book.objects.filter(book_id=value).exists():
                    raise serializers.ValidationError("Invalid book ID.")
            except ValueError:
                raise serializers.ValidationError("focus_id must be a valid UUID for Book.")
        return value

    def validate_description(self, value):
        if value:
            return bleach.clean(
                markdown(value),
                tags=['p', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'code'],
                attributes={'a': ['href', 'title']},
                protocols=['https']
            )
        return value

class SocietySerializer(serializers.ModelSerializer):
    creator = UserMiniSerializer(read_only=True)
    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Society
        fields = [
            'society_id', 'name', 'description', 'creator', 'visibility',
            'focus_type', 'focus_id', 'icon_url', 'member_count', 'created_at'
        ]

    def get_member_count(self, obj):
        return SocietyMember.objects.filter(society=obj, status='ACTIVE').count()

class SocietyMessageSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)
    book = BookMiniSerializer(read_only=True)
    society = serializers.UUIDField(source='society.society_id', read_only=True)
    book_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    can_note = serializers.SerializerMethodField()
    reactions = MessageReactionSerializer(many=True, read_only=True)

    class Meta:
        model = SocietyMessage
        fields = [
            'message_id', 'society', 'user', 'content', 'book',
            'is_pinned', 'created_at', 'edited_at', 'book_id', 'can_note', 'reactions'
        ]

    def get_can_note(self, obj):
        return True  # Frontend triggers new message

    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError("Message content cannot be empty.")
        return bleach.clean(
            markdown(value),
            tags=['p', 'strong', 'em', 'a', 'code'],
            attributes={'a': ['href']},
            protocols=['https']
        )

    def validate_book_id(self, value):
        if value and not Book.objects.filter(book_id=value).exists():
            raise serializers.ValidationError("Invalid book ID.")
        return value

    def create(self, validated_data):
        society = Society.objects.get(society_id=self.context['society_id'])
        user = self.context['user']
        book_id = validated_data.pop('book_id', None)
        book = Book.objects.get(book_id=book_id) if book_id else None

        message = SocietyMessage.objects.create(
            society=society,
            user=user,
            book=book,
            **validated_data
        )
        members = SocietyMember.objects.filter(society=society, status='ACTIVE').exclude(user=user)
        for member in members:
            Notification.objects.create(
                user=member.user,
                type='society_message',
                message=f"{user.username} posted in {society.name}.",
                content_type='society_message',
                content_id=message.message_id
            )
        return message

    def update(self, instance, validated_data):
        instance.content = validated_data.get('content', instance.content)
        instance.status = 'EDITED'
        instance.save()
        return instance