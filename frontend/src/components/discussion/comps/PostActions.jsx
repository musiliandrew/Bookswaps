import React, { useState } from 'react';

/**
 * PostActions component for handling post interactions (Admire and Lend/Share)
 * 
 * @param {Object} props - Component props
 * @param {string} props.postId - ID of the post
 * @param {boolean} props.isAdmired - Whether the current user has admired this post
 * @param {number} props.admireCount - Number of admires on this post
 * @param {Object} [props.bookData] - Optional book data if this post is related to a book
 * @param {string} [props.bookData.title] - Title of the book
 * @param {string} [props.bookData.author] - Author of the book
 * @param {string} [props.postTitle] - Title of the post for sharing
 */
const PostActions = ({ postId, isAdmired: initialIsAdmired, admireCount: initialAdmireCount, bookData, postTitle }) => {
  // Local state for admire status and count
  const [isAdmired, setIsAdmired] = useState(initialIsAdmired);
  const [admireCount, setAdmireCount] = useState(initialAdmireCount);
  const [isAdmiring, setIsAdmiring] = useState(false);
  const [error, setError] = useState(null);

  // Handle admire toggle
  const handleAdmire = async () => {
    setIsAdmiring(true);
    setError(null);

    try {
      // In a real implementation, this would be a fetch call to your API
      // const response = await fetch(`/api/discussions/${postId}/admire/`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ admired: !isAdmired }),
      // });
      
      // if (!response.ok) throw new Error('Failed to update admire status');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Update local state
      setAdmireCount(prevCount => isAdmired ? prevCount - 1 : prevCount + 1);
      setIsAdmired(!isAdmired);
    } catch (err) {
      setError('Unable to update admire status. Please try again.');
      console.error('Error admiring post:', err);
    } finally {
      setIsAdmiring(false);
    }
  };

  // Handle lend (Twitter share)
  const handleLend = () => {
    const baseUrl = 'https://twitter.com/intent/tweet';
    
    // Create the tweet text based on available data
    let tweetText = 'Check out this book on BookSwap!';
    
    if (bookData) {
      tweetText = `I want to share "${bookData.title}"${bookData.author ? ` by ${bookData.author}` : ''} on BookSwap!`;
    } else if (postTitle) {
      tweetText = `Check out this discussion: "${postTitle}" on BookSwap!`;
    }
    
    // The URL to your post
    const shareUrl = `https://bookswap.example.com/discussions/${postId}`;
    
    // Construct the Twitter intent URL
    const twitterUrl = `${baseUrl}?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(shareUrl)}&hashtags=BookSwap,books,reading`;
    
    // Open Twitter intent in a new window
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  return (
    <div className="flex border-t pt-4">
      {/* Admire Button */}
      <button 
        onClick={handleAdmire}
        disabled={isAdmiring}
        className={`flex items-center justify-center flex-1 py-2 rounded-md mr-2 ${
          isAdmired 
            ? 'bg-teal-100 text-teal-700' 
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        } ${isAdmiring ? 'opacity-70 cursor-wait' : ''}`}
      >
        {isAdmiring ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-teal-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg className="w-5 h-5 mr-1" fill={isAdmired ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
        )}
        <span>{isAdmiring ? 'Updating...' : `Admire${admireCount > 0 ? ` (${admireCount})` : ''}`}</span>
      </button>
      
      {/* Lend Button (Twitter share) */}
      <button 
        onClick={handleLend}
        className="flex items-center justify-center flex-1 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md"
      >
        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path>
        </svg>
        Lend
      </button>
      
      {/* Error message */}
      {error && (
        <div className="absolute -bottom-6 left-0 right-0 text-center text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default PostActions;