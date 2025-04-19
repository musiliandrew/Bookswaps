import React, { useState, useEffect } from 'react';

/**
 * CommentSection component for displaying and adding comments to a post
 * 
 * @param {Object} props - Component props
 * @param {string} props.postId - ID of the post to display comments for
 * @param {boolean} [props.isExpanded=false] - Whether the comments section is expanded by default
 */
const CommentSection = ({ postId, isExpanded = false }) => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [expanded, setExpanded] = useState(isExpanded);
  const [submitting, setSubmitting] = useState(false);

  // Fetch comments when component mounts or postId changes
  useEffect(() => {
    if (expanded) {
      fetchComments();
    }
  }, [postId, expanded]);

  // Simulated API call to fetch comments
  const fetchComments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real app, this would be a fetch call to your API
      // await fetch(`/api/discussions/${postId}/comments/`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Use mock data
      setComments(mockComments);
      setIsLoading(false);
    } catch {
      setError('Failed to load comments. Please try again.');
      setIsLoading(false);
    }
  };

  // Simulated API call to post a new comment
  const submitComment = async (e) => {
    e.preventDefault();
    
    if (!newComment.trim()) return;
    
    setSubmitting(true);
    
    try {
      // In a real app, this would be a POST request to your API
      // await fetch(`/api/discussions/${postId}/comments/`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ content: newComment })
      // });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Create a mock new comment
      const currentUser = {
        id: 'current-user',
        username: 'currentUser',
        avatar: 'https://i.pravatar.cc/150?img=12'
      };
      
      const newCommentObj = {
        id: `comment-${Date.now()}`,
        content: newComment,
        author: currentUser,
        timestamp: new Date(),
        likes: 0
      };
      
      // Add the new comment to the list
      setComments([newCommentObj, ...comments]);
      setNewComment('');
      setSubmitting(false);
    } catch {
      setError('Failed to post your comment. Please try again.');
      setSubmitting(false);
    }
  };

  // Format timestamp to relative time
  const formatTimeAgo = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} min ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  if (!expanded) {
    return (
      <button 
        onClick={() => setExpanded(true)}
        className="w-full py-2 text-center text-gray-600 hover:text-teal-600 transition-colors"
      >
        Show comments ({comments.length || '...'})
      </button>
    );
  }

  return (
    <div className="mt-4 border-t pt-4">
      {/* Comment Form */}
      <form onSubmit={submitComment} className="mb-6">
        <div className="flex">
          <img 
            src="https://i.pravatar.cc/150?img=12" 
            alt="Your avatar" 
            className="w-10 h-10 rounded-full mr-3"
          />
          <div className="flex-grow">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
              rows="2"
            />
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="px-4 py-2 mr-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!newComment.trim() || submitting}
                className={`px-4 py-2 rounded-md bg-teal-600 text-white ${
                  !newComment.trim() || submitting 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'hover:bg-teal-700'
                }`}
              >
                {submitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-4">{error}</div>
        ) : comments.length === 0 ? (
          <div className="text-center text-gray-500 py-4">No comments yet. Be the first to comment!</div>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="flex">
              <a href={`/profile/${comment.author.id}`} className="flex-shrink-0">
                <img 
                  src={comment.author.avatar} 
                  alt={comment.author.username} 
                  className="w-8 h-8 rounded-full mr-3"
                />
              </a>
              <div className="flex-grow bg-gray-50 rounded-lg px-4 py-3">
                <div className="flex items-center mb-1">
                  <a 
                    href={`/profile/${comment.author.id}`}
                    className="font-medium text-brown-800 hover:text-teal-600 mr-2"
                  >
                    {comment.author.username}
                  </a>
                  <span className="text-xs text-gray-500">
                    {formatTimeAgo(comment.timestamp)}
                  </span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
                <div className="mt-2 flex items-center text-sm">
                  <button className="text-gray-500 hover:text-teal-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
                    </svg>
                    {comment.likes}
                  </button>
                  <button className="ml-4 text-gray-500 hover:text-teal-600">Reply</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Show More Button - would be used with pagination in a real app */}
      {comments.length > 5 && (
        <button 
          className="w-full py-2 mt-4 text-center text-teal-600 hover:text-teal-700 transition-colors"
        >
          Show more comments
        </button>
      )}
    </div>
  );
};

// Mock comments data for demonstration
const mockComments = [
  {
    id: 'comment-1',
    content: "I loved The Midnight Library too! The concept really makes you think about regrets and choices. Nora's journey through all those different lives was so compelling.",
    author: {
      id: 'user-789',
      username: 'literaryfan',
      avatar: 'https://i.pravatar.cc/150?img=23'
    },
    timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
    likes: 3
  },
  {
    id: 'comment-2',
    content: "Just finished it last week. The ending was perfect - not what I expected but exactly what the story needed. Would you recommend any other books by Matt Haig?",
    author: {
      id: 'user-456',
      username: 'bookworm42',
      avatar: 'https://i.pravatar.cc/150?img=32'
    },
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    likes: 5
  },
  {
    id: 'comment-3',
    content: "If you enjoyed Midnight Library, I'd recommend 'How To Stop Time' also by Matt Haig. It has similar themes about life and time but with a very different approach.",
    author: {
      id: 'user-101',
      username: 'readingaddict',
      avatar: 'https://i.pravatar.cc/150?img=45'
    },
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    likes: 8
  }
];

export default CommentSection;