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
from django.db import transaction
from .models import Book, Library, Bookmark, Favorite, BookHistory, PopularBook
from .serializers import (
    LibraryBookSerializer, BookDetailSerializer, BookMiniSerializer,
    AddBookSerializer, UserLibraryBookSerializer, BookAvailabilityUpdateSerializer,
    BookHistorySerializer, BookmarkSerializer, FavoriteSerializer, PopularBookSerializer
)
from backend.swaps.models import Notification

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
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        book = serializer.save()

        Notification.objects.create(
            user=book.user,
            book=book,
            type='book_added',
            message=f"You added {book.title} to your library."
        )
        return Response(BookDetailSerializer(book).data, status=status.HTTP_201_CREATED)

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

        Notification.objects.create(
            user=self.request.user,
            book=book,
            type='book_removed',
            message=f"You removed {book.title} from your library."
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
        serializer = self.get_serializer(data={'book_id': self.kwargs['book_id'], **request.data})
        serializer.is_valid(raise_exception=True)
        bookmark = serializer.save()
        return Response(BookmarkSerializer(bookmark).data, status=status.HTTP_201_CREATED)

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
        serializer = self.get_serializer(data={'book_id': self.kwargs['book_id'], **request.data})
        serializer.is_valid(raise_exception=True)
        favorite = serializer.save()
        return Response(FavoriteSerializer(favorite).data, status=status.HTTP_201_CREATED)

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
        cache.set(cache_key, queryset, timeout=3600)  # 1 hour
        return queryset