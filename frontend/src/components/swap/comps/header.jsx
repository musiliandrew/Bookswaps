import { useState, useEffect } from 'react';

// HeaderNav component that can be reused across pages
export function HeaderNav({ isAuthenticated, username, onAuthToggle, activeTab = 'home' }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  
  // Mock user profile data
  const [userProfile] = useState({
    username: username || 'JaneReader',
    avatar: '/api/placeholder/32/32', // Placeholder for demo
    notifications: 3
  });

  // Mock book search results
  const mockBooks = [
    { id: 1, title: 'To Kill a Mockingbird', author: 'Harper Lee' },
    { id: 2, title: 'The Great Gatsby', author: 'F. Scott Fitzgerald' },
    { id: 3, title: '1984', author: 'George Orwell' },
    { id: 4, title: 'Pride and Prejudice', author: 'Jane Austen' },
    { id: 5, title: 'The Catcher in the Rye', author: 'J.D. Salinger' }
  ];

  // Mock search function
  const handleSearch = (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    
    // Filter mock books based on search query
    const filteredBooks = mockBooks.filter(book => 
      book.title.toLowerCase().includes(query.toLowerCase()) || 
      book.author.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(filteredBooks);
    setShowSearchResults(true);
  };

  // Handle search input change
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    handleSearch(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    
    // Close search results when toggling menu
    if (!mobileMenuOpen) {
      setShowSearchResults(false);
    }
  };

  // Click outside search results to close
  useEffect(() => {
    function handleClickOutside(event) {
      if (showSearchResults && !event.target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearchResults]);

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="text-2xl font-bold text-brown-800">
              <span className="text-teal-600">Book</span>Swap
            </a>
          </div>
          
          {/* Search Bar - Desktop */}
          {isAuthenticated && (
            <div className="hidden md:block ml-4 flex-grow max-w-md search-container relative">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for books..."
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
                    onClick={clearSearch}
                  >
                    <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute z-20 mt-2 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    <ul>
                      {searchResults.map(book => (
                        <li key={book.id} className="p-3 hover:bg-teal-50 border-b border-gray-100 last:border-b-0">
                          <a href={`/books/${book.id}`} className="block">
                            <div className="font-medium text-brown-800">{book.title}</div>
                            <div className="text-sm text-gray-600">by {book.author}</div>
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-3 text-center text-gray-600">
                      No books found matching "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Desktop Navigation */}
          <nav className="hidden md:block ml-4">
            <ul className="flex space-x-6">
              {!isAuthenticated ? (
                <>
                  <li><a href="/" className={`text-brown-800 hover:text-teal-600 ${activeTab === 'home' ? 'font-bold text-teal-600' : ''}`}>Home</a></li>
                  <li><a href="/about" className={`text-brown-800 hover:text-teal-600 ${activeTab === 'about' ? 'font-bold text-teal-600' : ''}`}>About</a></li>
                  <li><a href="/signup" className={`text-brown-800 hover:text-teal-600 ${activeTab === 'signup' ? 'font-bold text-teal-600' : ''}`}>Sign Up</a></li>
                  <li><a href="/login" className={`text-brown-800 hover:text-teal-600 ${activeTab === 'login' ? 'font-bold text-teal-600' : ''}`}>Log In</a></li>
                </>
              ) : (
                <>
                  <li><a href="/" className={`text-brown-800 hover:text-teal-600 ${activeTab === 'home' ? 'font-bold text-teal-600' : ''}`}>Home</a></li>
                  <li><a href="/discussions" className={`text-brown-800 hover:text-teal-600 ${activeTab === 'discussions' ? 'font-bold text-teal-600' : ''}`}>Discussions</a></li>
                  <li><a href="/chats" className={`text-brown-800 hover:text-teal-600 ${activeTab === 'chats' ? 'font-bold text-teal-600' : ''}`}>Chats</a></li>
                  <li><a href="/swaps" className={`text-brown-800 hover:text-teal-600 ${activeTab === 'swaps' ? 'font-bold text-teal-600' : ''}`}>Swaps</a></li>
                  <li>
                    <a href="/notifications" className={`text-brown-800 hover:text-teal-600 relative ${activeTab === 'notifications' ? 'font-bold text-teal-600' : ''}`}>
                      Notifications
                      {userProfile.notifications > 0 && (
                        <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {userProfile.notifications}
                        </span>
                      )}
                    </a>
                  </li>
                  <li className="relative group">
                    <button className="flex items-center text-brown-800 hover:text-teal-600">
                      <img 
                        src={userProfile.avatar}
                        alt="Profile" 
                        className="w-8 h-8 rounded-full mr-2" 
                      />
                      {userProfile.username}
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                      <a href="/profile" className={`block px-4 py-2 text-gray-800 hover:bg-teal-50 ${activeTab === 'profile' ? 'bg-teal-50 text-teal-600' : ''}`}>Profile</a>
                      <a href="/settings" className={`block px-4 py-2 text-gray-800 hover:bg-teal-50 ${activeTab === 'settings' ? 'bg-teal-50 text-teal-600' : ''}`}>Settings</a>
                      <button onClick={onAuthToggle} className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-teal-50">Log Out</button>
                    </div>
                  </li>
                </>
              )}
            </ul>
          </nav>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            {isAuthenticated && (
              <button 
                className="text-brown-800 mr-4" 
                onClick={() => setShowSearchResults(!showSearchResults)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </button>
            )}
            <button className="text-brown-800" onClick={toggleMobileMenu}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Search (only shows when search icon is clicked) */}
        {isAuthenticated && showSearchResults && (
          <div className="md:hidden mt-4 search-container">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for books..."
                className="w-full px-4 py-2 pl-10 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                value={searchQuery}
                onChange={handleSearchInputChange}
                autoFocus
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </div>
              {searchQuery && (
                <button 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={clearSearch}
                >
                  <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              )}
            </div>
            
            {/* Mobile Search Results */}
            {searchQuery && (
              <div className="mt-2 bg-white rounded-md shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
                {searchResults.length > 0 ? (
                  <ul>
                    {searchResults.map(book => (
                      <li key={book.id} className="p-3 hover:bg-teal-50 border-b border-gray-100 last:border-b-0">
                        <a href={`/books/${book.id}`} className="block">
                          <div className="font-medium text-brown-800">{book.title}</div>
                          <div className="text-sm text-gray-600">by {book.author}</div>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-3 text-center text-gray-600">
                    No books found matching "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 py-2">
            <ul className="space-y-2 py-3">
              {!isAuthenticated ? (
                <>
                  <li><a href="/" className={`block py-2 text-brown-800 hover:text-teal-600 ${activeTab === 'home' ? 'font-bold text-teal-600' : ''}`}>Home</a></li>
                  <li><a href="/about" className={`block py-2 text-brown-800 hover:text-teal-600 ${activeTab === 'about' ? 'font-bold text-teal-600' : ''}`}>About</a></li>
                  <li><a href="/signup" className={`block py-2 text-brown-800 hover:text-teal-600 ${activeTab === 'signup' ? 'font-bold text-teal-600' : ''}`}>Sign Up</a></li>
                  <li><a href="/login" className={`block py-2 text-brown-800 hover:text-teal-600 ${activeTab === 'login' ? 'font-bold text-teal-600' : ''}`}>Log In</a></li>
                </>
              ) : (
                <>
                  <li><a href="/" className={`block py-2 text-brown-800 hover:text-teal-600 ${activeTab === 'home' ? 'font-bold text-teal-600' : ''}`}>Home</a></li>
                  <li><a href="/discussions" className={`block py-2 text-brown-800 hover:text-teal-600 ${activeTab === 'discussions' ? 'font-bold text-teal-600' : ''}`}>Discussions</a></li>
                  <li><a href="/chats" className={`block py-2 text-brown-800 hover:text-teal-600 ${activeTab === 'chats' ? 'font-bold text-teal-600' : ''}`}>Chats</a></li>
                  <li><a href="/swaps" className={`block py-2 text-brown-800 hover:text-teal-600 ${activeTab === 'swaps' ? 'font-bold text-teal-600' : ''}`}>Swaps</a></li>
                  <li>
                    <a href="/notifications" className={`block py-2 text-brown-800 hover:text-teal-600 relative ${activeTab === 'notifications' ? 'font-bold text-teal-600' : ''}`}>
                      Notifications
                      {userProfile.notifications > 0 && (
                        <span className="absolute top-2 ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {userProfile.notifications}
                        </span>
                      )}
                    </a>
                  </li>
                  <li>
                    <div className="flex items-center py-2">
                      <img 
                        src={userProfile.avatar}
                        alt="Profile" 
                        className="w-8 h-8 rounded-full mr-2" 
                      />
                      <span className="text-brown-800">{userProfile.username}</span>
                    </div>
                  </li>
                  <li><a href="/profile" className={`block py-2 text-brown-800 hover:text-teal-600 ${activeTab === 'profile' ? 'font-bold text-teal-600' : ''}`}>Profile</a></li>
                  <li><a href="/settings" className={`block py-2 text-brown-800 hover:text-teal-600 ${activeTab === 'settings' ? 'font-bold text-teal-600' : ''}`}>Settings</a></li>
                  <li>
                    <button 
                      onClick={onAuthToggle} 
                      className="block w-full text-left py-2 text-brown-800 hover:text-teal-600"
                    >
                      Log Out
                    </button>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}

// Example of using the HeaderNav component with Swaps as the active tab
export default function HeaderWithSwapsActive() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [username,] = useState('JaneReader');
  
  const toggleAuth = () => {
    setIsAuthenticated(!isAuthenticated);
  };

  return (
    <HeaderNav 
      isAuthenticated={isAuthenticated} 
      username={username} 
      onAuthToggle={toggleAuth}
      activeTab="swaps"
    />
  );
}