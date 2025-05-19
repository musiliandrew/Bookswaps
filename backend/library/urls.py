from django.urls import path
from .views import (
    BookListView, BookDetailView, BookSearchView, AddUserBookView,
    UserLibraryListView, BookAvailabilityUpdateView, RemoveBookFromLibraryView,
    BookmarkBookView, RemoveBookmarkView, FavoriteBookView, UnfavoriteBookView,
    MyBookmarksView, MyFavoritesView, BookHistoryView, RecommendedBooksView
)

app_name = 'library'

urlpatterns = [
    path('books/', BookListView.as_view(), name='book_list'),
    path('books/add/', AddUserBookView.as_view(), name='add_book'),
    path('books/<uuid:book_id>/', BookDetailView.as_view(), name='book_detail'),
    path('books/search/', BookSearchView.as_view(), name='book_search'),
    path('library/', UserLibraryListView.as_view(), name='user_library'),
    path('books/<uuid:book_id>/availability/', BookAvailabilityUpdateView.as_view(), name='update_availability'),
    path('books/<uuid:book_id>/remove/', RemoveBookFromLibraryView.as_view(), name='remove_book'),
    path('books/<uuid:book_id>/bookmark/', BookmarkBookView.as_view(), name='bookmark_book'),
    path('books/<uuid:book_id>/bookmark/remove/', RemoveBookmarkView.as_view(), name='remove_bookmark'),
    path('books/<uuid:book_id>/favorite/', FavoriteBookView.as_view(), name='favorite_book'),
    path('books/<uuid:book_id>/favorite/remove/', UnfavoriteBookView.as_view(), name='unfavorite_book'),
    path('bookmarks/', MyBookmarksView.as_view(), name='my_bookmarks'),
    path('favorites/', MyFavoritesView.as_view(), name='my_favorites'),
    
    path('history/', BookHistoryView.as_view(), name='book_history'),
    path('recommended/', RecommendedBooksView.as_view(), name='recommended_books'),
]