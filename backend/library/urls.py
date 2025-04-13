from django.urls import path
from .views import BookListView, MyBookmarksView, MyFavoritesView, BookDetailView, BookSearchView, AddUserBookView, UserLibraryListView, BookAvailabilityUpdateView, RemoveBookFromLibraryView, BookmarkBookView, RemoveBookmarkView, FavoriteBookView, UnfavoriteBookView

urlpatterns = [
    path('books/', BookListView.as_view(), name='book-list'),
    path('books/<uuid:book_id>/', BookDetailView.as_view(), name='book-detail'),
    path('books/search/', BookSearchView.as_view(), name='book-search'),
    path('my-books/', AddUserBookView.as_view(), name='add-user-book'),
    path('my-books/', UserLibraryListView.as_view(), name='list-user-library'),
    path('my-books/<uuid:book_id>/', BookAvailabilityUpdateView.as_view(), name='update-book-availability'),
    path('my-books/<uuid:book_id>/delete', RemoveBookFromLibraryView.as_view(), name='remove-book-from-library'),
    path('books/<uuid:book_id>/bookmark/', BookmarkBookView.as_view(), name='bookmark-book'),
    path('books/<uuid:book_id>/bookmark/delete', RemoveBookmarkView.as_view(), name='remove-bookmark'),
    path('books/<uuid:book_id>/favorite/', FavoriteBookView.as_view(), name='favorite-book'),
    path('books/<uuid:book_id>/favorite/delete', UnfavoriteBookView.as_view(), name='unfavorite-book'),
    path('my-bookmarks/', MyBookmarksView.as_view(), name='my-bookmarks'),
    path('my-favorites/', MyFavoritesView.as_view(), name='my-favorites'),
]