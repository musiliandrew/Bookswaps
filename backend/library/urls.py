from django.urls import path
from .views import BookListView, BookDetailView, BookSearchView, AddUserBookView, UserLibraryListView, BookAvailabilityUpdateView, RemoveBookFromLibraryView

urlpatterns = [
    path('books/', BookListView.as_view(), name='book-list'),
    path('books/<uuid:book_id>/', BookDetailView.as_view(), name='book-detail'),
    path('books/search/', BookSearchView.as_view(), name='book-search'),
    path('my-books/', AddUserBookView.as_view(), name='add-user-book'),
    path('my-books/', UserLibraryListView.as_view(), name='list-user-library'),
    path('my-books/<uuid:book_id>/', BookAvailabilityUpdateView.as_view(), name='update-book-availability'),
    path('my-books/<uuid:book_id>/', RemoveBookFromLibraryView.as_view(), name='remove-book-from-library'),
]