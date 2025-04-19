import React, { useState, useEffect } from 'react';

/**
 * FeedFilter component - Combined search bar, sort dropdown and genre filters
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onFilterChange - Callback for when filters change, receives filters object
 */
const FeedFilter = ({ onFilterChange }) => {
  // Local state for filter values
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState(''); // For debouncing
  const [sort, setSort] = useState('newest');
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Notify parent component of filter changes
  useEffect(() => {
    if (typeof onFilterChange === 'function') {
      onFilterChange({
        search,
        sort,
        genres: selectedGenres
      });
    }
  }, [search, sort, selectedGenres, onFilterChange]);

  // Toggle genre selection
  const toggleGenre = (genre) => {
    setSelectedGenres(prev => 
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setSort('newest');
    setSelectedGenres([]);
  };

  // Check if any filters are active
  const hasActiveFilters = search !== '' || sort !== 'newest' || selectedGenres.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
        {/* Search Bar */}
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search discussions..."
            className="w-full px-4 py-2 pl-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          {searchInput && (
            <button 
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              onClick={() => { setSearchInput(''); setSearch(''); }}
            >
              <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="relative min-w-[140px]">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full appearance-none px-4 py-2 bg-white border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="newest">Newest</option>
            <option value="popular">Most Popular</option>
            <option value="commented">Most Commented</option>
            <option value="active">Recently Active</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </div>
        </div>

        {/* Genre Filter Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowGenreDropdown(!showGenreDropdown)}
            className="w-full md:w-auto flex items-center justify-between px-4 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <span className="flex items-center">
              <svg className="h-5 w-5 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
              </svg>
              Genres
              {selectedGenres.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                  {selectedGenres.length}
                </span>
              )}
            </span>
            <svg className="ml-2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>

          {showGenreDropdown && (
            <div className="absolute z-10 mt-1 w-64 bg-white rounded-md shadow-lg border border-gray-200 py-1">
              <div className="px-3 py-2 border-b border-gray-200 flex justify-between items-center">
                <h3 className="font-medium text-gray-700">Filter by Genre</h3>
                <button
                  onClick={() => setSelectedGenres([])}
                  className="text-sm text-teal-600 hover:text-teal-700"
                >
                  Clear
                </button>
              </div>
              <div className="max-h-60 overflow-y-auto p-2">
                {genres.map((genre) => (
                  <div key={genre} className="flex items-center px-2 py-1.5 hover:bg-gray-100 rounded">
                    <input
                      type="checkbox"
                      id={`genre-${genre}`}
                      checked={selectedGenres.includes(genre)}
                      onChange={() => toggleGenre(genre)}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`genre-${genre}`}
                      className="ml-2 block text-sm text-gray-700 cursor-pointer"
                    >
                      {genre}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Clear Filters Button - Only show if filters are active */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-teal-600 hover:text-teal-700 flex items-center"
          >
            <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
            Clear filters
          </button>
        )}
      </div>

      {/* Active Genre Tags - Show selected genres as removable tags */}
      {selectedGenres.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedGenres.map(genre => (
            <span 
              key={genre} 
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800"
            >
              {genre}
              <button
                type="button"
                onClick={() => toggleGenre(genre)}
                className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-teal-400 hover:text-teal-600 focus:outline-none"
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// Mock genres data - In a real app, this might come from props or an API
const genres = [
  'Fiction',
  'Non-Fiction',
  'Mystery',
  'Science Fiction',
  'Fantasy',
  'Romance',
  'Thriller',
  'Horror',
  'History',
  'Biography',
  'Self-Help',
  'Children',
  'Young Adult',
  'Poetry',
  'Classics',
  'Contemporary'
];

export default FeedFilter;