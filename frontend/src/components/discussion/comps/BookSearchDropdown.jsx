import React, { useState, useEffect, useRef } from 'react';

const BookSearchDropdown = ({ onBookSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Mock data for demonstration purposes
  const mockBooks = [
    { id: 1, title: 'To Kill a Mockingbird', author: 'Harper Lee', coverImage: '/images/mockingbird.jpg' },
    { id: 2, title: 'Pride and Prejudice', author: 'Jane Austen', coverImage: '/images/pride.jpg' },
    { id: 3, title: '1984', author: 'George Orwell', coverImage: '/images/1984.jpg' },
    { id: 4, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', coverImage: '/images/gatsby.jpg' },
    { id: 5, title: 'The Catcher in the Rye', author: 'J.D. Salinger', coverImage: '/images/catcher.jpg' },
    { id: 6, title: 'The Hobbit', author: 'J.R.R. Tolkien', coverImage: '/images/hobbit.jpg' },
    { id: 7, title: 'Harry Potter and the Sorcerer\'s Stone', author: 'J.K. Rowling', coverImage: '/images/harry.jpg' },
    { id: 8, title: 'The Lord of the Rings', author: 'J.R.R. Tolkien', coverImage: '/images/lotr.jpg' },
    { id: 9, title: 'To the Lighthouse', author: 'Virginia Woolf', coverImage: '/images/lighthouse.jpg' },
    { id: 10, title: 'Brave New World', author: 'Aldous Huxley', coverImage: '/images/brave.jpg' },
  ];

  // Simulated API call using the mock data
  const searchBooks = (query) => {
    setIsLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
      if (query.trim() === '') {
        setSearchResults([]);
      } else {
        const filteredBooks = mockBooks.filter(book => 
          book.title.toLowerCase().includes(query.toLowerCase()) || 
          book.author.toLowerCase().includes(query.toLowerCase())
        );
        setSearchResults(filteredBooks);
      }
      setIsLoading(false);
    }, 300);
  };

  // Handle input change and trigger search
  const handleSearchInputChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim()) {
      searchBooks(query);
      setShowDropdown(true);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  // Handle book selection
  const handleBookSelect = (book) => {
    onBookSelect(book);
    setSearchQuery('');
    setSearchResults([]);
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="relative">
        <input
          type="text"
          placeholder="Search for books to tag..."
          className="w-full px-4 py-2 pl-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
          value={searchQuery}
          onChange={handleSearchInputChange}
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
          </svg>
        </div>
        {searchQuery && (
          <button 
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => {
              setSearchQuery('');
              setSearchResults([]);
              setShowDropdown(false);
            }}
          >
            <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        )}
      </div>
      
      {/* Search Results Dropdown */}
      {showDropdown && (
        <div className="absolute z-20 mt-2 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-600">
              <svg className="animate-spin h-5 w-5 mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Searching...
            </div>
          ) : searchResults.length > 0 ? (
            <ul>
              {searchResults.map(book => (
                <li 
                  key={book.id} 
                  className="p-3 hover:bg-teal-50 border-b border-gray-100 last:border-b-0 cursor-pointer"
                  onClick={() => handleBookSelect(book)}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-16 bg-gray-200 rounded flex-shrink-0 mr-3">
                      {book.coverImage && (
                        <div 
                          className="w-full h-full bg-center bg-cover rounded" 
                          style={{ backgroundImage: `url(${book.coverImage})` }}
                        ></div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-brown-800">{book.title}</div>
                      <div className="text-sm text-gray-600">by {book.author}</div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : searchQuery ? (
            <div className="p-4 text-center text-gray-600">
              No books found matching "{searchQuery}"
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default BookSearchDropdown;