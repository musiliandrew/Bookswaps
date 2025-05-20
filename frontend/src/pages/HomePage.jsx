import { useState, useEffect, useRef} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import BookCard from '../components/home/BookCard';
import UserCard from '../components/users/UserCard';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import debounce from 'lodash/debounce';
import { useMemo } from 'react';
import readingNook from '../assets/reading-nook.jpg';

// Mock data for discussions only
const mockTopPosts = [
  {
    discussion_id: "123e4567-e89b-12d3-a456-426614174000",
    title: "Why 'Dune' is a Sci-Fi Masterpiece",
    content: "Let's discuss the themes and world-building in Frank Herbert's classic!",
    user: { username: "booklover1", user_id: "uuid1" },
    created_at: "2025-05-18T10:00:00Z",
    upvote_count: 25,
  },
  {
    discussion_id: "223e4567-e89b-12d3-a456-426614174001",
    title: "Favorite Fantasy Novels of 2025",
    content: "Share your top picks for fantasy this year!",
    user: { username: "reader2", user_id: "uuid2" },
    created_at: "2025-05-17T15:30:00Z",
    upvote_count: 18,
  },
];

function HomePage() {
  const navigate = useNavigate();
  const { getBooks, getRecommendedUsers, books: apiBooks, recommendedUsers: apiUsers, isAuthenticated, error, isLoading } = useAuth();
  const [filters, setFilters] = useState({ search: '', genres: [] });
  const [genreInput, setGenreInput] = useState('');
  const bookCarouselRef = useRef(null);
  const userCarouselRef = useRef(null);
  const postCarouselRef = useRef(null);

  // Use API data directly
  const books = apiBooks || [];
  const recommendedUsers = apiUsers || [];

  // Debounced book fetching
  const debouncedGetBooks = useMemo(() => {
    return debounce((filters) => {
      if (isAuthenticated) {
        getBooks(filters);
      }
    }, 500);
  }, [isAuthenticated, getBooks]);

  // Fetch books
  useEffect(() => {
    debouncedGetBooks(filters);
    return () => debouncedGetBooks.cancel();
  }, [filters, debouncedGetBooks]);


  // Fetch recommended users once
  useEffect(() => {
    let isMounted = true;
    if (isAuthenticated) {
      getRecommendedUsers().then(() => {
        if (isMounted) {
          console.log('Recommended users fetched');
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, getRecommendedUsers]);

  const handleSearch = debounce((value) => {
    setFilters((prev) => ({ ...prev, search: value }));
  }, 300);

  const handleGenreAdd = (e) => {
    if (e.key === 'Enter' && genreInput.trim()) {
      e.preventDefault();
      setFilters((prev) => ({
        ...prev,
        genres: [...prev.genres, genreInput.trim()],
      }));
      setGenreInput('');
    }
  };

  const handleGenreRemove = (genre) => {
    setFilters((prev) => ({
      ...prev,
      genres: prev.genres.filter((g) => g !== genre),
    }));
  };

  const scrollCarousel = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="h-[100vh] bg-cover bg-center flex items-center justify-center text-center relative"
        style={{ backgroundImage: `url(${readingNook})` }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="relative z-10 p-8 rounded-lg"
        >
          <motion.h1
            className="text-5xl md:text-6xl font-extrabold text-[var(--secondary)] font-serif"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            Swap, Read, Connect
          </motion.h1>
          <motion.p
            className="mt-4 text-xl text-[var(--secondary)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Join a community of book lovers to swap books and share stories.
          </motion.p>
          <motion.div
            className="mt-8 space-x-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <motion.button
              onClick={() => navigate(isAuthenticated ? '/users/search' : '/signup')}
              className="bg-[var(--primary)] text-[var(--secondary)] font-medium py-3 px-8 rounded-full hover:bg-opacity-90 shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isAuthenticated ? 'Explore Now' : 'Join BookSwap'}
            </motion.button>
            <motion.button
              onClick={() => navigate('/library/books')}
              className="border border-[var(--secondary)] text-[var(--secondary)] py-3 px-8 rounded-full hover:bg-[var(--secondary)] hover:text-[var(--primary)] shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Browse Books
            </motion.button>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* How It Works Section */}
      <motion.section
        className="py-16 bg-gradient-to-b from-[var(--secondary)] to-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)] text-center font-serif">
          How BookSwap Works
        </h2>
        <div className="max-w-6xl mx-auto mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: '📚', title: 'List Your Books', desc: 'Add books you’re willing to swap or lend.' },
            { icon: '🔄', title: 'Find & Swap', desc: 'Browse books and arrange swaps with others.' },
            { icon: '💬', title: 'Join Discussions', desc: 'Connect with book lovers in societies and chats.' },
          ].map((step, index) => (
            <motion.div
              key={step.title}
              className="bg-white p-6 rounded-xl shadow-lg text-center"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
            >
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="text-xl font-semibold text-[var(--primary)]">{step.title}</h3>
              <p className="mt-2 text-gray-600">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Trending Books Carousel */}
      <motion.section
        className="py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)] text-center font-serif">
          Trending Books
        </h2>
        {isLoading ? (
          <motion.p
            className="text-center text-[var(--primary)] mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Loading books...
          </motion.p>
        ) : books.length > 0 ? (
          <div className="relative max-w-6xl mx-auto">
            <button
              onClick={() => scrollCarousel(bookCarouselRef, 'left')}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-[var(--primary)] text-[var(--secondary)] p-2 rounded-full z-10 shadow-md"
              aria-label="Scroll left"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <div
              ref={bookCarouselRef}
              className="flex overflow-x-auto space-x-4 p-4 scrollbar-hide"
            >
              {books.map((book, index) => (
                <motion.div
                  key={book.book_id}
                  className="min-w-[200px]"
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <BookCard book={book} />
                </motion.div>
              ))}
            </div>
            <button
              onClick={() => scrollCarousel(bookCarouselRef, 'right')}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-[var(--primary)] text-[var(--secondary)] p-2 rounded-full z-10 shadow-md"
              aria-label="Scroll right"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          </div>
        ) : (
          <motion.p
            className="text-center text-gray-600 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            No trending books found. Add some books to get started!
          </motion.p>
        )}
      </motion.section>

      {/* Recommended Users Carousel */}
      <motion.section
        className="py-16 bg-gradient-to-b from-white to-[var(--secondary)]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)] text-center font-serif">
          Meet Book Lovers
        </h2>
        {isLoading ? (
          <motion.p
            className="text-center text-[var(--primary)] mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Loading users...
          </motion.p>
        ) : recommendedUsers.length > 0 ? (
          <div className="relative max-w-6xl mx-auto">
            <button
              onClick={() => scrollCarousel(userCarouselRef, 'left')}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-[var(--primary)] text-[var(--secondary)] p-2 rounded-full z-10 shadow-md"
              aria-label="Scroll left"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <div
              ref={userCarouselRef}
              className="flex overflow-x-auto space-x-4 p-4 scrollbar-hide"
            >
              {recommendedUsers.map((user, index) => (
                <motion.div
                  key={user.user_id}
                  className="min-w-[200px]"
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <UserCard user={user} />
                </motion.div>
              ))}
            </div>
            <button
              onClick={() => scrollCarousel(userCarouselRef, 'right')}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-[var(--primary)] text-[var(--secondary)] p-2 rounded-full z-10 shadow-md"
              aria-label="Scroll right"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          </div>
        ) : (
          <motion.p
            className="text-center text-gray-600 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            No book lovers found. Invite friends to join!
          </motion.p>
        )}
      </motion.section>

      {/* Top Discussions Carousel */}
      <motion.section
        className="py-16"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)] text-center font-serif">
          Hot Discussions
        </h2>
        <div className="relative max-w-6xl mx-auto">
          <button
            onClick={() => scrollCarousel(postCarouselRef, 'left')}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-[var(--primary)] text-[var(--secondary)] p-2 rounded-full z-10 shadow-md"
            aria-label="Scroll left"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <div
            ref={postCarouselRef}
            className="flex overflow-x-auto space-x-4 p-4 scrollbar-hide"
          >
            {mockTopPosts.map((post, index) => (
              <motion.div
                key={post.discussion_id}
                className="min-w-[300px] bg-white p-4 rounded-xl shadow-lg"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
              >
                <h3 className="text-lg font-semibold text-[var(--primary)]">{post.title}</h3>
                <p className="text-gray-600 truncate">{post.content}</p>
                <p className="text-sm text-gray-500 mt-2">
                  By {post.user.username} • {new Date(post.created_at).toLocaleDateString()}
                </p>
                <motion.button
                  onClick={() => navigate(`/discussions/${post.discussion_id}`)}
                  className="mt-4 text-[var(--primary)] hover:underline"
                  whileHover={{ scale: 1.05 }}
                >
                  Join Discussion
                </motion.button>
              </motion.div>
            ))}
          </div>
          <button
            onClick={() => scrollCarousel(postCarouselRef, 'right')}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-[var(--primary)] text-[var(--secondary)] p-2 rounded-full z-10 shadow-md"
            aria-label="Scroll right"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        </div>
      </motion.section>

      {/* Search Section */}
      <motion.section
        className="max-w-6xl mx-auto py-8 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)] text-center font-serif">
          Find Books & Readers
        </h2>
        <motion.div
          className="mt-6 flex flex-col sm:flex-row gap-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <input
            type="text"
            placeholder="Search by title, author, or username..."
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full sm:w-1/2 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--primary)] shadow-sm"
            aria-label="Search books or users"
          />
          <div className="w-full sm:w-1/2">
            <input
              type="text"
              value={genreInput}
              onChange={(e) => setGenreInput(e.target.value)}
              onKeyDown={handleGenreAdd}
              placeholder="Type a genre and press Enter (e.g., Sci-Fi)"
              className="w-full px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--primary)] shadow-sm"
              aria-label="Add genre filter"
            />
            <AnimatePresence>
              <div className="mt-2 flex flex-wrap gap-2">
                {filters.genres.map((genre) => (
                  <motion.span
                    key={genre}
                    className="bg-[var(--primary)] text-[var(--secondary)] px-3 py-1 rounded-full text-sm flex items-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {genre}
                    <button
                      type="button"
                      onClick={() => handleGenreRemove(genre)}
                      className="ml-2 text-[var(--secondary)]"
                      aria-label={`Remove ${genre} filter`}
                    >
                      ×
                    </button>
                  </motion.span>
                ))}
              </div>
            </AnimatePresence>
          </div>
        </motion.div>
        {error && (
          <motion.p
            className="text-red-500 text-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {error} Try browsing books manually.
          </motion.p>
        )}
        {isLoading ? (
          <motion.p
            className="text-center text-[var(--primary)] mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Loading...
          </motion.p>
        ) : (
          <motion.div
            className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {books.length ? (
              books.map((book, index) => (
                <motion.div
                  key={book.book_id}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <BookCard book={book} />
                </motion.div>
              ))
            ) : (
              <motion.p
                className="text-center text-gray-600 col-span-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                No books found. Try browsing books manually.
              </motion.p>
            )}
          </motion.div>
        )}
      </motion.section>
    </div>
  );
}

export default HomePage;
