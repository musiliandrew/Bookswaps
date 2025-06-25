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
      <div className="min-h-screen font-open-sans text-text bookish-gradient flex items-center justify-center">
        <motion.div
          className="text-center bookish-glass rounded-2xl p-8 border border-white/20"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-error/20 to-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-lora font-semibold text-primary mb-2">Something went wrong</h2>
          <p className="text-primary/70 mb-6">{error}</p>
          <button
            onClick={() => listPosts(filters, 1)}
            className="bookish-button-enhanced text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-open-sans text-text bookish-gradient relative">
      {/* Floating Elements Background */}
      <div className="floating-elements absolute inset-0 pointer-events-none" />

      {/* Enhanced Header Section */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-lora font-bold text-gradient mb-4 relative">
              💬 Discussions
              <motion.div
                className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full opacity-20"
                animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 3, repeat: Infinity }}
              />
            </h1>
            <motion.p
              className="font-open-sans text-primary/80 text-lg max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Share your thoughts, discover new books, and connect with fellow readers
            </motion.p>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
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
    </div>
  );
};

export default EnhancedDiscussionsPage;
