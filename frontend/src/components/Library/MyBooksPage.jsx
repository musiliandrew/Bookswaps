import React, { useState, useEffect } from 'react';
import { useLibrary } from '../../hooks/useLibrary';
import { toast } from 'react-toastify';
import Pagination from '../Common/Pagination';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import BookCard from '../Library/common/BookCard';
import TabsNavigation from '../Library/common/TabsNavigation';
import AddBookModal from '../Library/MyBooks/AddBookModal';
import DuplicateBookModal from '../Common/DuplicateBookModal';
import { PlusIcon, BookOpenIcon, BookmarkIcon, HeartIcon, ClockIcon } from '@heroicons/react/24/outline';

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
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [duplicateBookInfo, setDuplicateBookInfo] = useState(null);
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
    cover_image: null,
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

  const resetBookForm = () => {
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
      cover_image: null,
    });
  };

  const handleAddBook = async () => {
    try {
      const result = await addBook(newBook);
      if (result) {
        setIsAddModalOpen(false);
        resetBookForm();
        toast.success('📚 Book added successfully to your library!');
      }
    } catch (error) {
      // Handle duplicate book error
      if (error.type === 'DUPLICATE_BOOK') {
        setDuplicateBookInfo(error.existingBook);
        setIsDuplicateModalOpen(true);
      } else {
        console.error('Book addition failed:', error);
      }
    }
  };

  const handleViewExistingBook = (bookId) => {
    setIsDuplicateModalOpen(false);
    // Navigate to book details or implement view logic
    toast.info('Feature coming soon: View existing book details');
  };

  const handleAddAnyway = async () => {
    try {
      // Remove ISBN to avoid duplicate constraint
      const bookWithoutISBN = { ...newBook, isbn: '' };
      const result = await addBook(bookWithoutISBN);
      if (result) {
        setIsAddModalOpen(false);
        setIsDuplicateModalOpen(false);
        resetBookForm();
        setDuplicateBookInfo(null);
        toast.success('📚 Your copy has been added to your library!');
      }
    } catch (error) {
      console.error('Failed to add book anyway:', error);
    }
  };

  const handleUpdateAvailability = async (bookId, data) => {
    try {
      await updateAvailability(bookId, data);
      toast.success('Availability updated');
    } catch {
      toast.error('Failed to update availability');
    }
  };

  const handleRemoveBook = async (bookId) => {
    if (window.confirm('Are you sure you want to remove this book?')) {
      try {
        await removeBook(bookId);
        toast.success('Book removed');
      } catch {
        toast.error('Failed to remove book');
      }
    }
  };

  const handleBookmark = async (bookId, isBookmarked) => {
    try {
      if (isBookmarked) await removeBookmark(bookId);
      else await bookmarkBook(bookId);
      toast.success(isBookmarked ? 'Bookmark removed' : 'Book bookmarked');
    } catch {
      toast.error('Failed to update bookmark');
    }
  };

  const handleFavorite = async (bookId, isFavorited) => {
    try {
      if (isFavorited) await unfavoriteBook(bookId);
      else await favoriteBook(bookId);
      toast.success(isFavorited ? 'Removed from favorites' : 'Added to favorites');
    } catch {
      toast.error('Failed to update favorite');
    }
  };

  const tabs = [
    { id: 'library', label: 'My Books', icon: <BookOpenIcon className="w-4 h-4" /> },
    { id: 'bookmarks', label: 'Bookmarked', icon: <BookmarkIcon className="w-4 h-4" /> },
    { id: 'favorites', label: 'Favorites', icon: <HeartIcon className="w-4 h-4" /> },
    { id: 'history', label: 'History', icon: <ClockIcon className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen font-open-sans text-text" {...handlers}>
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-lora font-bold text-gradient mb-4 relative">
            📚 My Library
            <motion.div
              className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full opacity-20"
              animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </h1>
          <motion.p
            className="font-open-sans text-primary/80 text-lg max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Curate your personal collection, discover new favorites, and track your reading journey
          </motion.p>
        </motion.div>

        {/* Enhanced Navigation and Add Button */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <TabsNavigation activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} isSmallScreen={isSmallScreen} />

          <motion.button
            className="bookish-button-enhanced flex items-center px-6 py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => setIsAddModalOpen(true)}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: [0, 90, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <PlusIcon className="w-5 h-5 mr-2" />
            </motion.div>
            Add New Book
          </motion.button>
        </motion.div>

        {/* Enhanced Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: ['library', 'bookmarks'].includes(activeTab) ? 100 : -100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: ['library', 'bookmarks'].includes(activeTab) ? -100 : 100, scale: 0.95 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Enhanced Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center py-20">
                <motion.div
                  className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full mb-4"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
                <p className="text-lg font-medium text-primary">Loading your library...</p>
              </div>
            )}

            {/* Enhanced Error State */}
            {error && (
              <motion.div
                className="text-center py-20"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-6xl mb-4">😔</div>
                <p className="text-xl font-semibold text-red-600 mb-2">Oops! Something went wrong</p>
                <p className="text-primary/70">{error}</p>
              </motion.div>
            )}

            {/* Library Tab - Enhanced Grid */}
            {activeTab === 'library' && !isLoading && !error && (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                {userLibrary?.map((entry, index) => (
                  <motion.div
                    key={entry.library_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                  >
                    <BookCard
                      book={entry}
                      onUpdateAvailability={handleUpdateAvailability}
                      onRemove={handleRemoveBook}
                      onBookmark={handleBookmark}
                      onFavorite={handleFavorite}
                      isBookmarked={bookmarks?.some((b) => b.book_id === entry.book_id) || false}
                      isFavorited={favorites?.some((f) => f.book_id === entry.book_id) || false}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Enhanced Empty State for Library */}
            {activeTab === 'library' && !isLoading && !error && (!userLibrary || userLibrary.length === 0) && (
              <motion.div
                className="text-center py-20"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-8xl mb-6">📚</div>
                <h3 className="text-2xl font-lora font-bold text-primary mb-4">Your Library is Empty</h3>
                <p className="text-primary/70 mb-8 max-w-md mx-auto">
                  Start building your personal collection by adding your first book!
                </p>
                <motion.button
                  className="bookish-button-enhanced px-8 py-3 rounded-xl text-white font-semibold"
                  onClick={() => setIsAddModalOpen(true)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <PlusIcon className="w-5 h-5 mr-2 inline" />
                  Add Your First Book
                </motion.button>
              </motion.div>
            )}

            {/* Bookmarks Tab - Enhanced Grid */}
            {activeTab === 'bookmarks' && !isLoading && !error && (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                {bookmarks?.map((book, index) => (
                  <motion.div
                    key={book.book_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                  >
                    <BookCard
                      book={book}
                      onBookmark={handleBookmark}
                      onFavorite={handleFavorite}
                      isBookmarked={true}
                      isFavorited={favorites?.some((f) => f.book_id === book.book_id) || false}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Enhanced Empty State for Bookmarks */}
            {activeTab === 'bookmarks' && !isLoading && !error && (!bookmarks || bookmarks.length === 0) && (
              <motion.div
                className="text-center py-20"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-8xl mb-6">🔖</div>
                <h3 className="text-2xl font-lora font-bold text-primary mb-4">No Bookmarks Yet</h3>
                <p className="text-primary/70 max-w-md mx-auto">
                  Bookmark interesting books you'd like to read or remember for later!
                </p>
              </motion.div>
            )}

            {/* Favorites Tab - Enhanced Grid */}
            {activeTab === 'favorites' && !isLoading && !error && (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                {favorites?.map((book, index) => (
                  <motion.div
                    key={book.book_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                  >
                    <BookCard
                      book={book}
                      onBookmark={handleBookmark}
                      onFavorite={handleFavorite}
                      isBookmarked={bookmarks?.some((b) => b.book_id === book.book_id) || false}
                      isFavorited={true}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Enhanced Empty State for Favorites */}
            {activeTab === 'favorites' && !isLoading && !error && (!favorites || favorites.length === 0) && (
              <motion.div
                className="text-center py-20"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <div className="text-8xl mb-6">❤️</div>
                <h3 className="text-2xl font-lora font-bold text-primary mb-4">No Favorites Yet</h3>
                <p className="text-primary/70 max-w-md mx-auto">
                  Mark books as favorites to keep track of your most beloved reads!
                </p>
              </motion.div>
            )}

            {/* Enhanced History Tab */}
            {activeTab === 'history' && !isLoading && !error && (
              <motion.div
                className="bookish-glass rounded-2xl p-8 border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <motion.h2
                  className="text-3xl font-lora font-bold text-primary mb-8 flex items-center"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <ClockIcon className="w-8 h-8 mr-3" />
                  Reading History
                </motion.h2>

                <div className="space-y-6">
                  {history?.map((item, index) => {
                    if (!item?.book) {
                      return (
                        <motion.div
                          key={item?.history_id || Math.random()}
                          className="p-4 bg-white/10 rounded-xl border border-white/20"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.4 }}
                        >
                          <p className="text-sm text-primary/60 mb-2">📚 Book information unavailable</p>
                          <p className="text-sm text-primary/80">
                            {item?.status || 'Unknown status'} on {item?.start_date ? new Date(item.start_date).toLocaleDateString() : 'Unknown date'}
                          </p>
                          {item?.notes && <p className="text-sm italic text-primary/70 mt-2">{item.notes}</p>}
                        </motion.div>
                      );
                    }

                    const getStatusIcon = (status) => {
                      switch (status?.toLowerCase()) {
                        case 'added': return '➕';
                        case 'swapped': return '🔄';
                        case 'borrowed': return '📖';
                        case 'returned': return '↩️';
                        case 'removed': return '➖';
                        default: return '📚';
                      }
                    };

                    return (
                      <motion.div
                        key={item.history_id}
                        className="p-6 bg-gradient-to-r from-white/10 to-white/5 rounded-xl border border-white/20 hover:border-white/30 transition-all duration-300"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="text-2xl">{getStatusIcon(item.status)}</div>
                          <div className="flex-1">
                            <h3 className="font-lora font-bold text-lg text-primary mb-1">
                              {item.book.title || 'Unknown Title'}
                            </h3>
                            <p className="text-primary/70 mb-2">by {item.book.author || 'Unknown Author'}</p>
                            <div className="flex items-center space-x-4 text-sm text-primary/60">
                              <span className="bg-accent/20 text-accent px-2 py-1 rounded-full font-medium">
                                {item.status || 'Unknown status'}
                              </span>
                              <span>
                                {item.start_date ? new Date(item.start_date).toLocaleDateString() : 'Unknown date'}
                              </span>
                            </div>
                            {item.notes && (
                              <p className="text-sm italic text-primary/70 mt-3 p-3 bg-white/10 rounded-lg">
                                "{item.notes}"
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Enhanced Empty State for History */}
                {(!history || history.length === 0) && (
                  <motion.div
                    className="text-center py-16"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="text-8xl mb-6">📖</div>
                    <h3 className="text-2xl font-lora font-bold text-primary mb-4">No History Yet</h3>
                    <p className="text-primary/70 max-w-md mx-auto">
                      Your reading journey will appear here as you add, swap, and interact with books!
                    </p>
                  </motion.div>
                )}
              </motion.div>
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

        <DuplicateBookModal
          isOpen={isDuplicateModalOpen}
          onClose={() => {
            setIsDuplicateModalOpen(false);
            setDuplicateBookInfo(null);
          }}
          duplicateInfo={duplicateBookInfo}
          onViewExisting={handleViewExistingBook}
          onAddAnyway={handleAddAnyway}
        />
      </div>
    </div>
  );
};

export default MyBooksPage;