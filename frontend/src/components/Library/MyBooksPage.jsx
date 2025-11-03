import { useState, useEffect } from 'react';
import { useLibrary } from '../../hooks/useLibrary';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, BookOpenIcon, BookmarkIcon, HeartIcon, ClockIcon } from '@heroicons/react/24/outline';
import { BookOpenIcon as BookOpenSolidIcon, BookmarkIcon as BookmarkSolidIcon, HeartIcon as HeartSolidIcon, ClockIcon as ClockSolidIcon } from '@heroicons/react/24/solid';
import Pagination from '../Common/Pagination';
import BookCard from '../Library/common/BookCard';
import AddBookModal from '../Library/MyBooks/AddBookModal';
import DuplicateBookModal from '../Common/DuplicateBookModal';

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

  useEffect(() => {
    if (activeTab === 'library') getUserLibrary();
    else if (activeTab === 'bookmarks') getBookmarks();
    else if (activeTab === 'favorites') getFavorites();
    else if (activeTab === 'history') getBookHistory();
  }, [activeTab, getUserLibrary, getBookmarks, getFavorites, getBookHistory]);

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
      }
    } catch (error) {
      if (error.type === 'DUPLICATE_BOOK') {
        setDuplicateBookInfo(error.existingBook);
        setIsDuplicateModalOpen(true);
      } else {
        console.error('Book addition failed:', error);
      }
    }
  };

  const handleViewExistingBook = () => {
    setIsDuplicateModalOpen(false);
  };

  const handleAddAnyway = async () => {
    try {
      const bookWithoutISBN = { ...newBook, isbn: '' };
      const result = await addBook(bookWithoutISBN);
      if (result) {
        setIsAddModalOpen(false);
        setIsDuplicateModalOpen(false);
        resetBookForm();
        setDuplicateBookInfo(null);
      }
    } catch (error) {
      console.error('Failed to add book anyway:', error);
    }
  };

  const handleUpdateAvailability = async (bookId, data) => {
    try {
      await updateAvailability(bookId, data);
    } catch {
      // Error handled by hook
    }
  };

  const handleRemoveBook = async (bookId) => {
    try {
      await removeBook(bookId);
    } catch {
      // Error handled by hook
    }
  };

  const handleBookmark = async (bookId, isBookmarked) => {
    try {
      if (isBookmarked) {
        await removeBookmark(bookId);
      } else {
        await bookmarkBook(bookId);
      }
    } catch (error) {
      console.error('Bookmark operation failed:', error);
    }
  };

  const handleFavorite = async (bookId, isFavorited) => {
    try {
      if (isFavorited) {
        await unfavoriteBook(bookId);
      } else {
        await favoriteBook(bookId);
      }
    } catch (error) {
      console.error('Favorite operation failed:', error);
    }
  };

  const tabs = [
    {
      id: 'library',
      label: 'My Books',
      icon: BookOpenIcon,
      iconSolid: BookOpenSolidIcon,
    },
    {
      id: 'bookmarks',
      label: 'Bookmarks',
      icon: BookmarkIcon,
      iconSolid: BookmarkSolidIcon,
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: HeartIcon,
      iconSolid: HeartSolidIcon,
    },
    {
      id: 'history',
      label: 'History',
      icon: ClockIcon,
      iconSolid: ClockSolidIcon,
    },
  ];

  const getCurrentBooks = () => {
    switch (activeTab) {
      case 'library':
        return userLibrary;
      case 'bookmarks':
        return bookmarks;
      case 'favorites':
        return favorites;
      case 'history':
        return history;
      default:
        return [];
    }
  };

  const currentBooks = getCurrentBooks();

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Page Header */}
      <motion.div
        className="mb-8 flex items-center justify-between"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--primary-600)' }}>
            My Library
          </h1>
          <p className="text-sm md:text-base" style={{ color: 'var(--neutral-600)' }}>
            Manage your personal book collection
          </p>
        </div>
        <motion.button
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-primary flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <PlusIcon className="w-5 h-5" />
          <span className="hidden sm:inline">Add Book</span>
        </motion.button>
      </motion.div>

      {/* Tab Navigation */}
      <motion.nav
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="flex gap-2 p-1 rounded-xl overflow-x-auto" style={{ backgroundColor: 'var(--neutral-100)' }}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = isActive ? tab.iconSolid : tab.icon;

            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-all whitespace-nowrap`}
                style={{
                  backgroundColor: isActive ? 'white' : 'transparent',
                  color: isActive ? 'var(--primary-600)' : 'var(--neutral-600)',
                  boxShadow: isActive ? 'var(--shadow-sm)' : 'none'
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.nav>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="spinner-lg"></div>
            </div>
          ) : currentBooks?.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold" style={{ color: 'var(--neutral-900)' }}>
                  {tabs.find(t => t.id === activeTab)?.label}
                </h2>
                <span className="text-sm px-3 py-1 rounded-full"
                      style={{ backgroundColor: 'var(--primary-100)', color: 'var(--primary-700)' }}>
                  {currentBooks.length} {currentBooks.length === 1 ? 'book' : 'books'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {currentBooks.map((book, index) => (
                  <motion.div
                    key={book.book_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                  >
                    <BookCard
                      book={book}
                      onUpdateAvailability={activeTab === 'library' ? handleUpdateAvailability : null}
                      onRemove={activeTab === 'library' ? handleRemoveBook : null}
                      onBookmark={handleBookmark}
                      onFavorite={handleFavorite}
                      isBookmarked={activeTab === 'bookmarks'}
                      isFavorited={activeTab === 'favorites'}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="mt-8">
                  <Pagination
                    pagination={pagination}
                    onPageChange={(page) => {
                      if (activeTab === 'library') getUserLibrary({ page });
                      else if (activeTab === 'bookmarks') getBookmarks({ page });
                      else if (activeTab === 'favorites') getFavorites({ page });
                      else if (activeTab === 'history') getBookHistory({ page });
                    }}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="card p-12 text-center">
              {activeTab === 'library' && (
                <>
                  <BookOpenIcon className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--neutral-400)' }} />
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--neutral-700)' }}>
                    No Books Yet
                  </h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--neutral-500)' }}>
                    Start building your library by adding your first book
                  </p>
                  <button onClick={() => setIsAddModalOpen(true)} className="btn btn-primary">
                    <PlusIcon className="w-5 h-5 mr-2" />
                    Add Your First Book
                  </button>
                </>
              )}
              {activeTab === 'bookmarks' && (
                <>
                  <BookmarkIcon className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--neutral-400)' }} />
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--neutral-700)' }}>
                    No Bookmarks
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--neutral-500)' }}>
                    Bookmark books you're interested in to find them easily later
                  </p>
                </>
              )}
              {activeTab === 'favorites' && (
                <>
                  <HeartIcon className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--neutral-400)' }} />
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--neutral-700)' }}>
                    No Favorites
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--neutral-500)' }}>
                    Mark books as favorites to keep track of your most loved reads
                  </p>
                </>
              )}
              {activeTab === 'history' && (
                <>
                  <ClockIcon className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--neutral-400)' }} />
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--neutral-700)' }}>
                    No History
                  </h3>
                  <p className="text-sm" style={{ color: 'var(--neutral-500)' }}>
                    Your book activity history will appear here
                  </p>
                </>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Add Book Modal */}
      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          resetBookForm();
        }}
        newBook={newBook}
        setNewBook={setNewBook}
        onAddBook={handleAddBook}
      />

      {/* Duplicate Book Modal */}
      <DuplicateBookModal
        isOpen={isDuplicateModalOpen}
        onClose={() => setIsDuplicateModalOpen(false)}
        duplicateBook={duplicateBookInfo}
        onViewExisting={handleViewExistingBook}
        onAddAnyway={handleAddAnyway}
      />
    </div>
  );
};

export default MyBooksPage;
