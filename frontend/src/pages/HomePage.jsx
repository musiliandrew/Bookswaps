import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import debounce from 'lodash/debounce';
import { useAuth } from '../hooks/useAuth';
import BookCard from '../components/home/BookCard';
import UserCard from '../components/users/UserCard';
import AuthLink from '../components/auth/AuthLink';
import HeroBg from '../assets/hero-bg.jpg';
import ReadingNook from '../assets/reading-nook.jpg';
import WarmLibrary from '../assets/warm-library.jpg';

function HomePage() {
  const { getBooks, getRecommendedUsers, books: apiBooks, recommendedUsers: apiUsers, isAuthenticated, error, isLoading } = useAuth();
  const [filters, setFilters] = useState({ search: '', genres: [] });
  const [genreInput, setGenreInput] = useState('');
  const [currentImage, setCurrentImage] = useState(Math.floor(Math.random() * 3));
  const bookCarouselRef = useRef(null);
  const userCarouselRef = useRef(null);
  const postCarouselRef = useRef(null);

  const heroImages = [
    {
      src: HeroBg,
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
      src: ReadingNook,
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
      src: WarmLibrary,
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

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const debouncedGetBooks = useMemo(() => {
    return debounce((filters) => {
      if (isAuthenticated) {
        getBooks(filters);
      }
    }, 500);
  }, [isAuthenticated, getBooks]);

  useEffect(() => {
    debouncedGetBooks(filters);
    return () => debouncedGetBooks.cancel();
  }, [filters, debouncedGetBooks]);

  useEffect(() => {
    if (isAuthenticated) {
      getRecommendedUsers();
    }
  }, [isAuthenticated, getRecommendedUsers]);

  const handleSearch = debounce((value) => {
    if (value.length <= 100) {
      setFilters((prev) => ({ ...prev, search: value }));
    }
  }, 300);

  const handleGenreAdd = (e) => {
    if (e.key === 'Enter' && genreInput.trim() && genreInput.length <= 50) {
      e.preventDefault();
      if (!filters.genres.includes(genreInput.trim())) {
        setFilters((prev) => ({
          ...prev,
          genres: [...prev.genres, genreInput.trim()],
        }));
      }
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
      const scrollAmount = direction === 'left' ? -350 : 350;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const books = (apiBooks || []).slice(0, 10);
  const recommendedUsers = (apiUsers || []).slice(0, 10);

  return (
    <div className="min-h-screen bookish-gradient relative overflow-hidden pt-16">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center">
        <AnimatePresence>
          <motion.img
            key={heroImages[currentImage].src}
            src={heroImages[currentImage].src}
            alt={heroImages[currentImage].alt}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: heroImages[currentImage].objectPosition }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-[var(--primary)] bg-opacity-40 backdrop-blur-sm" />
        <motion.div
          className="relative z-10 text-center bookish-glass bookish-shadow p-8 rounded-2xl max-w-3xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        >
          <motion.h2
            key={`heading-${currentImage}`}
            className="text-3xl md:text-5xl font-['Lora'] text-[var(--secondary)] text-gradient mb-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {heroImages[currentImage].text.heading}
          </motion.h2>
          <motion.p
            key={`subheading-${currentImage}`}
            className="text-lg text-[var(--secondary)] font-['Open_Sans'] mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {heroImages[currentImage].text.subheading}
          </motion.p>
          <AuthLink
            to={heroImages[currentImage].text.ctaLink}
            text={heroImages[currentImage].text.ctaText}
            className="bookish-button-enhanced text-[var(--secondary)] px-6 py-3 rounded-xl"
          />
        </motion.div>
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`w-3 h-3 rounded-full ${
                index === currentImage ? 'bg-[var(--accent)]' : 'bg-[var(--secondary)] opacity-50'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <motion.section
        className="py-16 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-3xl font-['Lora'] text-[var(--primary)] text-center mb-8">
          How BookSwap Works
        </h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: '📚', title: 'List Your Books', desc: 'Add books you’re willing to swap or lend.' },
            { icon: '🔄', title: 'Find & Swap', desc: 'Browse books and arrange swaps with others.' },
            { icon: '💬', title: 'Join Discussions', desc: 'Connect with book lovers in societies and chats.' },
          ].map((step, index) => (
            <motion.div
              key={step.title}
              className="bookish-glass bookish-shadow p-6 rounded-xl text-center"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
            >
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="text-xl font-['Lora'] text-[var(--primary)]">{step.title}</h3>
              <p className="mt-2 text-[var(--text)] font-['Open_Sans']">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Trending Books */}
      <motion.section
        className="py-16 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-['Lora'] text-[var(--primary)] text-center mb-8">
          Trending Books
        </h2>
        {isLoading ? (
          <motion.p
            className="text-[var(--primary)] text-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Loading books...
          </motion.p>
        ) : books.length > 0 ? (
          <div className="relative max-w-full mx-auto px-4">
            <button
              onClick={() => scrollCarousel(bookCarouselRef, 'left')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bookish-button-enhanced text-[var(--secondary)] p-3 rounded-full z-10"
              aria-label="Scroll left"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <div
              ref={bookCarouselRef}
              className="flex overflow-x-auto space-x-6 p-4 scrollbar-hide"
            >
              {books.map((book, index) => (
                <motion.div
                  key={`book-${book.book_id}`}
                  className="min-w-[300px]"
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
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bookish-button-enhanced text-[var(--secondary)] p-3 rounded-full z-10"
              aria-label="Scroll right"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          </div>
        ) : (
          <motion.p
            className="text-[var(--text)] text-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            No trending books found. Start swapping today!
          </motion.p>
        )}
      </motion.section>

      {/* Recommended Users */}
      <motion.section
        className="py-16 px-4 bg-[var(--secondary)]"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-['Lora'] text-[var(--primary)] text-center mb-8">
          Meet Book Lovers
        </h2>
        {isLoading ? (
          <motion.p
            className="text-[var(--primary)] text-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Loading users...
          </motion.p>
        ) : recommendedUsers.length > 0 ? (
          <div className="relative max-w-full mx-auto px-4">
            <button
              onClick={() => scrollCarousel(userCarouselRef, 'left')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bookish-button-enhanced text-[var(--secondary)] p-3 rounded-full z-10"
              aria-label="Scroll left"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <div
              ref={userCarouselRef}
              className="flex overflow-x-auto space-x-6 p-4 scrollbar-hide"
            >
              {recommendedUsers.map((user, index) => (
                <motion.div
                  key={`user-${user.user_id}`}
                  className="min-w-[300px]"
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
              className="absolute right-4 top-1/2 transform -translate-y-1/2 bookish-button-enhanced text-[var(--secondary)] p-3 rounded-full z-10"
              aria-label="Scroll right"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          </div>
        ) : (
          <motion.p
            className="text-[var(--text)] text-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            No book lovers found. Invite friends to join!
          </motion.p>
        )}
      </motion.section>

      {/* Top Discussions */}
      <motion.section
        className="py-16 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-['Lora'] text-[var(--primary)] text-center mb-8">
          Hot Discussions
        </h2>
        {/* TODO: Replace mockTopPosts with dynamic fetching from API */}
        <div className="relative max-w-full mx-auto px-4">
          <button
            onClick={() => scrollCarousel(postCarouselRef, 'left')}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bookish-button-enhanced text-[var(--secondary)] p-3 rounded-full z-10"
            aria-label="Scroll left"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <div
            ref={postCarouselRef}
            className="flex overflow-x-auto space-x-6 p-4 scrollbar-hide"
          >
            {mockTopPosts.map((post, index) => (
              <motion.div
                key={`post-${post.discussion_id}`}
                className="min-w-[300px] bookish-glass bookish-shadow p-6 rounded-xl"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
              >
                <h3 className="text-lg font-['Lora'] text-[var(--primary)]">{post.title}</h3>
                <p className="text-[var(--text)] font-['Open_Sans'] line-clamp-2">{post.content}</p>
                <p className="text-sm text-[var(--accent)] font-['Caveat'] mt-2">
                  By {post.user.username} • {new Date(post.created_at).toLocaleDateString()}
                </p>
                <AuthLink
                  to={`/discussions/${post.discussion_id}`}
                  text="Join Discussion"
                  className="mt-4 text-[var(--primary)] hover:text-[var(--accent)]"
                />
              </motion.div>
            ))}
          </div>
          <button
            onClick={() => scrollCarousel(postCarouselRef, 'right')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bookish-button-enhanced text-[var(--secondary)] p-3 rounded-full z-10"
            aria-label="Scroll right"
          >
            <ChevronRightIcon className="h-6 w-6" />
          </button>
        </div>
      </motion.section>

      {/* Search Section */}
      <motion.section
        className="py-16 px-4 max-w-5xl mx-auto"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-['Lora'] text-[var(--primary)] text-center mb-8">
          Find Books & Readers
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <motion.input
            type="text"
            placeholder="Search by title, author, or username..."
            onChange={(e) => handleSearch(e.target.value)}
            maxLength={100}
            className="bookish-input w-full sm:w-1/2 px-4 py-3 rounded-xl"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          />
          <div className="w-full sm:w-1/2">
            <motion.input
              type="text"
              value={genreInput}
              onChange={(e) => setGenreInput(e.target.value)}
              onKeyDown={handleGenreAdd}
              maxLength={50}
              placeholder="Type a genre and press Enter"
              className="bookish-input w-full px-4 py-3 rounded-xl"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            />
            <AnimatePresence>
              <div className="mt-2 flex flex-wrap gap-2">
                {filters.genres.map((genre) => (
                  <motion.span
                    key={genre}
                    className="genre-tag text-[var(--secondary)] px-3 py-1 rounded-full text-sm flex items-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {genre}
                    <button
                      type="button"
                      onClick={() => handleGenreRemove(genre)}
                      className="ml-2 text-[var(--secondary)] hover:text-[var(--error)]"
                    >
                      ×
                    </button>
                  </motion.span>
                ))}
              </div>
            </AnimatePresence>
          </div>
        </div>
        {error && (
          <motion.p
            className="text-[var(--error)] text-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {error}
          </motion.p>
        )}
      </motion.section>
    </div>
  );
}

// Mock discussions data (replace with API call in production)
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