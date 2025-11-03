import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpenIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  GlobeAltIcon,
  ChartBarIcon,
  ArrowRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { api } from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import appLogo from '../assets/icons/AppLogo.svg';

function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const bookCarouselRef = useRef(null);
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile/me', { replace: true });
      return;
    }

    const fetchBooks = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/library/books/?page=1&limit=6');
        setTrendingBooks(response.data.results || []);
      } catch {
        // Mock data for demo
        setTrendingBooks([
          { book_id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', cover_image_url: null },
          { book_id: 2, title: '1984', author: 'George Orwell', cover_image_url: null },
          { book_id: 3, title: 'To Kill a Mockingbird', author: 'Harper Lee', cover_image_url: null },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [isAuthenticated, navigate]);

  const features = [
    {
      icon: BookOpenIcon,
      title: 'Swap Books',
      description: 'Exchange your favorite books with readers nearby'
    },
    {
      icon: UserGroupIcon,
      title: 'Join Communities',
      description: 'Connect with book lovers in vibrant discussions'
    },
    {
      icon: MagnifyingGlassIcon,
      title: 'Discover Reads',
      description: 'Find your next literary adventure effortlessly'
    },
    {
      icon: ChartBarIcon,
      title: 'Track Progress',
      description: 'Monitor your reading goals and achievements'
    },
    {
      icon: SparklesIcon,
      title: 'Smart Matches',
      description: 'Get AI-powered personalized recommendations'
    },
    {
      icon: GlobeAltIcon,
      title: 'Global Network',
      description: 'Connect with readers from around the world'
    },
  ];

  const scrollCarousel = (direction) => {
    if (bookCarouselRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      bookCarouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Navbar */}
      <nav className="top-nav">
        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <img src={appLogo} alt="BookSwaps" className="w-10 h-10" />
          <div>
            <h1 className="text-xl font-semibold" style={{ color: 'var(--primary-700)' }}>
              BookSwaps
            </h1>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              Connect • Swap • Read
            </p>
          </div>
        </motion.div>

        <motion.div
          className="flex items-center gap-3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <button
            onClick={() => navigate('/login')}
            className="btn btn-ghost"
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            className="btn btn-accent"
          >
            Get Started
          </button>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="container py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
              style={{ color: 'var(--text-primary)' }}
            >
              Discover, Swap,{' '}
              <span className="gradient-text">Connect</span>
            </h1>
            <p
              className="text-lg md:text-xl mb-8"
              style={{ color: 'var(--text-secondary)' }}
            >
              Join a community of book lovers who share, discuss, and exchange their favorite reads.
              Your next great adventure is just a swap away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/register')}
                className="btn btn-accent btn-lg"
              >
                Start Swapping
                <ArrowRightIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="btn btn-outline btn-lg"
              >
                Explore Library
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12">
              <div>
                <div className="text-3xl font-bold" style={{ color: 'var(--primary-600)' }}>
                  10K+
                </div>
                <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  Books Swapped
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold" style={{ color: 'var(--primary-600)' }}>
                  5K+
                </div>
                <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  Active Readers
                </div>
              </div>
              <div>
                <div className="text-3xl font-bold" style={{ color: 'var(--primary-600)' }}>
                  200+
                </div>
                <div className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
                  Communities
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="hidden md:block"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative">
              <div
                className="absolute inset-0 rounded-2xl opacity-20 blur-3xl"
                style={{ backgroundColor: 'var(--primary-500)' }}
              />
              <img
                src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800"
                alt="Books"
                className="relative rounded-2xl shadow-2xl"
                style={{ objectFit: 'cover', height: '500px', width: '100%' }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <div className="container">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: 'var(--text-primary)' }}
            >
              Why Choose BookSwaps?
            </h2>
            <p
              className="text-lg max-w-2xl mx-auto"
              style={{ color: 'var(--text-secondary)' }}
            >
              Everything you need to build a thriving reading community
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="card card-hover p-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: 'var(--primary-50)' }}
                >
                  <feature.icon
                    className="w-6 h-6"
                    style={{ color: 'var(--primary-600)' }}
                  />
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {feature.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Books Section */}
      {trendingBooks.length > 0 && (
        <section className="py-16" style={{ backgroundColor: 'var(--bg-secondary)' }}>
          <div className="container">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ color: 'var(--text-primary)' }}
              >
                Trending Books
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Popular titles in our community
              </p>
            </motion.div>

            <div className="relative">
              <button
                onClick={() => scrollCarousel('left')}
                className="btn-icon btn-secondary absolute left-0 top-1/2 transform -translate-y-1/2 z-10 hidden md:flex items-center justify-center"
              >
                <ChevronLeftIcon className="w-6 h-6" />
              </button>

              <div
                ref={bookCarouselRef}
                className="flex gap-6 overflow-x-auto scrollbar-hide px-4 md:px-12"
                style={{ scrollBehavior: 'smooth' }}
              >
                {trendingBooks.map((book) => (
                  <motion.div
                    key={book.book_id}
                    className="book-card min-w-[250px]"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                  >
                    <div
                      className="book-card-image"
                      style={{
                        backgroundColor: 'var(--neutral-200)',
                        backgroundImage: book.cover_image_url
                          ? `url(${book.cover_image_url})`
                          : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                      }}
                    />
                    <div className="book-card-content">
                      <h4 className="book-card-title line-clamp-2">{book.title}</h4>
                      <p className="book-card-author line-clamp-1">{book.author}</p>
                    </div>
                    <div className="book-card-footer">
                      <button className="btn btn-sm btn-primary btn-block">
                        View Details
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              <button
                onClick={() => scrollCarousel('right')}
                className="btn-icon btn-secondary absolute right-0 top-1/2 transform -translate-y-1/2 z-10 hidden md:flex items-center justify-center"
              >
                <ChevronRightIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20" style={{ backgroundColor: 'var(--primary-500)' }}>
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: 'var(--text-inverse)' }}
            >
              Ready to Start Your Journey?
            </h2>
            <p
              className="text-lg mb-8 max-w-2xl mx-auto"
              style={{ color: 'rgba(255, 255, 255, 0.9)' }}
            >
              Join thousands of readers who are discovering new books and making friends through BookSwaps
            </p>
            <button
              onClick={() => navigate('/register')}
              className="btn btn-lg flex items-center justify-center gap-2 mx-auto"
              style={{
                backgroundColor: 'var(--text-inverse)',
                color: 'var(--primary-600)',
                border: 'none'
              }}
            >
              Get Started Free
              <ArrowRightIcon className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12" style={{ backgroundColor: 'var(--bg-primary)', borderTop: '1px solid var(--border-light)' }}>
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={appLogo} alt="BookSwaps" className="w-8 h-8" />
                <span className="font-semibold" style={{ color: 'var(--primary-700)' }}>
                  BookSwaps
                </span>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Connect, swap, and discover your next favorite book.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Platform
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" style={{ color: 'var(--text-secondary)' }}>Browse Books</a>
                </li>
                <li>
                  <a href="#" style={{ color: 'var(--text-secondary)' }}>Communities</a>
                </li>
                <li>
                  <a href="#" style={{ color: 'var(--text-secondary)' }}>How It Works</a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Company
              </h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" style={{ color: 'var(--text-secondary)' }}>About Us</a>
                </li>
                <li>
                  <a href="#" style={{ color: 'var(--text-secondary)' }}>Contact</a>
                </li>
                <li>
                  <a href="#" style={{ color: 'var(--text-secondary)' }}>Privacy</a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                Connect
              </h4>
              <p className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                Join our newsletter
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="input flex-1 text-sm"
                />
                <button className="btn btn-primary btn-sm">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-8" style={{ borderTop: '1px solid var(--border-light)' }}>
            <p className="text-center text-sm" style={{ color: 'var(--text-tertiary)' }}>
              &copy; 2025 BookSwaps by QuantIQ Dev. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
