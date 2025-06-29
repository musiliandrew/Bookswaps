from rest_framework import generics, filters, status
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, PermissionDenied, NotFound
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.core.cache import cache
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.utils.timezone import now
from django.db import transaction, IntegrityError
import logging
import requests
import json
from django.conf import settings
from .models import Book, Library, Bookmark, Favorite, BookHistory, PopularBook
from .serializers import (
    LibraryBookSerializer, BookDetailSerializer, BookMiniSerializer,
    AddBookSerializer, UserLibraryBookSerializer, BookAvailabilityUpdateSerializer,
    BookHistorySerializer, BookmarkSerializer, FavoriteSerializer, PopularBookSerializer
)
from backend.swaps.models import Notification
from backend.utils.websocket import send_notification_to_user

logger = logging.getLogger(__name__)

class StandardPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100

class BookListView(generics.ListAPIView):
    serializer_class = LibraryBookSerializer
    queryset = Book.objects.select_related('user')
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    ordering_fields = ['title', 'author', 'created_at']
    ordering = ['title']
    pagination_class = StandardPagination

    def get_queryset(self):
        cache_key = f"book_list_{self.request.query_params.get('genre', '')}_{self.request.query_params.get('available', '')}"
        cached_queryset = cache.get(cache_key)
        if cached_queryset:
            return cached_queryset

        queryset = super().get_queryset()
        genre = self.request.query_params.get('genre')
        if genre:
            queryset = queryset.filter(genre__iexact=genre)

        available = self.request.query_params.get('available')
        if available == 'exchange':
            queryset = queryset.filter(available_for_exchange=True, locked_until__isnull=True)
        elif available == 'borrow':
            queryset = queryset.filter(available_for_borrow=True, locked_until__isnull=True)
        elif available == 'both':
            queryset = queryset.filter(
                Q(available_for_exchange=True) | Q(available_for_borrow=True),
                locked_until__isnull=True
            )

        cache.set(cache_key, queryset, timeout=300)  # 5 minutes
        return queryset

class BookDetailView(generics.RetrieveAPIView):
    queryset = Book.objects.select_related('user', 'original_owner')
    serializer_class = BookDetailSerializer
    lookup_field = 'book_id'

    def get_object(self):
        try:
            return self.queryset.get(book_id=self.kwargs['book_id'])
        except Book.DoesNotExist:
            raise NotFound(detail="Book not found.")

class BookSearchView(generics.ListAPIView):
    serializer_class = BookMiniSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        query = self.request.query_params.get('q', '').strip()
        if len(query) < 3:
            raise ValidationError({"detail": "Query param 'q' must be at least 3 characters."})

        cache_key = f"book_search_{query}"
        cached_queryset = cache.get(cache_key)
        if cached_queryset:
            return cached_queryset

        queryset = Book.objects.filter(
            Q(title__icontains=query) |
            Q(author__icontains=query) |
            Q(isbn__iexact=query)
        ).order_by('title')
        cache.set(cache_key, queryset, timeout=300)  # 5 minutes
        return queryset

class AddUserBookView(generics.CreateAPIView):
    queryset = Book.objects.all()
    serializer_class = AddBookSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            book = serializer.save()

            notification = Notification.objects.create(
                user=book.user,
                book=book,
                type='book_added',
                message=f"You added {book.title} to your library."
            )
            # Send notification via WebSocket to the user's group
            send_notification_to_user(
                book.user.user_id,
                {
                    "notification_id": str(notification.notification_id),
                    "message": f"You added {book.title} to your library.",
                    "type": "book_added",
                    "content_type": "book",
                    "content_id": str(book.book_id),
                    "follow_id": None
                }
            )
            return Response(BookDetailSerializer(book).data, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            # Handle validation errors (including duplicate ISBN)
            error_detail = e.detail if hasattr(e, 'detail') else str(e)
            return Response(
                {"error": "Validation failed", "details": error_detail},
                status=status.HTTP_400_BAD_REQUEST
            )
        except IntegrityError as e:
            # Handle database constraint violations
            if 'isbn' in str(e).lower():
                return Response(
                    {"error": "A book with this ISBN already exists in the system"},
                    status=status.HTTP_409_CONFLICT
                )
            return Response(
                {"error": "Database constraint violation", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except Exception as e:
            # Handle unexpected errors
            logger.error(f"Unexpected error adding book: {str(e)}")
            return Response(
                {"error": "An unexpected error occurred while adding the book"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class UserLibraryListView(generics.ListAPIView):
    serializer_class = UserLibraryBookSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardPagination

    def get_queryset(self):
        cache_key = f"user_library_{self.request.user.user_id}"
        cached_queryset = cache.get(cache_key)
        if cached_queryset:
            return cached_queryset

        queryset = Library.objects.filter(user=self.request.user).select_related('book', 'book__user')
        cache.set(cache_key, queryset, timeout=300)  # 5 minutes
        return queryset

class BookAvailabilityUpdateView(generics.UpdateAPIView):
    serializer_class = BookAvailabilityUpdateSerializer
    permission_classes = [IsAuthenticated]
    lookup_url_kwarg = 'book_id'
    queryset = Book.objects.all()

    def get_object(self):
        book_id = self.kwargs.get(self.lookup_url_kwarg)
        try:
            library_entry = Library.objects.select_related('book').get(
                user=self.request.user,
                book__book_id=book_id,
                status='owned'
            )
        except Library.DoesNotExist:
            raise PermissionDenied("You do not own this book.")
        return library_entry.book

    def update(self, request, *args, **kwargs):
        book = self.get_object()
        serializer = self.get_serializer(book, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        if book.available_for_exchange or book.available_for_borrow:
            bookmarks = Bookmark.objects.filter(
                book=book, notify_on_available=True, active=True
            ).select_related('user')
            notifications = [
                Notification(
                    user=bookmark.user,
                    book=book,
                    type='book_available',
                    message=f"{book.title} is now available for {'exchange' if book.available_for_exchange else 'borrowing'}."
                )
                for bookmark in bookmarks
            ]
            Notification.objects.bulk_create(notifications)
            # Send notifications via WebSocket to each bookmarking user's group
            for notification in notifications:
                send_notification_to_user(
                    notification.user.user_id,
                    {
                        "notification_id": str(notification.notification_id),
                        "message": f"{book.title} is now available for {'exchange' if book.available_for_exchange else 'borrowing'}.",
                        "type": "book_available",
                        "content_type": "book",
                        "content_id": str(book.book_id),
                        "follow_id": None
                    }
                )

        return Response(BookDetailSerializer(book).data, status=status.HTTP_200_OK)

class RemoveBookFromLibraryView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    lookup_url_kwarg = 'book_id'
    queryset = Library.objects.select_related('book')

    def get_object(self):
        book_id = self.kwargs.get(self.lookup_url_kwarg)
        try:
            library_entry = Library.objects.get(
                user=self.request.user,
                book__book_id=book_id,
                status='owned'
            )
        except Library.DoesNotExist:
            raise PermissionDenied("You do not own this book.")
        return library_entry

    def perform_destroy(self, instance):
        book = instance.book
        with transaction.atomic():
            instance.delete()
            if book.copy_count > 1:
                book.copy_count -= 1
                book.save()
            else:
                book.user = None
                book.available_for_exchange = False
                book.available_for_borrow = False
                book.save()

            BookHistory.objects.create(
                book=book,
                user=self.request.user,
                status='removed',
                start_date=now(),
                notes=f"Book removed from {self.request.user.username}'s library"
            )

            notification = Notification.objects.create(
                user=self.request.user,
                book=book,
                type='book_removed',
                message=f"You removed {book.title} from your library."
            )
            # Send notification via WebSocket to the user's group
            send_notification_to_user(
                self.request.user.user_id,
                {
                    "notification_id": str(notification.notification_id),
                    "message": f"You removed {book.title} from your library.",
                    "type": "book_removed",
                    "content_type": "book",
                    "content_id": str(book.book_id),
                    "follow_id": None
                }
            )

class BookHistoryView(generics.ListAPIView):
    serializer_class = BookHistorySerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardPagination

    def get_queryset(self):
        book_id = self.request.query_params.get('book_id')
        cache_key = f"book_history_{book_id or self.request.user.user_id}"
        cached_queryset = cache.get(cache_key)
        if cached_queryset:
            return cached_queryset

        if book_id:
            queryset = BookHistory.objects.filter(
                book__book_id=book_id
            ).select_related('book', 'user', 'swap').order_by('-start_date')
        else:
            queryset = BookHistory.objects.filter(
                book__user=self.request.user
            ).select_related('book', 'user', 'swap').order_by('-start_date')
        cache.set(cache_key, queryset, timeout=300)  # 5 minutes
        return queryset

class BookmarkBookView(generics.CreateAPIView):
    serializer_class = BookmarkSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data={'book_id': self.kwargs['book_id'], **request.data})
            serializer.is_valid(raise_exception=True)
            bookmark = serializer.save()
            return Response(BookmarkSerializer(bookmark).data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            # Handle structured validation errors from serializer
            if hasattr(e, 'detail') and isinstance(e.detail, dict):
                error_data = e.detail
                if error_data.get('error_type') == 'DUPLICATE_BOOKMARK':
                    return Response(error_data, status=status.HTTP_409_CONFLICT)
            # Handle other validation errors
            return Response(
                {"error": "Validation failed", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except IntegrityError as e:
            # Fallback for any IntegrityError that wasn't caught by serializer
            if 'unique' in str(e).lower() and ('user' in str(e).lower() or 'book' in str(e).lower()):
                return Response(
                    {
                        "error": "You have already bookmarked this book",
                        "error_type": "DUPLICATE_BOOKMARK",
                        "details": "This book is already in your bookmarks"
                    },
                    status=status.HTTP_409_CONFLICT
                )
            return Response(
                {"error": "Database constraint violation", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class RemoveBookmarkView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    lookup_url_kwarg = 'book_id'

    def get_object(self):
        book = get_object_or_404(Book, book_id=self.kwargs['book_id'])
        try:
            return Bookmark.objects.get(user=self.request.user, book=book, active=True)
        except Bookmark.DoesNotExist:
            raise NotFound("Bookmark not found.")

    def perform_destroy(self, instance):
        instance.active = False
        instance.save()

class FavoriteBookView(generics.CreateAPIView):
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data={'book_id': self.kwargs['book_id'], **request.data})
            serializer.is_valid(raise_exception=True)
            favorite = serializer.save()
            return Response(FavoriteSerializer(favorite).data, status=status.HTTP_201_CREATED)
        except ValidationError as e:
            # Handle structured validation errors from serializer
            if hasattr(e, 'detail') and isinstance(e.detail, dict):
                error_data = e.detail
                if error_data.get('error_type') == 'DUPLICATE_FAVORITE':
                    return Response(error_data, status=status.HTTP_409_CONFLICT)
            # Handle other validation errors
            return Response(
                {"error": "Validation failed", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
        except IntegrityError as e:
            # Fallback for any IntegrityError that wasn't caught by serializer
            if 'unique' in str(e).lower() and ('user' in str(e).lower() or 'book' in str(e).lower()):
                return Response(
                    {
                        "error": "You have already favorited this book",
                        "error_type": "DUPLICATE_FAVORITE",
                        "details": "This book is already in your favorites"
                    },
                    status=status.HTTP_409_CONFLICT
                )
            return Response(
                {"error": "Database constraint violation", "details": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class UnfavoriteBookView(generics.DestroyAPIView):
    permission_classes = [IsAuthenticated]
    lookup_url_kwarg = 'book_id'

    def get_object(self):
        book = get_object_or_404(Book, book_id=self.kwargs['book_id'])
        try:
            return Favorite.objects.get(user=self.request.user, book=book, active=True)
        except Favorite.DoesNotExist:
            raise NotFound("Favorite not found.")

    def perform_destroy(self, instance):
        instance.active = False
        instance.save()

class MyBookmarksView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BookMiniSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        return Book.objects.filter(
            bookmarked_by__user=self.request.user,
            bookmarked_by__active=True
        ).select_related('user')

class MyFavoritesView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BookMiniSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        return Book.objects.filter(
            favorited_by__user=self.request.user,
            favorited_by__active=True
        ).select_related('user')

class RecommendedBooksView(generics.ListAPIView):
    serializer_class = PopularBookSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardPagination

    def get_queryset(self):
        cache_key = "recommended_books"
        cached_queryset = cache.get(cache_key)
        if cached_queryset:
            return cached_queryset

        queryset = PopularBook.objects.select_related('book', 'book__user').order_by('-swap_count')[:50]
        if not queryset:
            # Fallback to all books if PopularBook is empty
            books = Book.objects.select_related('user').filter(available_for_exchange=True)[:50]
            queryset = [
                PopularBook(book=book, swap_count=0, last_updated=book.updated_at)
                for book in books
            ]

        cache.set(cache_key, queryset, timeout=3600)  # 1 hour
        return queryset


class OpenLibrarySearchView(APIView):
    """
    Search books from Open Library API with intelligent search and auto-complete
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.query_params.get('q', '').strip()
        search_type = request.query_params.get('type', 'general')  # general, title, author, isbn
        limit = min(int(request.query_params.get('limit', 10)), 20)  # Max 20 results

        if not query or len(query) < 2:
            return Response({
                'results': [],
                'message': 'Query must be at least 2 characters long'
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check cache first
        cache_key = f"openlibrary_search_{search_type}_{query.lower()}_{limit}"
        cached_results = cache.get(cache_key)
        if cached_results:
            return Response(cached_results, status=status.HTTP_200_OK)

        try:
            results = self._search_open_library(query, search_type, limit)

            # Cache results for 1 hour
            response_data = {
                'results': results,
                'query': query,
                'search_type': search_type,
                'count': len(results)
            }
            cache.set(cache_key, response_data, timeout=3600)

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Open Library search error: {str(e)}")
            return Response({
                'results': [],
                'error': 'Search service temporarily unavailable',
                'message': 'Please try again later or add the book manually'
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

    def _search_open_library(self, query, search_type, limit):
        """
        Search Open Library API with different search strategies
        """
        results = []

        if search_type == 'isbn':
            # Direct ISBN lookup
            results = self._search_by_isbn(query)
        elif search_type == 'title':
            # Title-specific search
            results = self._search_by_title(query, limit)
        elif search_type == 'author':
            # Author-specific search
            results = self._search_by_author(query, limit)
        else:
            # General search - try multiple approaches
            results = self._general_search(query, limit)

        return results

    def _search_by_isbn(self, isbn):
        """Search by ISBN using Open Library Books API"""
        try:
            # Clean ISBN (remove hyphens, spaces)
            clean_isbn = ''.join(filter(str.isdigit, isbn))
            if len(clean_isbn) not in [10, 13]:
                return []

            url = f"https://openlibrary.org/api/books?bibkeys=ISBN:{clean_isbn}&format=json&jscmd=data"
            response = requests.get(url, timeout=5)
            response.raise_for_status()

            data = response.json()
            book_data = data.get(f"ISBN:{clean_isbn}", {})

            if book_data:
                return [self._format_book_data(book_data, clean_isbn)]
            return []

        except Exception as e:
            logger.error(f"ISBN search error: {str(e)}")
            return []

    def _search_by_title(self, title, limit):
        """Search by title using Open Library Search API"""
        try:
            url = "https://openlibrary.org/search.json"
            params = {
                'title': title,
                'limit': limit,
                'fields': 'key,title,author_name,first_publish_year,isbn,cover_i,publisher,subject'
            }

            response = requests.get(url, params=params, timeout=5)
            response.raise_for_status()

            data = response.json()
            books = data.get('docs', [])

            return [self._format_search_result(book) for book in books if book.get('title')]

        except Exception as e:
            logger.error(f"Title search error: {str(e)}")
            return []

    def _search_by_author(self, author, limit):
        """Search by author using Open Library Search API"""
        try:
            url = "https://openlibrary.org/search.json"
            params = {
                'author': author,
                'limit': limit,
                'fields': 'key,title,author_name,first_publish_year,isbn,cover_i,publisher,subject'
            }

            response = requests.get(url, params=params, timeout=5)
            response.raise_for_status()

            data = response.json()
            books = data.get('docs', [])

            return [self._format_search_result(book) for book in books if book.get('title')]

        except Exception as e:
            logger.error(f"Author search error: {str(e)}")
            return []

    def _general_search(self, query, limit):
        """General search that tries multiple approaches"""
        try:
            url = "https://openlibrary.org/search.json"
            params = {
                'q': query,
                'limit': limit,
                'fields': 'key,title,author_name,first_publish_year,isbn,cover_i,publisher,subject'
            }

            response = requests.get(url, params=params, timeout=5)
            response.raise_for_status()

            data = response.json()
            books = data.get('docs', [])

            return [self._format_search_result(book) for book in books if book.get('title')]

        except Exception as e:
            logger.error(f"General search error: {str(e)}")
            return []

    def _format_book_data(self, book_data, isbn=None):
        """Format book data from Books API response"""
        # Extract cover image
        cover_url = ''
        if book_data.get('cover'):
            cover_url = book_data['cover'].get('large', '') or book_data['cover'].get('medium', '') or book_data['cover'].get('small', '')

        # Extract authors
        authors = []
        if book_data.get('authors'):
            authors = [author.get('name', '') for author in book_data['authors']]

        # Extract subjects/genres
        subjects = book_data.get('subjects', [])
        genres = [subject.get('name', '') for subject in subjects[:5]] if subjects else []

        return {
            'title': book_data.get('title', ''),
            'author': ', '.join(authors) if authors else '',
            'authors': authors,
            'isbn': isbn or '',
            'year': self._extract_year(book_data.get('publish_date', '')),
            'publisher': ', '.join([pub.get('name', '') for pub in book_data.get('publishers', [])]),
            'cover_image_url': cover_url,
            'synopsis': book_data.get('notes', '') or '',
            'genres': genres,
            'page_count': book_data.get('number_of_pages'),
            'open_library_key': book_data.get('key', ''),
            'source': 'open_library'
        }

    def _format_search_result(self, book):
        """Format book data from Search API response"""
        # Extract cover image
        cover_url = ''
        if book.get('cover_i'):
            cover_url = f"https://covers.openlibrary.org/b/id/{book['cover_i']}-L.jpg"

        # Extract authors
        authors = book.get('author_name', [])

        # Extract ISBN
        isbn = ''
        if book.get('isbn'):
            # Get the first valid ISBN
            for isbn_candidate in book['isbn']:
                clean_isbn = ''.join(filter(str.isdigit, isbn_candidate))
                if len(clean_isbn) in [10, 13]:
                    isbn = clean_isbn
                    break

        # Extract genres from subjects
        subjects = book.get('subject', [])
        genres = subjects[:5] if subjects else []

        return {
            'title': book.get('title', ''),
            'author': ', '.join(authors) if authors else '',
            'authors': authors,
            'isbn': isbn,
            'year': book.get('first_publish_year'),
            'publisher': ', '.join(book.get('publisher', [])) if book.get('publisher') else '',
            'cover_image_url': cover_url,
            'synopsis': '',  # Search API doesn't provide synopsis
            'genres': genres,
            'page_count': None,
            'open_library_key': book.get('key', ''),
            'source': 'open_library'
        }

    def _extract_year(self, publish_date):
        """Extract year from publish date string"""
        if not publish_date:
            return None

        # Try to extract 4-digit year
        import re
        year_match = re.search(r'\b(19|20)\d{2}\b', str(publish_date))
        if year_match:
            return int(year_match.group())

        return None