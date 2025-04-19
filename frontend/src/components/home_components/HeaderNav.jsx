import { useState } from 'react';

export default function BookswapHome() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, ] = useState('JaneReader');
  
  // Toggle authentication for demo purposes
  const toggleAuth = () => {
    setIsAuthenticated(!isAuthenticated);
  };

  return (
    <div className="min-h-screen flex flex-col bg-amber-50">
      <HeaderNav 
        isAuthenticated={isAuthenticated} 
        username={username} 
        onAuthToggle={toggleAuth}
      />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-brown-800 mb-6">Welcome to BookSwap</h1>
        <p className="text-lg text-gray-700 mb-4">
          Share books, join discussions, and connect with fellow readers!
        </p>
        <button 
          className="mt-4 bg-teal-600 hover:bg-teal-700 text-white py-2 px-6 rounded-md"
          onClick={toggleAuth}
        >
          {isAuthenticated ? 'Log Out (Demo)' : 'Log In (Demo)'}
        </button>
      </main>
    </div>
  );
}

function HeaderNav({ isAuthenticated, username, onAuthToggle }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <a href="/" className="text-2xl font-bold text-brown-800">
            <span className="text-teal-600">Book</span>Swap
          </a>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-6">
            {!isAuthenticated ? (
              <>
                <li><a href="/" className="text-brown-800 hover:text-teal-600">Home</a></li>
                <li><a href="/about" className="text-brown-800 hover:text-teal-600">About</a></li>
                <li><a href="/signup" className="text-brown-800 hover:text-teal-600">Sign Up</a></li>
                <li><a href="/login" className="text-teal-600 font-bold">Log In</a></li>
              </>
            ) : (
              <>
                <li><a href="/" className="text-brown-800 hover:text-teal-600">Home</a></li>
                <li><a href="/discussions" className="text-brown-800 hover:text-teal-600">Discussions</a></li>
                <li><a href="/chats" className="text-brown-800 hover:text-teal-600">Chats</a></li>
                <li><a href="/swaps" className="text-brown-800 hover:text-teal-600">Swaps</a></li>
                <li>
                  <a href="/notifications" className="text-brown-800 hover:text-teal-600 relative">
                    Notifications
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      3
                    </span>
                  </a>
                </li>
                <li className="relative group">
                  <button className="flex items-center text-brown-800 hover:text-teal-600">
                    <img 
                      src="/api/placeholder/32/32" 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full mr-2" 
                    />
                    {username}
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    <a href="/profile" className="block px-4 py-2 text-gray-800 hover:bg-teal-50">Profile</a>
                    <a href="/settings" className="block px-4 py-2 text-gray-800 hover:bg-teal-50">Settings</a>
                    <button onClick={onAuthToggle} className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-teal-50">Log Out</button>
                  </div>
                </li>
              </>
            )}
          </ul>
        </nav>
        
        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button className="text-brown-800" onClick={toggleMobileMenu}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="container mx-auto px-4 py-2">
            <ul className="space-y-2 py-3">
              {!isAuthenticated ? (
                <>
                  <li><a href="/" className="block py-2 text-brown-800 hover:text-teal-600">Home</a></li>
                  <li><a href="/about" className="block py-2 text-brown-800 hover:text-teal-600">About</a></li>
                  <li><a href="/signup" className="block py-2 text-brown-800 hover:text-teal-600">Sign Up</a></li>
                  <li><a href="/login" className="block py-2 text-teal-600 font-bold">Log In</a></li>
                </>
              ) : (
                <>
                  <li><a href="/" className="block py-2 text-brown-800 hover:text-teal-600">Home</a></li>
                  <li><a href="/discussions" className="block py-2 text-brown-800 hover:text-teal-600">Discussions</a></li>
                  <li><a href="/chats" className="block py-2 text-brown-800 hover:text-teal-600">Chats</a></li>
                  <li><a href="/swaps" className="block py-2 text-brown-800 hover:text-teal-600">Swaps</a></li>
                  <li>
                    <a href="/notifications" className="block py-2 text-brown-800 hover:text-teal-600 relative">
                      Notifications
                      <span className="absolute top-2 ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        3
                      </span>
                    </a>
                  </li>
                  <li><a href="/profile" className="block py-2 text-brown-800 hover:text-teal-600">Profile</a></li>
                  <li><a href="/settings" className="block py-2 text-brown-800 hover:text-teal-600">Settings</a></li>
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