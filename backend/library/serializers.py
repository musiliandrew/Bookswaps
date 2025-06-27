from rest_framework import serializers
from django.utils import timezone
from django.core.cache import cache
from django.core.exceptions import ValidationError
from django.db import transaction, IntegrityError
from .models import Book, BookHistory, Library, Bookmark, Favorite, PopularBook
from backend.users.models import CustomUser
from backend.swaps.models import Swap
from backend.users.serializers import UserMiniSerializer
import requests
import uuid
import re

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
    book = BookMiniSerializer(read_only=True)
    swap_id = serializers.UUIDField(source='swap.swap_id', read_only=True, allow_null=True)

    class Meta:
        model = BookHistory
        fields = ['history_id', 'book', 'user', 'swap_id', 'status', 'start_date', 'end_date', 'notes']

class LibraryBookSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)

    class Meta:
        model = Book
        fields = [
            'book_id', 'title', 'author', 'genre', 'cover_image_url',
            'available_for_exchange', 'available_for_borrow', 'user',
            'qr_code_url', 'condition', 'locked_until'
        ]

class BookDetailSerializer(serializers.ModelSerializer):
    user = UserMiniSerializer(read_only=True)
    original_owner = UserMiniSerializer(read_only=True)
    history = serializers.SerializerMethodField()

    class Meta:
        model = Book
        fields = [
            'book_id', 'title', 'author', 'genre', 'synopsis', 'isbn',
            'cover_image_url', 'available_for_exchange', 'available_for_borrow',
            'user', 'original_owner', 'qr_code_url', 'condition', 'copy_count',
            'locked_until', 'created_at', 'updated_at', 'history'
        ]

    def get_history(self, obj):
        history_qs = BookHistory.objects.filter(book=obj).select_related('user', 'swap').order_by('-start_date')[:5]
        return BookHistorySerializer(history_qs, many=True).data

class AddBookSerializer(serializers.ModelSerializer):
    condition = serializers.ChoiceField(
        choices=Book.condition.field.choices, write_only=True
    )
    isbn = serializers.CharField(required=False, allow_blank=True)
    cover_image = serializers.ImageField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Book
        fields = [
            'title', 'author', 'genre', 'isbn', 'condition', 'synopsis',
            'available_for_exchange', 'available_for_borrow', 'year', 'cover_image_url', 'cover_image'
        ]

    def validate_isbn(self, value):
        if not value:
            return value
        cleaned_isbn = re.sub(r'[- ]', '', value)
        if not re.match(r'^(?:97[89][0-9]{10}|[0-9]{9}[0-9X])$', cleaned_isbn):
            raise ValidationError("Invalid ISBN-10 or ISBN-13 format.")

        # Check for existing book with same ISBN
        existing_book = Book.objects.filter(isbn=cleaned_isbn).first()
        if existing_book:
            raise ValidationError({
                "isbn": f"A book with this ISBN already exists: '{existing_book.title}' by {existing_book.author}",
                "existing_book": {
                    "id": str(existing_book.book_id),
                    "title": existing_book.title,
                    "author": existing_book.author,
                    "owner": existing_book.user.username if existing_book.user else "Unknown"
                }
            })
        return cleaned_isbn

    def validate_cover_image_url(self, value):
        if not value:
            return value
        if not value.startswith(('https://', 'http://')):
            raise ValidationError("Cover image URL must use HTTP or HTTPS.")

        from django.conf import settings
        allowed_domains = [
            'openlibrary.org',
            'covers.openlibrary.org',
            'bookswap-bucket.s3.amazonaws.com',  # Legacy AWS S3
            settings.AWS_S3_ENDPOINT_URL.replace('http://', '').replace('https://', '')  # MinIO domain
        ]

        if not any(domain in value for domain in allowed_domains):
            raise ValidationError(f"Cover image URL must be from an allowed domain: {', '.join(allowed_domains)}")
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
        from backend.utils.error_handlers import log_book_operation

        user = self.context['request'].user
        condition = validated_data.pop('condition')
        cover_image_file = validated_data.pop('cover_image', None)

        try:
            # Generate book ID first
            book_id = uuid.uuid4()

            # Handle cover image upload
            if cover_image_file:
                from backend.utils.minio_storage import upload_book_cover
                validated_data['cover_image_url'] = upload_book_cover(cover_image_file, book_id)

            # Generate QR code URL using MinIO
            from backend.utils.minio_storage import get_minio_url
            qr_id = uuid.uuid4()
            qr_code_url = get_minio_url(f"qr-codes/{qr_id}.png")
            now = timezone.now()

            with transaction.atomic():
                book = Book.objects.create(
                    **validated_data,
                    book_id=book_id,
                    user=user,
                    original_owner=user,
                    qr_code_url=qr_code_url,
                    condition=condition,
                    created_at=now
                )
                Library.objects.create(
                    user=user,
                    book=book,
                    status='owned',
                    added_at=now
                )
                BookHistory.objects.create(
                    book=book,
                    user=user,
                    status='added',
                    start_date=now,
                    notes="Book added to library"
                )

            # Log successful operation
            log_book_operation('add_book', validated_data, user, success=True)
            return book

        except Exception as e:
            # Log failed operation
            log_book_operation('add_book', validated_data, user, success=False, error=e)
            raise

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
        if self.instance and self.instance.locked_until and self.instance.locked_until > timezone.now():
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
        book = Book.objects.get(book_id=book_id)
        user = self.context['request'].user

        # Check if bookmark already exists and is active
        existing_bookmark = Bookmark.objects.filter(user=user, book=book).first()
        if existing_bookmark:
            if existing_bookmark.active:
                raise ValidationError({
                    "error": "You have already bookmarked this book",
                    "error_type": "DUPLICATE_BOOKMARK",
                    "details": "This book is already in your bookmarks"
                })
            else:
                # Reactivate the existing bookmark
                existing_bookmark.active = True
                existing_bookmark.notify_on_available = validated_data.get('notify_on_available', existing_bookmark.notify_on_available)
                existing_bookmark.save()
                return existing_bookmark

        try:
            return Bookmark.objects.create(
                user=user,
                book=book,
                **validated_data
            )
        except IntegrityError:
            # Handle race condition where bookmark was created between check and create
            raise ValidationError({
                "error": "You have already bookmarked this book",
                "error_type": "DUPLICATE_BOOKMARK",
                "details": "This book is already in your bookmarks"
            })

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
        book = Book.objects.get(book_id=book_id)
        user = self.context['request'].user

        # Check if favorite already exists and is active
        existing_favorite = Favorite.objects.filter(user=user, book=book).first()
        if existing_favorite:
            if existing_favorite.active:
                raise ValidationError({
                    "error": "You have already favorited this book",
                    "error_type": "DUPLICATE_FAVORITE",
                    "details": "This book is already in your favorites"
                })
            else:
                # Reactivate the existing favorite
                existing_favorite.active = True
                existing_favorite.reason = validated_data.get('reason', existing_favorite.reason)
                existing_favorite.save()
                return existing_favorite

        try:
            return Favorite.objects.create(
                user=user,
                book=book,
                **validated_data
            )
        except IntegrityError:
            # Handle race condition where favorite was created between check and create
            raise ValidationError({
                "error": "You have already favorited this book",
                "error_type": "DUPLICATE_FAVORITE",
                "details": "This book is already in your favorites"
            })

class PopularBookSerializer(serializers.ModelSerializer):
    book = BookMiniSerializer(read_only=True)

    class Meta:
        model = PopularBook
        fields = ['book', 'swap_count', 'last_updated']