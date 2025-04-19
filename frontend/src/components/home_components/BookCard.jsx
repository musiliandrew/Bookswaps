import { useState } from 'react';

export default function BookCard({ bookData, isAuthenticated }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const {
    // id,
    title,
    author,
    coverImage,
    owner,
    availableForSwap,
    availableForBorrow,
  } = bookData;
  
  const handleBookmarkToggle = () => {
    setIsBookmarked(!isBookmarked);
    // In a real app, this would call an API to save the bookmark
  };
  
  const handleSwapRequest = () => {
    if (!isAuthenticated) {
      // Redirect to signup in a real application
      alert("Please sign up to swap books");
      return;
    }
    
    // In a real app, this would call the API: POST /api/swaps/
    alert(`Swap request sent for "${title}"`);
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
      {/* Book Cover */}
      <div className="relative h-48 bg-gray-200">
        <img 
          src={coverImage || "/api/placeholder/240/360"} 
          alt={`Cover of ${title}`}
          className="w-full h-full object-cover"
        />
        
        {/* Availability Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {availableForSwap && (
            <span className="bg-teal-600 text-white text-xs px-2 py-1 rounded">
              Swap
            </span>
          )}
          {availableForBorrow && (
            <span className="bg-amber-500 text-white text-xs px-2 py-1 rounded">
              Borrow
            </span>
          )}
        </div>
      </div>
      
      {/* Book Info */}
      <div className="p-4">
        <h3 className="font-bold text-brown-800 text-lg truncate" title={title}>
          {title}
        </h3>
        <p className="text-brown-600 text-sm mb-2" title={`By ${author}`}>
          By {author}
        </p>
        <p className="text-xs text-gray-500 mb-3">
          Owned by <span className="font-medium">{owner.username}</span>
        </p>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex gap-2">
            <button 
              onClick={handleSwapRequest}
              className="bg-teal-600 hover:bg-teal-700 text-white text-sm py-1 px-3 rounded"
            >
              {isAuthenticated ? 'Swap' : 'Sign Up to Swap'}
            </button>
            <button 
              className="border border-brown-800 text-brown-800 hover:bg-brown-800 hover:text-white text-sm py-1 px-3 rounded"
            >
              Details
            </button>
          </div>
          
          <button 
            onClick={handleBookmarkToggle}
            className={`flex items-center justify-center w-8 h-8 rounded-full ${
              isBookmarked ? 'text-amber-500' : 'text-gray-400 hover:text-amber-500'
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 4a2 2 0 012-2h6a2 2 0 012 2v14l-5-2.5L5 18V4z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}