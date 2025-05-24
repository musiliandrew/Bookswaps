import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import BookCard from '../components/home/BookCard';
import UserCard from '../components/users/UserCard';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import debounce from 'lodash/debounce';
import { useMemo } from 'react';

function HomePage() {
  const navigate = useNavigate();
  const { getBooks, getRecommendedUsers, books: apiBooks, recommendedUsers: apiUsers, isAuthenticated, error, isLoading } = useAuth();
  const [filters, setFilters] = useState({ search: '', genres: [] });
  const [genreInput, setGenreInput] = useState('');
  const bookCarouselRef = useRef(null);
  const userCarouselRef = useRef(null);
  const postCarouselRef = useRef(null);

  // Dynamic hero images
  const heroImages = [
    {
      src: '/src/assets/hero-bg.jpg',
      alt: 'Modern library with reference desk and bookshelves',
      objectPosition: '50% 50%',
      text: {
        heading: 'Explore a World of Books',
        subheading: 'Swap and discover new stories with our community.',
        ctaText: 'Browse Books',
        ctaLink: '/books',
      },
    },
    {
      src: '/src/assets/reading-nook.jpg',
      alt: 'Cozy reading nook with person reading',
      objectPosition: '40% 50%',
      text: {
        heading: 'Your Reading Journey Starts Here',
        subheading: 'Join BookSwap to share and find your next read.',
        ctaText: 'Sign Up',
        ctaLink: '/signup',
      },
    },
    {
      src: '/src/assets/warm-library.jpg',
      alt: 'Warm library reading room with clock',
      objectPosition: '50% 40%',
      text: {
        heading: 'Connect Through Books',
        subheading: 'Discuss, swap, and build a bookish community.',
        ctaText: 'Join Discussions',
        ctaLink: '/discussions',
      },
    },
  ];

  // Hero state
  const [currentImage, setCurrentImage] = useState(Math.floor(Math.random() * heroImages.length));

  // Rotate images every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Handle dot click
  const handleDotClick = (index) => {
    setCurrentImage(index);
  };

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
      <section className="relative bg-cover bg-center h-[70vh] sm:h-[60vh] flex items-center justify-center text-center">
        <AnimatePresence>
          <motion.img
            key={heroImages[currentImage].src}
            src={heroImages[currentImage].src}
            alt={heroImages[currentImage].alt}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: heroImages[currentImage].objectPosition }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-text bg-opacity-40 backdrop-blur-sm" />
        <div className="relative z-10 container mx-auto px-4">
          <motion.h1
            key={`heading-${currentImage}`}
            className="text-3xl sm:text-4xl md:text-5xl font-['Lora'] text-[var(--secondary)] text-shadow mb-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {heroImages[currentImage].text.heading}
          </motion.h1>
          <motion.p
            key={`subheading-${currentImage}`}
            className="text-lg sm:text-xl text-[var(--secondary)] mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {heroImages[currentImage].text.subheading}
          </motion.p>
          <motion.a
            key={`cta-${currentImage}`}
            href={heroImages[currentImage].text.ctaLink}
            className="bookish-button bookish-button--primary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            {heroImages[currentImage].text.ctaText}
          </motion.a>
        </div>
        {/* Dot Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`w-2 h-2 rounded-full ${
                index === currentImage ? 'bg-[var(--primary)]' : 'bg-[var(--secondary)] opacity-50'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <motion.section
        className="py-16 bg-gradient-to-b from-[var(--secondary)] to-white"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)] text-center font-['Lora']">
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
              className="bookish-card text-center"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
            >
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="text-xl font-semibold text-[var(--primary)] font-['Lora']">{step.title}</h3>
              <p className="mt-2 text-[var(--text)]">{step.desc}</p>
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
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)] text-center font-['Lora']">
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
            className="text-center text-[var(--text)] mt-8"
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
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)] text-center font-['Lora']">
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
            className="text-center text-[var(--text)] mt-8"
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
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)] text-center font-['Lora']">
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
                className="min-w-[300px] bookish-card"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
              >
                <h3 className="text-lg font-semibold text-[var(--primary)] font-['Lora']">{post.title}</h3>
                <p className="text-[var(--text)] truncate">{post.content}</p>
                <p className="text-sm text-[var(--text)] mt-2 font-['Caveat']">
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
        <h2 className="text-3xl md:text-4xl font-bold text-[var(--primary)] text-center font-['Lora']">
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
            className="w-full sm:w-1/2 px-4 py-3 border border-[var(--text)] rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bookish-border"
            aria-label="Search books or users"
          />
          <div className="w-full sm:w-1/2">
            <input
              type="text"
              value={genreInput}
              onChange={(e) => setGenreInput(e.target.value)}
              onKeyDown={handleGenreAdd}
              placeholder="Type a genre and press Enter (e.g., Sci-Fi)"
              className="w-full px-4 py-3 border border-[var(--text)] rounded-full focus:outline-none focus:ring-2 focus:ring-[var(--primary)] bookish-border"
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
            className="text-[var(--error)] text-center mt-4"
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
                className="text-center text-[var(--text)] col-span-full"
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

// Mock data for discussions (to be replaced with API)
const mockTopPosts = [
  {
    discussion_id: 1,
    title: 'Best Sci-Fi Reads of 2023',
    content: 'What are your favorite sci-fi books this year? I loved Project Hail Mary!',
    user: { username: 'SciFiFan' },
    created_at: '2023-10-01',
  },
  {
    discussion_id: 2,
    title: 'Classic Literature Recommendations',
    content: 'Looking for timeless classics to read. Any suggestions?',
    user: { username: 'BookWorm' },
    created_at: '2023-10-02',
  },
  {
    discussion_id: 3,
    title: 'Fantasy Worlds to Get Lost In',
    content: 'Let’s discuss epic fantasy series like LOTR or Stormlight Archive.',
    user: { username: 'FantasyReader' },
    created_at: '2023-10-03',
  },
];

export default HomePage;