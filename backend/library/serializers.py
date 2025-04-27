from rest_framework import serializers
from django.utils.timezone import now
from django.core.cache import cache
from django.core.exceptions import ValidationError
from .models import Book, BookHistory, Library, Bookmark, Favorite, PopularBook
from backend.users.models import CustomUser
from backend.swaps.models import Swap
from backend.users.serializers import UserMiniSerializer
import requests
import uuid
import re
from django.db import transaction



def fetch_open_library_data(isbn):
    """Fetch book data from Open Library API, cache for 24 hours."""
    cache_key = f"openlibrary_isbn_{isbn}"
    cached_data = cache.get(cache_key)
    if cached_data:
        return cached_data

    try:
        response = requests.get(
            f"https://openlibrary.org/api/books?bibkeys=ISBN:{isbn}&format=json&jscmd=data",
            timeout=5
        )
        response.raise_for_status()
        data = response.json().get(f"ISBN:{isbn}", {})
        result = {
            'title': data.get('title', ''),
            'author': ', '.join(author['name'] for author in data.get('authors', [])) or '',
            'year': data.get('publish_date', '').split()[-1] if data.get('publish_date') else None,
            'cover_image_url': data.get('cover', {}).get('large', '') or data.get('cover', {}).get('medium', ''),
            'synopsis': data.get('notes', '') or ''
        }
        cache.set(cache_key, result, timeout=86400)  # 24 hours
        return result
    except (requests.RequestException, ValueError):
        return {}


class BookMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['book_id', 'title', 'author']


class BookHistorySerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)
    swap_id = serializers.UUIDField(source='swap.swap_id', read_only=True, allow_null=True)

    class Meta:
        model = BookHistory
        fields = ['history_id', 'user', 'swap_id', 'status', 'start_date', 'end_date', 'notes']


class LibraryBookSerializer(serializers.ModelSerializer):
    owner = UserMiniSerializer(read_only=True)

    class Meta:
        model = Book
        fields = [
            'book_id', 'title', 'author', 'genre', 'cover_image_url',
            'available_for_exchange', 'available_for_borrow', 'owner',
            'qr_code_url', 'condition', 'locked_until'
        ]


class BookDetailSerializer(serializers.ModelSerializer):
    owner = UserMiniSerializer(read_only=True)
    original_owner = UserMiniSerializer(read_only=True)
    history = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = [
            'book_id', 'title', 'author', 'genre', 'synopsis', 'isbn',
            'cover_image_url', 'available_for_exchange', 'available_for_borrow',
            'owner', 'original_owner', 'qr_code_url', 'condition', 'copy_count',
            'locked_until', 'created_at', 'updated_at', 'history'
        ]

    def get_history(self, obj):
        history_qs = BookHistory.objects.filter(book=obj).select_related('user', 'swap').order_by('-start_date')[:5]
        return BookHistorySerializer(history_qs, many=True).data


class AddBookSerializer(serializers.ModelSerializer):
    condition = serializers.ChoiceField(
        choices=Book.condition.field.choices, write_only=True,
        db_comment='Condition for Book entry'
    )
    isbn = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Book
        fields = [
            'title', 'author', 'genre', 'isbn', 'condition', 'synopsis',
            'available_for_exchange', 'available_for_borrow', 'year', 'cover_image_url'
        ]

    def validate_isbn(self, value):
        if not value:
            return value
        cleaned_isbn = re.sub(r'[- ]', '', value)
        if not re.match(r'^(?:97[89][0-9]{10}|[0-9]{9}[0-9X])$', cleaned_isbn):
            raise ValidationError("Invalid ISBN-10 or ISBN-13 format.")
        if Book.objects.filter(isbn=cleaned_isbn).exists():
            raise ValidationError("A book with this ISBN already exists.")
        return cleaned_isbn

    def validate_cover_image_url(self, value):
        if not value:
            return value
        if not value.startswith('https://'):
            raise ValidationError("Cover image URL must use HTTPS.")
        allowed_domains = ['Cabeen', 'openlibrary.org', 'bookswap-bucket.s3.amazonaws.com']
        if not any(domain in value for domain in allowed_domains):
            raise ValidationError("Cover image URL must be from an allowed domain.")
        return value

    def validate(self, data):
        isbn = data.get('isbn')
        if isbn:
            open_library_data = fetch_open_library_data(isbn)
            if open_library_data:
                data['title'] = data.get('title') or open_library_data['title']
                data['author'] = data.get('author') or open_library_data['author']
                data['year'] = data.get('year') or open_library_data['year']
                data['cover_image_url'] = data.get('cover_image_url') or open_library_data['cover_image_url']
                data['synopsis'] = data.get('synopsis') or open_library_data['synopsis']
        if not data.get('title') or not data.get('author'):
            raise ValidationError("Title and author are required.")
        return data

    def create(self, validated_data):
        user = self.context['request'].user
        condition = validated_data.pop('condition')
        # Placeholder for Celery-generated QR code URL
        qr_code_url = f"https://bookswap-bucket.s3.amazonaws.com/qr/{uuid.uuid4()}.png"

        with transaction.atomic():
            book = Book.objects.create(
                **validated_data,
                book_id=uuid.uuid4(),
                owner=user,
                original_owner=user,
                qr_code_url=qr_code_url,
                condition=condition,
                created_at=now()
            )
            Library.objects.create(
                user=user,
                book=book,
                status='owned',
                added_at=now()
            )
            BookHistory.objects.create(
                book=book,
                user=user,
                status='added',
                start_date=now(),
                notes="Book added to library"
            )
        return book


class UserLibraryBookSerializer(serializers.ModelSerializer):
    book_id = serializers.UUIDField(source='book.book_id', read_only=True)
    title = serializers.CharField(source='book.title', read_only=True)
    author = serializers.CharField(source='book.author', read_only=True)
    available_for_exchange = serializers.BooleanField(source='book.available_for_exchange', read_only=True)
    qr_code_url = serializers.URLField(source='book.qr_code_url', read_only=True)
    locked_until = serializers.DateTimeField(source='book.locked_until', read_only=True)

    class Meta:
        model = Library
        fields = [
            'library_id', 'book_id', 'title', 'author', 'status',
            'available_for_exchange', 'qr_code_url', 'locked_until', 'added_at'
        ]


class BookAvailabilityUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['available_for_exchange', 'available_for_borrow']

    def validate(self, data):
        if self.instance and self.instance.locked_until and self.instance.locked_until > now():
            raise ValidationError("Cannot update availability for a locked book.")
        return data


class BookmarkSerializer(serializers.ModelSerializer):
    book = BookMiniSerializer(read_only=True)
    book_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Bookmark
        fields = ['bookmark_id', 'book', 'book_id', 'notify_on_available', 'active', 'created_at']

    def validate_book_id(self, value):
        if not Book.objects.filter(book_id=value).exists():
            raise ValidationError("Invalid book ID.")
        return value

    def create(self, validated_data):
        book_id = validated_data.pop('book_id')
        return Bookmark.objects.create(
            user=self.context['request'].user,
            book=Book.objects.get(book_id=book_id),
            **validated_data
        )


class FavoriteSerializer(serializers.ModelSerializer):
    book = BookMiniSerializer(read_only=True)
    book_id = serializers.UUIDField(write_only=True)

    class Meta:
        model = Favorite
        fields = ['favorite_id', 'book', 'book_id', 'reason', 'active', 'notified_on_match', 'created_at']

    def validate_book_id(self, value):
        if not Book.objects.filter(book_id=value).exists():
            raise ValidationError("Invalid book ID.")
        return value

    def create(self, validated_data):
        book_id = validated_data.pop('book_id')
        return Favorite.objects.create(
            user=self.context['request'].user,
            book=Book.objects.get(book_id=book_id),
            **validated_data
        )


class PopularBookSerializer(serializers.ModelSerializer):
    book = BookMiniSerializer(read_only=True)

    class Meta:
        model = PopularBook
        fields = ['book', 'swap_count', 'last_updated']