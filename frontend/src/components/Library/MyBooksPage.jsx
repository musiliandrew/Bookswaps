import React, { useState, useEffect } from 'react';
import { useLibrary } from '../../hooks/useLibrary';
import { toast } from 'react-toastify';
import Pagination from '../Common/Pagination';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import BookCard from '../Library/MyBooks/BookCard';
import TabsNavigation from '../Library/MyBooks/TabsNavigation';
import AddBookModal from '../Library/MyBooks/AddBookModal';
import { PlusIcon } from '@heroicons/react/24/outline';

const MyBooksPage = () => {
  const {
    getUserLibrary,
    addBook,
    updateAvailability,
    removeBook,
    bookmarkBook,
    removeBookmark,
    favoriteBook,
    unfavoriteBook,
    getBookmarks,
    getFavorites,
    getBookHistory,
    userLibrary,
    bookmarks,
    favorites,
    history,
    isLoading,
    error,
    pagination,
  } = useLibrary();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    genre: '',
    isbn: '',
    condition: 'new',
    synopsis: '',
    available_for_exchange: true,
    available_for_borrow: true,
    year: '',
    cover_image_url: '',
  });
  const [activeTab, setActiveTab] = useState('library');
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);

  useEffect(() => {
    if (activeTab === 'library') getUserLibrary();
    else if (activeTab === 'bookmarks') getBookmarks();
    else if (activeTab === 'favorites') getFavorites();
    else if (activeTab === 'history') getBookHistory();
  }, [activeTab, getUserLibrary, getBookmarks, getFavorites, getBookHistory]);

  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (activeTab === 'library') setActiveTab('bookmarks');
      else if (activeTab === 'bookmarks') setActiveTab('favorites');
      else if (activeTab === 'favorites') setActiveTab('history');
    },
    onSwipedRight: () => {
      if (activeTab === 'history') setActiveTab('favorites');
      else if (activeTab === 'favorites') setActiveTab('bookmarks');
      else if (activeTab === 'bookmarks') setActiveTab('library');
    },
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  });

  const handleAddBook = async () => {
    try {
      await addBook(newBook);
      setIsAddModalOpen(false);
      setNewBook({
        title: '',
        author: '',
        genre: '',
        isbn: '',
        condition: 'new',
        synopsis: '',
        available_for_exchange: true,
        available_for_borrow: true,
        year: '',
        cover_image_url: '',
      });
    } catch {
      toast.error('Failed to add book');
    }
  };

  const handleUpdateAvailability = async (bookId, data) => {
    try {
      await updateAvailability(bookId, data);
    } catch {
      toast.error('Failed to update availability');
    }
  };

  const handleRemoveBook = async (bookId) => {
    if (window.confirm('Are you sure you want to remove this book?')) {
      try {
        await removeBook(bookId);
      } catch {
        toast.error('Failed to remove book');
      }
    }
  };

  const handleBookmark = async (bookId, isBookmarked) => {
    try {
      if (isBookmarked) await removeBookmark(bookId);
      else await bookmarkBook(bookId);
    } catch {
      toast.error('Failed to update bookmark');
    }
  };

  const handleFavorite = async (bookId, isFavorited) => {
    try {
      if (isFavorited) await unfavoriteBook(bookId);
      else await favoriteBook(bookId);
    } catch {
      toast.error('Failed to update favorite');
    }
  };

  return (
    <div className="min-h-screen bg-background font-open-sans text-text pt-16 pb-20" {...handlers}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-lora font-bold text-primary mb-6">My Library</h1>

        <TabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} isSmallScreen={isSmallScreen} />

        {activeTab === 'library' && (
          <div className="flex justify-end mb-6">
            <button
              className="flex items-center px-4 py-2 bg-accent text-white rounded-md hover:bg-yellow-600"
              onClick={() => setIsAddModalOpen(true)}
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Book
            </button>
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: ['library', 'bookmarks'].includes(activeTab) ? 100 : -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: ['library', 'bookmarks'].includes(activeTab) ? -100 : 100 }}
            transition={{ duration: 0.3 }}
          >
            {isLoading && <div className="text-center text-lg">Loading...</div>}
            {error && <div className="text-center text-error text-lg">{error}</div>}

            {activeTab === 'library' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userLibrary?.map((entry) => (
                  <BookCard
                    key={entry.library_id}
                    book={entry}
                    onUpdateAvailability={handleUpdateAvailability}
                    onRemove={handleRemoveBook}
                    onBookmark={handleBookmark}
                    onFavorite={handleFavorite}
                    isBookmarked={bookmarks?.some((b) => b.book_id === entry.book_id) || false}
                    isFavorited={favorites?.some((f) => f.book_id === entry.book_id) || false}
                  />
                ))}
              </div>
            )}

            {activeTab === 'bookmarks' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {bookmarks?.map((book) => (
                  <BookCard
                    key={book.book_id}
                    book={book}
                    onBookmark={handleBookmark}
                    onFavorite={handleFavorite}
                    isBookmarked={true}
                    isFavorited={favorites?.some((f) => f.book_id === book.book_id) || false}
                  />
                ))}
              </div>
            )}

            {activeTab === 'favorites' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favorites?.map((book) => (
                  <BookCard
                    key={book.book_id}
                    book={book}
                    onBookmark={handleBookmark}
                    onFavorite={handleFavorite}
                    isBookmarked={bookmarks?.some((b) => b.book_id === book.book_id) || false}
                    isFavorited={true}
                  />
                ))}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-lora font-bold text-primary mb-4">Book History</h2>
                <div className="space-y-4">
                  {history?.map((item) => {
                    // Guard against undefined book data
                    if (!item?.book) {
                      return (
                        <div key={item?.history_id || Math.random()} className="border-b pb-2">
                          <p className="text-sm text-gray-500">Book information unavailable</p>
                          <p className="text-sm text-gray-600">
                            {item?.status || 'Unknown status'} on {item?.start_date ? new Date(item.start_date).toLocaleDateString() : 'Unknown date'}
                          </p>
                          {item?.notes && <p className="text-sm italic">{item.notes}</p>}
                        </div>
                      );
                    }

                    return (
                      <div key={item.history_id} className="border-b pb-2">
                        <p className="font-semibold">
                          {item.book.title || 'Unknown Title'} by {item.book.author || 'Unknown Author'}
                        </p>
                        <p className="text-sm text-gray-600">
                          {item.status || 'Unknown status'} on {item.start_date ? new Date(item.start_date).toLocaleDateString() : 'Unknown date'}
                        </p>
                        {item.notes && <p className="text-sm italic">{item.notes}</p>}
                      </div>
                    );
                  })}
                  {(!history || history.length === 0) && (
                    <p className="text-center text-gray-500">No history found</p>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <Pagination
          pagination={pagination?.[activeTab]}
          onPageChange={(page) => {
            if (activeTab === 'library') getUserLibrary(page);
            else if (activeTab === 'bookmarks') getBookmarks(page);
            else if (activeTab === 'favorites') getFavorites(page);
            else if (activeTab === 'history') getBookHistory(page);
          }}
        />

        <AddBookModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          newBook={newBook}
          setNewBook={setNewBook}
          onAddBook={handleAddBook}
        />
      </div>
    </div>
  );
};

export default MyBooksPage;