import { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import debounce from 'lodash/debounce';
import HeroSection from '../../components/Home/HeroSection';
import LoginCTA from '../../components/Home/LoginCTA';
import SignupCTA from '../../components/Home/SignupCTA';
import FeatureCard from '../../components/Home/FeaturedCard';
import Footer from '../../components/Home/Footer';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { api } from '../../utils/api';
import { useAuth } from '../../hooks/useAuth';

function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const bookCarouselRef = useRef(null);
  const userCarouselRef = useRef(null);
  const [trendingBooks, setTrendingBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounced fetchBooks function
  const fetchBooks = useMemo(
  () => debounce(async () => {
    if (isAuthenticated) return; // Skip fetch if authenticated
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/library/books/?page=1&limit=6');
      setTrendingBooks(response.data.results || []);
    } catch {
      setError('Failed to load trending books. Showing mock data.');
      setTrendingBooks([
        { id: 1, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', cover: 'https://covers.openlibrary.org/b/id/12364437-M.jpg' },
        { id: 2, title: '1984', author: 'George Orwell', cover: 'https://covers.openlibrary.org/b/id/14845126-M.jpg' },
        { id: 3, title: 'To Kill a Mockingbird', author: 'Harper Lee', cover: 'https://covers.openlibrary.org/b/id/14856323-M.jpg' },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, 1000),
  [isAuthenticated, setIsLoading, setError, setTrendingBooks] // Include all dependencies
);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/profile/me', { replace: true });
      return;
    }
    fetchBooks();
    return () => fetchBooks.cancel(); // Clean up debounced function
  }, [isAuthenticated, navigate, fetchBooks]);

  const mockUsers = [
    { id: 1, username: '@BookWorm', avatar: 'https://img.freepik.com/free-vector/young-man-glasses-hoodie_1308-174658.jpg?ga=GA1.1.1441547685.1747836414&semt=ais_hybrid&w=740' },
    { id: 2, username: '@SciFiFan', avatar: 'https://img.freepik.com/free-vector/smiling-young-man-illustration_1308-174669.jpg?ga=GA1.1.1441547685.1747836414&semt=ais_hybrid&w=740' },
    { id: 3, username: '@FantasyReader', avatar: 'https://img.freepik.com/free-psd/3d-rendering-hair-style-avatar-design_23-2151869121.jpg?ga=GA1.1.1441547685.1747836414&semt=ais_hybrid&w=740' },
    { id: 4, username: '@Andrew', avatar: 'https://img.freepik.com/premium-vector/simple-cute-black-boy-ith-beard-icon-vector_960391-438.jpg?uid=R189817629&ga=GA1.1.1441547685.1747836414&semt=ais_hybrid&w=740' },
    { id: 5, username: '@Musk', avatar: 'https://img.freepik.com/free-vector/young-prince-traditional-attire_1308-174397.jpg?uid=R189817629&ga=GA1.1.1441547685.1747836414&semt=ais_hybrid&w=740' },
    { id: 6, username: '@Marie', avatar: 'https://img.freepik.com/free-psd/3d-rendering-hair-style-avatar-design_23-2151869157.jpg?uid=R189817629&ga=GA1.1.1441547685.1747836414&semt=ais_hybrid&w=740' },
    { id: 7, username: '@Anne', avatar: 'https://img.freepik.com/free-vector/young-girl-with-curly-hair_1308-176128.jpg?uid=R189817629&ga=GA1.1.1441547685.1747836414&semt=ais_hybrid&w=740' },
    { id: 8, username: '@Sheldon', avatar: 'https://img.freepik.com/premium-photo/png-cartoon-portrait-glasses-white-background_53876-905385.jpg?uid=R189817629&ga=GA1.1.1441547685.1747836414&semt=ais_hybrid&w=740' },
  ];

  const mockFeatures = [
    { icon: '📚', title: 'Swap Books', desc: 'List and trade your books with ease.' },
    { icon: '💬', title: 'Join Discussions', desc: 'Engage in vibrant book communities.' },
    { icon: '🔍', title: 'Discover Reads', desc: 'Find new books to love and share.' },
  ];

  const scrollCarousel = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bookish-gradient relative overflow-hidden">
      {/* Navbar - Large Screens */}
      <nav className="hidden md:flex justify-between items-center px-8 py-4 w-full bg-[hsl(49,52%,88%)] shadow-lg">
        <div className="flex items-center space-x-3">
          <img 
            src="src/assets/icons/AppLogo.svg" 
            alt="BookSwaps Logo" 
            className="w-10 h-10" 
            style={{ color: '#456A76' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'block';
            }}
          />
          <span 
            className="hidden text-[#456A76] font-bold text-xl font-['Lora']"
            style={{ display: 'none' }}
          >
            B
          </span>
          <h1 className="text-3xl font-bold font-['Lora'] text-[#456A76]">BookSwaps</h1>
        </div>
        
        <div className="flex items-center space-x-8">
          <div className="flex space-x-8">
            <a 
              href="#home" 
              className="relative text-xl font-['Lora'] font-semibold text-[#456A76] hover:text-[#D4A017] transition-all duration-300 group"
            >
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D4A017] transition-all duration-300 group-hover:w-full"></span>
            </a>
            <a 
              href="#trending-books" 
              className="relative text-xl font-['Lora'] font-semibold text-[#456A76] hover:text-[#D4A017] transition-all duration-300 group"
            >
              Library
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#D4A017] transition-all duration-300 group-hover:w-full"></span>
            </a>
          </div>
          
          <div className="flex items-center space-x-4">
            <LoginCTA className="px-6 py-3 text-lg font-['Lora'] font-semibold text-[#456A76] border-2 border-[#456A76] rounded-full hover:bg-[#456A76] hover:text-white transition-all duration-300 transform hover:scale-105" />
            <SignupCTA className="px-6 py-3 text-lg font-['Lora'] font-semibold text-white bg-gradient-to-r from-[#456A76] to-[#D4A017] rounded-full hover:shadow-lg transition-all duration-300 transform hover:scale-105 hover:shadow-[#D4A017]/25" />
          </div>
        </div>
      </nav>

      {/* Navbar - Small Screens */}
      <nav className="md:hidden flex justify-between items-center px-4 py-4 w-full bg-[hsl(49,52%,88%)] shadow-lg">
        <div className="flex items-center space-x-3">
          <img 
            src="src/assets/icons/AppLogo.svg" 
            alt="BookSwaps Logo" 
            className="w-8 h-8" 
            style={{ color: '#456A76' }}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'block';
            }}
          />
          <span 
            className="hidden text-[#456A76] font-bold text-lg font-['Lora']"
            style={{ display: 'none' }}
          >
            B
          </span>
          <h1 className="text-xl font-bold font-['Lora'] text-[#456A76]">BookSwaps</h1>
        </div>
        
        <div className="flex items-center space-x-2">
          <LoginCTA className="px-4 py-2 text-base font-['Lora'] font-semibold text-[#456A76] border-2 border-[#456A76] rounded-full hover:bg-[#456A76] hover:text-white transition-all duration-300" />
          <SignupCTA className="px-4 py-2 text-base font-['Lora'] font-semibold text-white bg-gradient-to-r from-[#456A76] to-[#D4A017] rounded-full hover:shadow-md transition-all duration-300" />
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <section className="py-16 px-4">
        <h2 className="text-3xl font-['Lora'] text-[var(--primary)] text-center mb-8">
          Why Choose BookSwaps?
        </h2>
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {mockFeatures.map((feature, index) => (
            <FeatureCard key={index} icon={feature.icon} title={feature.title} desc={feature.desc} />
          ))}
        </div>
      </section>

      {/* Trending Books */}
      <section className="py-16 px-4 bg-[var(--secondary)]">
        <h2 className="text-3xl font-['Lora'] text-[var(--primary)] text-center mb-8">
          Trending Books
        </h2>
        {isLoading ? (
          <div className="text-center">
            <div className="bookish-spinner mx-auto w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <p className="text-center text-[var(--text)]">{error}</p>
        ) : trendingBooks.length > 0 ? (
          <div className="relative max-w-full mx-auto px-4">
            <button
              onClick={() => scrollCarousel(bookCarouselRef, 'left')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 bookish-button-enhanced text-[var(--secondary)] p-3 rounded-full z-10"
              aria-label="Scroll left"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <div ref={bookCarouselRef} className="flex overflow-x-auto space-x-6 p-4 scrollbar-hide">
              {trendingBooks.map((book) => (
                <div key={book.id} className="min-w-[300px] bookish-glass bookish-shadow p-6 rounded-xl">
                  <img src={book.cover || '/assets/icons/books.svg'} alt={book.title} className="w-full h-40 object-cover mb-4 rounded-lg" />
                  <h3 className="text-xl font-['Lora'] text-[var(--primary)]">{book.title}</h3>
                  <p className="text-[var(--text)] font-['Open_Sans']">{book.author}</p>
                </div>
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
          <p className="text-center text-[var(--text)]">No books available. Start swapping!</p>
        )}
      </section>

      {/* Meet Book Lovers */}
      <section className="py-16 px-4">
        <h2 className="text-3xl font-['Lora'] text-[var(--primary)] text-center mb-8">
          Meet Book Lovers
        </h2>
        <div className="relative max-w-full mx-auto px-4">
          <button
            onClick={() => scrollCarousel(userCarouselRef, 'left')}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bookish-button-enhanced text-[var(--secondary)] p-3 rounded-full z-10"
            aria-label="Scroll left"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>
          <div ref={userCarouselRef} className="flex overflow-x-auto space-x-6 p-4 scrollbar-hide">
            {mockUsers.map((user) => (
              <div key={user.id} className="min-w-[300px] bookish-glass bookish-shadow p-6 rounded-xl text-center">
                <img src={user.avatar} alt={user.username} className="w-24 h-24 rounded-full mx-auto mb-4" />
                <h3 className="text-xl font-['Lora'] text-[var(--primary)]">{user.username}</h3>
              </div>
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
      </section>
      <Footer />
    </div>
  );
}

export default HomePage;