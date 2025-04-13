
from rest_framework import serializers
from .models import Discussions, Notes, Reprints
from backend.library.models import Books
from django.contrib.auth import get_user_model
from users.models import CustomUser
import uuid

User = get_user_model()

class BookMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Books
        fields = ['id', 'title']
        read_only_fields = ['id', 'title']


class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']
        read_only_fields = ['id', 'username']


class CreateDiscussionSerializer(serializers.ModelSerializer):
    book_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    tags = serializers.ListField(child=serializers.CharField(), required=False)
    media_urls = serializers.ListField(child=serializers.CharField(), required=False)

    class Meta:
        model = Discussions
        fields = ['discussion_id', 'type', 'book_id', 'title', 'content', 'tags', 'media_urls', 'spoiler_flag']
        read_only_fields = ['discussion_id']

    def validate(self, data):
        post_type = data.get('type')
        book_id = data.get('book_id')

        if post_type not in ['Article', 'Synopsis', 'Query']:
            raise serializers.ValidationError({'type': 'Must be Article, Synopsis, or Query'})

        if post_type in ['Synopsis', 'Query'] and not book_id:
            raise serializers.ValidationError({'book_id': 'This field is required for Synopsis or Query'})
        if post_type == 'Article' and book_id:
            raise serializers.ValidationError({'book_id': 'This must be null for Article type posts'})

        return data

    def create(self, validated_data):
        book_id = validated_data.pop('book_id', None)
        tags = validated_data.pop('tags', [])
        media_urls = validated_data.pop('media_urls', [])

        book = Books.objects.get(id=book_id) if book_id else None

        discussion = Discussions.objects.create(
            discussion_id=uuid.uuid4(),
            user=self.context['request'].user,
            book=book,
            tags=",".join(tags),
            media_urls=",".join(media_urls),
            **validated_data
        )

        return discussion


class DiscussionResponseSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer()
    book = BookMiniSerializer()

    class Meta:
        model = Discussions
        fields = ['discussion_id', 'type', 'title', 'user', 'book']
        

class BookMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Books
        fields = ['id', 'title']


class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']


class DiscussionFeedSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer()
    book = BookMiniSerializer()
    upvotes = serializers.IntegerField(source='upvote_count', default=0)
    note_count = serializers.SerializerMethodField()
    reprint_count = serializers.SerializerMethodField()
    content = serializers.SerializerMethodField()

    class Meta:
        model = Discussions
        fields = [
            'discussion_id', 'type', 'title', 'user', 'book',
            'content', 'upvotes', 'note_count', 'reprint_count'
        ]

    def get_content(self, obj):
        return obj.content[:150] + "..." if obj.content and len(obj.content) > 150 else obj.content

    def get_note_count(self, obj):
        return getattr(obj, 'note_count', 0)

    def get_reprint_count(self, obj):
        return getattr(obj, 'reprint_count', 0)
    
class DiscussionDetailSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer()
    book = BookMiniSerializer()
    upvotes = serializers.IntegerField(source='upvote_count', default=0)
    note_count = serializers.IntegerField(source='note_count', read_only=True)
    reprint_count = serializers.IntegerField(source='reprint_count', read_only=True)
    content = serializers.SerializerMethodField()

    class Meta:
        model = Discussions
        fields = [
            'discussion_id', 'type', 'title', 'user', 'book',
            'content', 'tags', 'media_urls', 'spoiler_flag', 'upvotes',
            'note_count', 'reprint_count'
        ]

    def get_content(self, obj):
        return obj.content  # Return full content here for post detail view
    
class NoteSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    parent_note_id = serializers.UUIDField(required=False)

    class Meta:
        model = Notes
        fields = ['note_id', 'discussion', 'user', 'content', 'parent_note_id']
    
    def validate_content(self, value):
        # Ensure the content doesn't exceed 280 characters
        if len(value) > 280:
            raise serializers.ValidationError("Content cannot exceed 280 characters.")
        return value

    def create(self, validated_data):
        discussion = self.context['discussion']
        user = self.context['user']
        parent_note = validated_data.get('parent_note_id')

        # Handle parent_note logic
        if parent_note:
            try:
                parent_note = Notes.objects.get(note_id=parent_note)
                if parent_note.discussion != discussion:
                    raise serializers.ValidationError("Parent note does not belong to this discussion.")
            except Notes.DoesNotExist:
                raise serializers.ValidationError("Parent note does not exist.")

        # Create and return the new note
        note = Notes.objects.create(
            discussion=discussion,
            user=user,
            parent_note=parent_note,
            **validated_data
        )
        return note
    
    def get_user(self, obj):
        return {
            'user_id': str(obj.user.id),
            'username': obj.user.username
        }
        
class LikeResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notes
        fields = ['note_id', 'likes']
        
class UpvoteResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discussions
        fields = ['discussion_id', 'upvotes']
        
class ReprintSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = Reprints
        fields = ['reprint_id', 'discussion_id', 'user', 'comment']

    def get_user(self, obj):
        return {
            'user_id': obj.user.id,
            'username': obj.user.username
        }

class ReprintCreateSerializer(serializers.Serializer):
    comment = serializers.CharField(
        required=False, allow_blank=True, max_length=280
    )

class TopPostSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    book = serializers.SerializerMethodField()

    class Meta:
        model = Discussions
        fields = ['discussion_id', 'type', 'title', 'user', 'book', 'upvotes']

    def get_user(self, obj):
        return {
            'user_id': obj.user.id,
            'username': obj.user.username
        }

    def get_book(self, obj):
        if obj.book:
            return {
                'book_id': obj.book.book_id,
                'title': obj.book.title
            }
        return None