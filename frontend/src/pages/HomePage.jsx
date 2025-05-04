import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import BookCard from '../components/home/BookCard';
import UserCard from '../components/users/UserCard';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import debounce from 'lodash/debounce';

function HomePage() {
  const navigate = useNavigate();
  const { getBooks, getRecommendedUsers, books, topBooks, recommendedUsers, isAuthenticated, error, isLoading } = useAuth();
  const [filters, setFilters] = useState({ search: '', genres: [] });
  const [genreInput, setGenreInput] = useState('');
  const bookCarouselRef = useRef(null);
  const userCarouselRef = useRef(null);

  useEffect(() => {
    getBooks(filters);
    getRecommendedUsers();
  }, [filters, getBooks, getRecommendedUsers]);

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
      <div className="bg-[var(--secondary)] py-12 text-center">
        <h1 className="text-4xl font-extrabold text-[var(--primary)]">
          Welcome to BookSwap
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Discover, swap, and share books with fellow book lovers.
        </p>
        <button
          onClick={() => navigate(isAuthenticated ? '/users/search' : '/signup')}
          className="mt-6 bg-[var(--primary)] text-[var(--secondary)] font-medium py-2 px-6 rounded hover:bg-opacity-90"
        >
          {isAuthenticated ? 'Start Swapping!' : 'Join BookSwap!'}
        </button>
      </div>

      {/* Featured Books Carousel */}
      {topBooks?.length > 0 && (
        <div className="py-8">
          <h2 className="text-2xl font-bold text-[var(--primary)] text-center">
            Featured Books
          </h2>
          <div className="relative max-w-6xl mx-auto">
            <button
              onClick={() => scrollCarousel(bookCarouselRef, 'left')}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-[var(--primary)] text-[var(--secondary)] p-2 rounded-full"
              aria-label="Scroll left"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <div
              ref={bookCarouselRef}
              className="flex overflow-x-auto space-x-4 p-4 scrollbar-hide"
            >
              {topBooks.map((book) => (
                <div key={book.discussion_id} className="min-w-[200px]">
                  <BookCard book={book} />
                </div>
              ))}
            </div>
            <button
              onClick={() => scrollCarousel(bookCarouselRef, 'right')}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-[var(--primary)] text-[var(--secondary)] p-2 rounded-full"
              aria-label="Scroll right"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}

      {/* Recommended Users Carousel */}
      {recommendedUsers?.length > 0 && (
        <div className="py-8">
          <h2 className="text-2xl font-bold text-[var(--primary)] text-center">
            Recommended Users
          </h2>
          <div className="relative max-w-6xl mx-auto">
            <button
              onClick={() => scrollCarousel(userCarouselRef, 'left')}
              className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-[var(--primary)] text-[var(--secondary)] p-2 rounded-full"
              aria-label="Scroll left"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <div
              ref={userCarouselRef}
              className="flex overflow-x-auto space-x-4 p-4 scrollbar-hide"
            >
              {recommendedUsers.map((user) => (
                <div key={user.user_id} className="min-w-[200px]">
                  <UserCard user={user} />
                </div>
              ))}
            </div>
            <button
              onClick={() => scrollCarousel(userCarouselRef, 'right')}
              className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-[var(--primary)] text-[var(--secondary)] p-2 rounded-full"
              aria-label="Scroll right"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}

      {/* Book Grid with Filters */}
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold text-[var(--primary)] text-center">
          Browse Books
        </h2>
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by title or author..."
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full sm:w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)]"
          />
          <div className="w-full sm:w-1/2">
            <input
              type="text"
              value={genreInput}
              onChange={(e) => setGenreInput(e.target.value)}
              onKeyDown={handleGenreAdd}
              placeholder="Type a genre and press Enter"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[var(--primary)] focus:border-[var(--primary)]"
            />
            <div className="mt-2 flex flex-wrap gap-2">
              {filters.genres.map((genre) => (
                <span
                  key={genre}
                  className="bg-[var(--primary)] text-[var(--secondary)] px-2 py-1 rounded-full text-sm flex items-center"
                >
                  {genre}
                  <button
                    type="button"
                    onClick={() => handleGenreRemove(genre)}
                    className="ml-2 text-[var(--secondary)]"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        {isLoading ? (
          <p className="text-center text-[var(--primary)] mt-8">Loading...</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {books?.length ? (
              books.map((book) => (
                <BookCard key={book.discussion_id} book={book} />
              ))
            ) : (
              <p className="text-center text-gray-600 col-span-full">No books found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;