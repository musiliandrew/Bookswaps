from rest_framework import serializers
from .models import Discussion, Note, Reprint, Society, SocietyMember, SocietyEvent
from backend.library.serializers import BookMiniSerializer
from backend.users.serializers import UserMiniSerializer
from backend.library.models import Book
import uuid
import bleach
from markdown import markdown


class DiscussionResponseSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)
    book = BookMiniSerializer(read_only=True)
    upvotes = serializers.IntegerField(read_only=True, source='upvotes_count')

    class Meta:
        model = Discussion
        fields = ['discussion_id', 'type', 'title', 'user', 'book', 'upvotes']

class CreateDiscussionSerializer(serializers.ModelSerializer):
    book_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    tags = serializers.ListField(child=serializers.CharField(), required=False, allow_empty=True)
    media_urls = serializers.ListField(child=serializers.URLField(), required=False, allow_empty=True)

    class Meta:
        model = Discussion
        fields = ['discussion_id', 'type', 'book_id', 'title', 'content', 'tags', 'media_urls', 'spoiler_flag']
        read_only_fields = ['discussion_id']

    def validate_type(self, value):
        if value not in ['Article', 'Synopsis', 'Query']:
            raise serializers.ValidationError("Type must be Article, Synopsis, or Query.")
        return value

    def validate(self, data):
        post_type = data.get('type')
        book_id = data.get('book_id')
        content = data.get('content')

        if post_type in ['Synopsis', 'Query'] and not book_id:
            raise serializers.ValidationError({'book_id': 'Required for Synopsis or Query.'})
        if post_type == 'Article' and book_id:
            raise serializers.ValidationError({'book_id': 'Must be null for Article.'})
        if content:
            data['content'] = bleach.clean(
                markdown(content),
                tags=['p', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'code', 'pre'],
                attributes={'a': ['href', 'title']},
                protocols=['https']
            )
        return data

    def create(self, validated_data):
        book_id = validated_data.pop('book_id', None)
        tags = validated_data.pop('tags', [])
        media_urls = validated_data.pop('media_urls', [])
        book = Book.objects.get(book_id=book_id) if book_id else None

        return Discussion.objects.create(
            discussion_id=uuid.uuid4(),
            user=self.context['request'].user,
            book=book,
            tags=tags,
            media_urls=media_urls,
            **validated_data
        )


class DiscussionFeedSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)
    book = BookMiniSerializer(read_only=True)
    upvote_count = serializers.IntegerField(read_only=True)  # Changed from upvotes
    note_count = serializers.IntegerField(read_only=True)
    reprint_count = serializers.IntegerField(read_only=True)
    content = serializers.SerializerMethodField()

    class Meta:
        model = Discussion
        fields = [
            'discussion_id', 'type', 'title', 'user', 'book',
            'content', 'upvote_count', 'note_count', 'reprint_count'
        ]

    def get_content(self, obj):
        return obj.content[:150] + "..." if len(obj.content) > 150 else obj.content


class DiscussionDetailSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)
    book = BookMiniSerializer(read_only=True)
    upvote_count = serializers.IntegerField(read_only=True)  # Changed from upvotes
    note_count = serializers.IntegerField(read_only=True)
    reprint_count = serializers.IntegerField(read_only=True)
    tags = serializers.ListField(child=serializers.CharField(), read_only=True)
    media_urls = serializers.ListField(child=serializers.URLField(), read_only=True)

    class Meta:
        model = Discussion
        fields = [
            'discussion_id', 'type', 'title', 'user', 'book', 'content',
            'tags', 'media_urls', 'spoiler_flag', 'upvote_count', 'note_count',
            'reprint_count', 'created_at', 'last_edited_at'
        ]

class NoteSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)
    parent_note_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    replies = serializers.SerializerMethodField()
    likes = serializers.IntegerField(read_only=True, source='likes_count')

    class Meta:
        model = Note
        fields = ['note_id', 'user', 'content', 'parent_note_id', 'depth', 'likes', 'created_at', 'replies']

    def validate_content(self, value):
        if len(value) > 280:
            raise serializers.ValidationError("Content cannot exceed 280 characters.")
        return bleach.clean(
            markdown(value),
            tags=['p', 'strong', 'em', 'a', 'code'],
            attributes={'a': ['href']},
            protocols=['https']
        )

    def validate_parent_note_id(self, value):
        if value:
            discussion = self.context['discussion']
            try:
                parent_note = Note.objects.get(note_id=value, discussion=discussion)
            except Note.DoesNotExist:
                raise serializers.ValidationError("Parent note does not exist or is invalid.")
        return value

    def create(self, validated_data):
        discussion = self.context['discussion']
        user = self.context['request'].user
        parent_note_id = validated_data.pop('parent_note_id', None)
        parent_note = Note.objects.get(note_id=parent_note_id) if parent_note_id else None

        depth = (parent_note.depth + 1) if parent_note else 0
        return Note.objects.create(
            discussion=discussion,
            user=user,
            parent_note=parent_note,
            depth=depth,
            **validated_data
        )

    def get_replies(self, obj):
        replies = Note.objects.filter(parent_note=obj, status='active').order_by('created_at')
        return NoteSerializer(replies, many=True, context=self.context).data

class LikeResponseSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)
    discussion_title = serializers.CharField(source='discussion.title', read_only=True)
    likes = serializers.IntegerField(read_only=True, source='likes_count')  # Use annotated field

    class Meta:
        model = Note
        fields = ['note_id', 'user', 'content', 'likes', 'discussion_title']


class UpvoteResponseSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)
    upvotes = serializers.IntegerField(read_only=True, source='upvotes_count')

    class Meta:
        model = Discussion
        fields = ['discussion_id', 'user', 'title', 'upvotes']


class ReprintSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)
    discussion = DiscussionResponseSerializer(read_only=True)

    class Meta:
        model = Reprint
        fields = ['reprint_id', 'discussion', 'user', 'comment', 'created_at']


class ReprintCreateSerializer(serializers.Serializer):
    comment = serializers.CharField(max_length=280, required=False, allow_blank=True)

    def validate_comment(self, value):
        if value:
            return bleach.clean(
                markdown(value),
                tags=['p', 'strong', 'em', 'a', 'code'],
                attributes={'a': ['href']},
                protocols=['https']
            )
        return value


class TopPostSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)
    book = BookMiniSerializer(read_only=True)
    upvotes = serializers.IntegerField(read_only=True, source='upvotes_count')
    note_count = serializers.IntegerField(read_only=True)
    engagement = serializers.IntegerField(read_only=True)

    class Meta:
        model = Discussion
        fields = ['discussion_id', 'type', 'title', 'user', 'book', 'upvotes', 'note_count', 'engagement']


class SocietySerializer(serializers.ModelSerializer):
    creator = UserMiniSerializer(read_only=True)
    member_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Society
        fields = ['society_id', 'name', 'description', 'creator', 'visibility', 'member_count', 'created_at']


class CreateSocietySerializer(serializers.ModelSerializer):
    class Meta:
        model = Society
        fields = ['society_id', 'name', 'description', 'visibility']
        read_only_fields = ['society_id']

    def validate_description(self, value):
        if value:
            return bleach.clean(
                markdown(value),
                tags=['p', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'code'],
                attributes={'a': ['href', 'title']},
                protocols=['https']
            )
        return value


class SocietyMemberSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)

    class Meta:
        model = SocietyMember
        fields = ['society_id', 'user', 'role', 'joined_at']


class SocietyEventSerializer(serializers.ModelSerializer):
    society = SocietySerializer(read_only=True)
    book = BookMiniSerializer(read_only=True)
    book_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = SocietyEvent
        fields = ['event_id', 'society', 'title', 'description', 'book', 'book_id', 'event_date', 'location', 'created_at']


class CreateSocietyEventSerializer(serializers.ModelSerializer):
    book_id = serializers.UUIDField(required=False, allow_null=True)

    class Meta:
        model = SocietyEvent
        fields = ['event_id', 'title', 'description', 'book_id', 'event_date', 'location']
        read_only_fields = ['event_id']

    def validate_description(self, value):
        if value:
            return bleach.clean(
                markdown(value),
                tags=['p', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'code'],
                attributes={'a': ['href', 'title']},
                protocols=['https']
            )
        return value

    def validate_book_id(self, value):
        if value and not Book.objects.filter(book_id=value).exists():
            raise serializers.ValidationError("Invalid book ID.")
        return value

    def create(self, validated_data):
        society = self.context['society']
        book_id = validated_data.pop('book_id', None)
        book = Book.objects.get(book_id=book_id) if book_id else None
        return SocietyEvent.objects.create(
            society=society,
            book=book,
            **validated_data
        )