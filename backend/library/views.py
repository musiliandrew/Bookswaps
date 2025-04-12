from rest_framework import generics, filters, permissions, status
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, PermissionDenied
from django_filters.rest_framework import DjangoFilterBackend
from .models import Books, Libraries
from .serializers import LibraryBookSerializer, BookDetailSerializer, BookSearchSerializer, AddBookSerializer, UserLibraryBookSerializer, BookAvailabilityUpdateSerializer
from django.db.models import Q

class BookListView(generics.ListAPIView):
    serializer_class = LibraryBookSerializer
    queryset = Books.objects.select_related('owner')  # optimize DB hit
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    ordering_fields = ['title', 'author', 'created_at']
    ordering = ['title']  # default sort

    def get_queryset(self):
        queryset = super().get_queryset()

        # Genre filter
        genre = self.request.query_params.get('genre')
        if genre:
            queryset = queryset.filter(genre__iexact=genre)

        # Availability filter
        available = self.request.query_params.get('available')
        if available == 'exchange':
            queryset = queryset.filter(available_for_exchange=True)
        elif available == 'borrow':
            queryset = queryset.filter(available_for_borrow=True)
        elif available == 'both':
            queryset = queryset.filter(
                Q(available_for_exchange=True) | Q(available_for_borrow=True)
            )

        return queryset
    
class BookDetailView(generics.RetrieveAPIView):
    queryset = Books.objects.select_related('owner', 'original_owner')
    serializer_class = BookDetailSerializer
    lookup_field = 'book_id'

    def get_object(self):
        try:
            return self.queryset.get(book_id=self.kwargs['book_id'])
        except Books.DoesNotExist:
            raise NotFound(detail="Book not found.")
        
class BookSearchView(generics.ListAPIView):
    serializer_class = BookSearchSerializer

    def get_queryset(self):
        query = self.request.query_params.get('q', None)
        if not query:
            raise ValidationError({"detail": "Query param 'q' is required."})

        return Books.objects.filter(
            Q(title__icontains=query) |
            Q(author__icontains=query) |
            Q(isbn__icontains=query)
        ).order_by('title')
        
class AddUserBookView(generics.CreateAPIView):
    queryset = Books.objects.all()
    serializer_class = AddBookSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        book = serializer.save()

        return Response({
            "book_id": str(book.book_id),
            "title": book.title,
            "author": book.author,
            "owner": {
                "user_id": str(book.owner.user_id),
                "username": book.owner.username
            }
        }, status=status.HTTP_201_CREATED)
        
class UserLibraryListView(generics.ListAPIView):
    serializer_class = UserLibraryBookSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Libraries.objects.filter(user=self.request.user).select_related('book')
    
    
class BookAvailabilityUpdateView(generics.UpdateAPIView):
    serializer_class = BookAvailabilityUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_url_kwarg = 'book_id'
    queryset = Books.objects.all()

    def get_object(self):
        book_id = self.kwargs.get(self.lookup_url_kwarg)
        try:
            # Verify user owns this book
            library_entry = Libraries.objects.select_related('book').get(
                user=self.request.user,
                book__book_id=book_id
            )
        except Libraries.DoesNotExist:
            raise PermissionDenied("You do not own this book.")

        book = library_entry.book
        # Optional: Check lock
        if getattr(book, 'locked_until', None):
            raise PermissionDenied("This book is currently locked and cannot be updated.")

        return book

    def patch(self, request, *args, **kwargs):
        book = self.get_object()
        serializer = self.get_serializer(book, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response({
            "book_id": str(book.book_id),
            "title": book.title,
            "available_for_exchange": book.available_for_exchange,
            "available_for_borrow": book.available_for_borrow,
        }, status=status.HTTP_200_OK)
        
class RemoveBookFromLibraryView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    lookup_url_kwarg = 'book_id'
    queryset = Libraries.objects.select_related('book')

    def get_object(self):
        book_id = self.kwargs.get(self.lookup_url_kwarg)
        try:
            library_entry = Libraries.objects.get(user=self.request.user, book__book_id=book_id)
        except Libraries.DoesNotExist:
            raise PermissionDenied("You do not own this book.")
        return library_entry

    def delete(self, request, *args, **kwargs):
        library_entry = self.get_object()
        book = library_entry.book

        # Delete library entry (removes user's ownership)
        library_entry.delete()

        # Update or delete book record
        if book.copy_count and book.copy_count > 1:
            book.copy_count -= 1
            book.save()
        else:
            book.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)
    
