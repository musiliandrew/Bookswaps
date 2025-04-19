import React, { useState } from 'react';

const GenreFilter = ({ selectedGenres = [], onChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Common book genres
  const genres = [
    'Fiction', 'Mystery', 'Romance', 'Science Fiction', 'Fantasy',
    'Biography', 'History', 'Self-Help', 'Business', 'Thriller',
    'Horror', 'Poetry', 'Young Adult', 'Children', 'Classics',
    'Non-Fiction', 'Philosophy', 'Psychology', 'Science', 'Comics'
  ];

  const handleGenreChange = (genre) => {
    const updatedGenres = selectedGenres.includes(genre)
      ? selectedGenres.filter(g => g !== genre)
      : [...selectedGenres, genre];
    
    onChange(updatedGenres);
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white rounded-md shadow border border-gray-200">
      <div 
        className="flex justify-between items-center p-3 cursor-pointer"
        onClick={toggleExpand}
      >
        <h3 className="font-medium text-brown-800">Genres</h3>
        <svg 
          className={`h-5 w-5 text-gray-400 transform ${isExpanded ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </div>
      
      {isExpanded && (
        <div className="p-3 border-t border-gray-100">
          <div className="max-h-64 overflow-y-auto">
            {genres.map(genre => (
              <div key={genre} className="flex items-center mb-2 last:mb-0">
                <input
                  type="checkbox"
                  id={`genre-${genre}`}
                  className="rounded text-teal-600 focus:ring-teal-500 border-gray-300"
                  checked={selectedGenres.includes(genre)}
                  onChange={() => handleGenreChange(genre)}
                />
                <label 
                  htmlFor={`genre-${genre}`} 
                  className="ml-2 text-sm text-gray-700 cursor-pointer"
                >
                  {genre}
                </label>
              </div>
            ))}
          </div>
          
          {selectedGenres.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
              <span className="text-sm text-gray-600">
                {selectedGenres.length} selected
              </span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onChange([]);
                }}
                className="text-sm text-teal-600 hover:text-teal-800"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GenreFilter;