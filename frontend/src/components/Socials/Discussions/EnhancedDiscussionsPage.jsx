import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDiscussions } from '../../../hooks/useDiscussions';
import { toast } from 'react-toastify';
import EnhancedPostFeed from './EnhancedPostFeed';
import QuickCreateButton from './QuickCreateButton';
import PostCreationModal from './PostCreationModal';

const EnhancedDiscussionsPage = () => {
  const {
    createDiscussion,
    listPosts,
    upvoteDiscussionPost,
    downvoteDiscussionPost,
    reprintDiscussionPost,
    posts,
    isLoading,
    error,
    pagination
  } = useDiscussions();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedPostType, setSelectedPostType] = useState('Article');
  const [filters, setFilters] = useState({
    type: '',
    book_id: '',
    tag: '',
    search: ''
  });

  // Load posts on component mount
  useEffect(() => {
    listPosts(filters, 1);
  }, [listPosts, filters]);

  const handleCreatePost = async (postData) => {
    try {
      const response = await createDiscussion(postData);
      if (response) {
        // Refresh the posts list
        await listPosts(filters, 1);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
      return false;
    }
  };

  const handleUpvote = async (postId) => {
    try {
      await upvoteDiscussionPost(postId);
      // Optionally refresh posts or update local state
    } catch (error) {
      console.error('Error upvoting post:', error);
      toast.error('Failed to upvote post');
    }
  };

  const handleDownvote = async (postId) => {
    try {
      await downvoteDiscussionPost(postId);
      // Optionally refresh posts or update local state
    } catch (error) {
      console.error('Error downvoting post:', error);
      toast.error('Failed to downvote post');
    }
  };

  const handleReprint = async (postId, data = { comment: '' }) => {
    try {
      await reprintDiscussionPost(postId, data);
      toast.success('Post reprinted successfully!');
    } catch (error) {
      console.error('Error reprinting post:', error);
      toast.error('Failed to reprint post');
    }
  };

  const handleBookmark = async (postId) => {
    // Implement bookmark logic
    console.log('Bookmarking post:', postId);
    toast.info('Bookmark feature coming soon!');
  };

  const handleLoadMore = async () => {
    if (pagination?.posts?.next) {
      const nextPage = pagination.posts.page + 1;
      await listPosts(filters, nextPage);
    }
  };

  const handleFiltersChange = async (newFilters) => {
    setFilters(newFilters);
    await listPosts(newFilters, 1);
  };

  const handleQuickCreate = (postType) => {
    setSelectedPostType(postType);
    setIsCreateModalOpen(true);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => listPosts(filters, 1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 pointer-events-none" />
      
      {/* Main Content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <EnhancedPostFeed
              posts={posts}
              isLoading={isLoading}
              onCreatePost={handleCreatePost}
              onUpvote={handleUpvote}
              onDownvote={handleDownvote}
              onReprint={handleReprint}
              onBookmark={handleBookmark}
              onLoadMore={handleLoadMore}
              hasMore={pagination?.posts?.next}
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />
          </motion.div>
        </div>
      </div>

      {/* Quick Create Button */}
      <QuickCreateButton
        onOpenModal={handleQuickCreate}
      />

      {/* Post Creation Modal */}
      <PostCreationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreatePost={handleCreatePost}
        isLoading={isLoading}
        initialPostType={selectedPostType}
      />

      {/* Custom Styles */}
      <style jsx>{`
        .container {
          max-width: 1200px;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f5f9;
        }
        
        ::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default EnhancedDiscussionsPage;
