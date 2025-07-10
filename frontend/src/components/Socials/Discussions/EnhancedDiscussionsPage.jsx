import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDiscussions } from '../../../hooks/useDiscussions';
import { toast } from 'react-toastify';
import EnhancedPostFeed from './EnhancedPostFeed';
import QuickCreateButton from './QuickCreateButton';
import PostCreationModal from './PostCreationModal';
import EchoModal from './EchoModal';

const EnhancedDiscussionsPage = () => {
  const {
    createDiscussion,
    listPosts,
    agreeWithDiscussionPost,
    disagreeWithDiscussionPost,
    reprintDiscussionPost,
    bookmarkDiscussionPost,
    posts,
    isLoading,
    error,
    pagination
  } = useDiscussions();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEchoModalOpen, setIsEchoModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
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



  const handleEcho = async (postId, data = { comment: '' }) => {
    try {
      await reprintDiscussionPost(postId, data);
      toast.success('Post echoed successfully! 📢');
      setIsEchoModalOpen(false);
      setSelectedPost(null);
      // Refresh posts to show the echo
      await listPosts(filters, 1);
    } catch (error) {
      console.error('Error echoing post:', error);
      toast.error('Failed to echo post');
    }
  };

  const handleOpenEchoModal = (post) => {
    setSelectedPost(post);
    setIsEchoModalOpen(true);
  };

  const handleAgree = async (postId) => {
    try {
      await agreeWithDiscussionPost(postId);
    } catch (error) {
      console.error('Error agreeing with post:', error);
      toast.error('Failed to agree with post');
    }
  };

  const handleDisagree = async (postId) => {
    try {
      await disagreeWithDiscussionPost(postId);
    } catch (error) {
      console.error('Error disagreeing with post:', error);
      toast.error('Failed to disagree with post');
    }
  };

  const handleBookmark = async (postId) => {
    try {
      await bookmarkDiscussionPost(postId);
    } catch (error) {
      console.error('Error bookmarking post:', error);
      toast.error('Failed to bookmark post');
    }
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
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <EnhancedPostFeed
              posts={posts}
              isLoading={isLoading}
              onCreatePost={handleCreatePost}
              onAgree={handleAgree}
              onDisagree={handleDisagree}
              onReprint={handleOpenEchoModal}
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

      {/* Echo Modal */}
      <EchoModal
        isOpen={isEchoModalOpen}
        onClose={() => {
          setIsEchoModalOpen(false);
          setSelectedPost(null);
        }}
        onEcho={handleEcho}
        post={selectedPost}
        isLoading={isLoading}
      />
    </div>
  );
};

export default EnhancedDiscussionsPage;
