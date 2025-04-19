import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';

/**
 * PostCard component for displaying posts in the discussion feed
 * 
 * @param {Object} postData - Data for the post
 * @param {string} postData.id - Unique identifier for the post
 * @param {string} postData.title - Title of the post
 * @param {string} postData.content - Content of the post
 * @param {Object} postData.author - Author information
 * @param {string} postData.author.id - Author's ID
 * @param {string} postData.author.username - Author's username
 * @param {string} postData.author.avatar - URL to author's avatar
 * @param {number} postData.admireCount - Number of admires
 * @param {number} postData.commentCount - Number of comments
 * @param {Date} postData.timestamp - When the post was created
 * @param {Object} [postData.book] - Optional book information
 * @param {string[]} [postData.genres] - Optional genres
 */
const PostCard = ({ postData = mockPostData }) => {
  const [isAdmired, setIsAdmired] = useState(false);
  const [admireCount, setAdmireCount] = useState(postData.admireCount);
  const [showFullContent, setShowFullContent] = useState(false);
  
  // Format timestamp to relative time (e.g., "5 minutes ago")
  const formattedTime = formatDistanceToNow(new Date(postData.timestamp), { addSuffix: true });
  
  // Toggle admire status
  const handleAdmire = () => {
    if (isAdmired) {
      setAdmireCount(admireCount - 1);
    } else {
      setAdmireCount(admireCount + 1);
    }
    setIsAdmired(!isAdmired);
  };
  
  // Handle lending request
  const handleLend = () => {
    // In a real implementation, this would open a chat or lending request modal
    alert(`Lending request for book "${postData.book?.title}" sent to ${postData.author.username}`);
  };
  
  // Handle comment action
  const handleComment = () => {
    // In a real implementation, this would focus a comment input or navigate to comments
    window.location.href = `/discussions/${postData.id}#comments`;
  };

  // Determine if content should be truncated
  const shouldTruncate = postData.content.length > 300 && !showFullContent;
  const displayContent = shouldTruncate 
    ? `${postData.content.substring(0, 300)}...` 
    : postData.content;

  return (
    <div className="bg-white rounded-lg shadow-md p-5 mb-6">
      {/* Post Header */}
      <div className="flex items-center mb-3">
        <a href={`/profile/${postData.author.id}`} className="flex items-center group">
          <img 
            src={postData.author.avatar} 
            alt={postData.author.username}
            className="w-10 h-10 rounded-full mr-3"
          />
          <span className="font-medium text-brown-800 group-hover:text-teal-600">
            {postData.author.username}
          </span>
        </a>
        <span className="ml-auto text-sm text-gray-500">{formattedTime}</span>
      </div>
      
      {/* Post Title */}
      <h3 className="text-xl font-semibold text-brown-800 mb-2">{postData.title}</h3>
      
      {/* Post Content */}
      <div className="text-gray-700 mb-4">
        <p>{displayContent}</p>
        {shouldTruncate && (
          <button 
            onClick={() => setShowFullContent(true)}
            className="text-teal-600 hover:text-teal-700 font-medium mt-1"
          >
            Read more
          </button>
        )}
      </div>
      
      {/* Book Tag and Genres (if available) */}
      {postData.book && (
        <div className="mb-4">
          <a 
            href={`/books/${postData.book.id}`}
            className="inline-flex items-center bg-teal-50 text-teal-700 rounded-full px-3 py-1 text-sm hover:bg-teal-100"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
            </svg>
            {postData.book.title}
          </a>
          
          {postData.genres && postData.genres.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {postData.genres.map((genre, index) => (
                <span 
                  key={index}
                  className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Engagement Metrics */}
      <div className="flex items-center text-sm text-gray-500 mb-4">
        <div className="flex items-center mr-4">
          <svg className="w-4 h-4 mr-1" fill={isAdmired ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
          <span>{admireCount} Admires</span>
        </div>
        <div className="flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          <span>{postData.commentCount} Comments</span>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="flex border-t pt-4">
        <button 
          onClick={handleAdmire}
          className={`flex items-center justify-center flex-1 py-2 rounded-md mr-2 ${
            isAdmired 
              ? 'bg-teal-100 text-teal-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <svg className="w-5 h-5 mr-1" fill={isAdmired ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
          </svg>
          Admire
        </button>
        
        {postData.book && (
          <button 
            onClick={handleLend}
            className="flex items-center justify-center flex-1 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md mr-2"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
            </svg>
            Lend
          </button>
        )}
        
        <button 
          onClick={handleComment}
          className="flex items-center justify-center flex-1 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          Comment
        </button>
      </div>
    </div>
  );
};

// Mock data for demonstration
// eslint-disable-next-line react-refresh/only-export-components
export const mockPostData = {
  id: 'post-123',
  title: 'Just finished "The Midnight Library" and it blew me away!',
  content: 'This book made me reflect on all the different paths our lives could take. Matt Haig has a way of making you feel so connected to the characters. The concept of a library containing books of all your possible lives is just brilliant. Has anyone else read it? I\'d love to discuss the ending and what you thought about Nora\'s final choice.',
  author: {
    id: 'user-456',
    username: 'bookworm42',
    avatar: 'https://i.pravatar.cc/150?img=32'
  },
  admireCount: 24,
  commentCount: 7,
  timestamp: new Date(Date.now() - 3600000 * 5), // 5 hours ago
  book: {
    id: 'book-789',
    title: 'The Midnight Library'
  },
  genres: ['Fiction', 'Fantasy', 'Contemporary']
};

export default PostCard;