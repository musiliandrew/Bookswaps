import { useState, useEffect } from 'react';

export default function HeroBanner({ isAuthenticated }) {
  const [animationOffset, setAnimationOffset] = useState(0);
  
  // Subtle background animation effect
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setAnimationOffset(prev => (prev + 1) % 100);
    }, 150);
    
    return () => clearInterval(animationInterval);
  }, []);

  // Scroll to book library section
  const scrollToLibrary = () => {
    const librarySection = document.getElementById('book-library');
    if (librarySection) {
      librarySection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-br from-beige-100 to-beige-200">
      {/* Subtle background animation */}
      <div 
        className="absolute inset-0 opacity-20 z-0" 
        style={{
          backgroundImage: "url('/api/placeholder/1200/800')",
          backgroundSize: "cover",
          transform: `translateX(${animationOffset/10}px)`
        }}
      />
      
      {/* Decorative book icons */}
      <div className="absolute top-10 right-10 opacity-10 rotate-12">
        <svg className="w-24 h-24 text-brown-800" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 4H3a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1zm-1 14H4V6h16v12z"/>
          <path d="M9 8h6v2H9zm0 4h6v2H9z"/>
        </svg>
      </div>
      <div className="absolute bottom-10 left-10 opacity-10 -rotate-6">
        <svg className="w-20 h-20 text-teal-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 22h15v-2H6.012C5.55 19.988 5 19.805 5 19s.55-.988 1.012-1H21V4c0-1.103-.897-2-2-2H6c-1.206 0-3 .799-3 3v14c0 2.201 1.794 3 3 3zM5 8V5c0-.805.55-.988 1-1h13v10H5V8z"/>
        </svg>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brown-800 mb-4">
            Share Books, <span className="text-teal-600">Share Stories</span>
          </h1>
          
          <p className="text-lg md:text-xl text-brown-600 mb-8">
            Join our community of book lovers. Trade, borrow, and discover your next favorite read from people near you.
          </p>
          
          {isAuthenticated ? (
            <div className="space-x-4">
              <button 
                onClick={scrollToLibrary}
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                Browse Books
              </button>
              <button className="border-2 border-brown-800 text-brown-800 hover:bg-brown-800 hover:text-white font-bold py-3 px-6 rounded-lg transition-all">
                My Collection
              </button>
            </div>
          ) : (
            <div className="space-x-4">
              <a 
                href="/signup" 
                className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                Sign Up Free
              </a>
              <a 
                href="/login" 
                className="border-2 border-brown-800 text-brown-800 hover:bg-brown-800 hover:text-white font-bold py-3 px-6 rounded-lg transition-all"
              >
                Log In
              </a>
            </div>
          )}
        </div>
        
        {/* Feature highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white bg-opacity-80 p-6 rounded-lg shadow-md">
            <div className="text-teal-600 mb-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-brown-800 mb-2">List Your Books</h3>
            <p className="text-brown-600">Share books you're willing to trade or lend with the community.</p>
          </div>
          
          <div className="bg-white bg-opacity-80 p-6 rounded-lg shadow-md">
            <div className="text-teal-600 mb-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-brown-800 mb-2">Exchange Easily</h3>
            <p className="text-brown-600">Connect with readers nearby and arrange convenient swaps.</p>
          </div>
          
          <div className="bg-white bg-opacity-80 p-6 rounded-lg shadow-md">
            <div className="text-teal-600 mb-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-brown-800 mb-2">Discover New Reads</h3>
            <p className="text-brown-600">Find hidden gems and expand your literary horizons.</p>
          </div>
        </div>
      </div>
    </section>
  );
}