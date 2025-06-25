import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon, 
  FunnelIcon, 
  MagnifyingGlassIcon,
  SparklesIcon,
  FireIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import EnhancedPostCard from './EnhancedPostCard';
import PostCreationModal from './PostCreationModal';

const EnhancedPostFeed = ({ 
  posts, 
  isLoading, 
  onCreatePost, 
  onUpvote, 
  onDownvote, 
  onReprint,
  onBookmark,
  onLoadMore,
  hasMore,
  filters,
  onFiltersChange
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [activeFilter, setActiveFilter] = useState('all');

  const sortOptions = [
    { value: 'recent', label: 'Recent', icon: ClockIcon },
    { value: 'popular', label: 'Popular', icon: FireIcon },
    { value: 'trending', label: 'Trending', icon: SparklesIcon },
  ];

  const filterOptions = [
    { value: 'all', label: 'All Posts', count: posts?.length || 0 },
    { value: 'Article', label: 'Articles', count: posts?.filter(p => p.type === 'Article').length || 0 },
    { value: 'Synopsis', label: 'Reviews', count: posts?.filter(p => p.type === 'Synopsis').length || 0 },
    { value: 'Query', label: 'Questions', count: posts?.filter(p => p.type === 'Query').length || 0 },
  ];

  const handleCreatePost = async (postData) => {
    const success = await onCreatePost(postData);
    return success;
  };

  const filteredPosts = posts?.filter(post => {
    const matchesSearch = !searchQuery || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.user?.username.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter === 'all' || post.type === activeFilter;
    
    return matchesSearch && matchesFilter;
  }) || [];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Enhanced Controls Section */}
      <motion.div
        className="bookish-glass rounded-2xl border border-white/20 p-6 mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl">
              <span className="text-2xl">💬</span>
            </div>
            <div>
              <h2 className="text-xl font-lora font-semibold text-primary mb-1">Community Discussions</h2>
              <p className="text-primary/70 text-sm">Join the conversation with fellow book lovers</p>
            </div>
          </div>

          {/* Create Post Button */}
          <motion.button
            onClick={() => setIsCreateModalOpen(true)}
            className="bookish-button-enhanced text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center space-x-2"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <PlusIcon className="w-5 h-5" />
            <span>Create Post</span>
          </motion.button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search discussions..."
            className="bookish-input w-full pl-12 pr-4 py-4 rounded-xl text-primary placeholder-primary/50 font-open-sans"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          {/* Filter Tabs */}
          <div className="flex space-x-1 bg-white/50 rounded-xl p-1 backdrop-blur-sm border border-white/20">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setActiveFilter(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium font-open-sans transition-all ${
                  activeFilter === option.value
                    ? 'bg-primary text-white shadow-sm'
                    : 'text-primary/70 hover:text-primary hover:bg-white/50'
                }`}
              >
                {option.label}
                {option.count > 0 && (
                  <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    activeFilter === option.value
                      ? 'bg-white/20 text-white'
                      : 'bg-primary/10 text-primary'
                  }`}>
                    {option.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-3">
            <FunnelIcon className="w-4 h-4 text-primary/50" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bookish-input border-0 rounded-lg px-3 py-2 text-sm font-open-sans text-primary bg-white/50 backdrop-blur-sm"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {isLoading && posts?.length === 0 ? (
          // Loading skeleton
          <div className="space-y-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bookish-glass rounded-2xl border border-white/20 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 loading-skeleton rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 loading-skeleton rounded w-24"></div>
                    <div className="h-3 loading-skeleton rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-6 loading-skeleton rounded w-3/4"></div>
                  <div className="h-4 loading-skeleton rounded w-full"></div>
                  <div className="h-4 loading-skeleton rounded w-2/3"></div>
                </div>
                <div className="flex space-x-4 mt-4">
                  <div className="h-8 loading-skeleton rounded w-16"></div>
                  <div className="h-8 loading-skeleton rounded w-16"></div>
                  <div className="h-8 loading-skeleton rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length > 0 ? (
          <>
            <AnimatePresence>
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.discussion_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <EnhancedPostCard
                    post={post}
                    onUpvote={onUpvote}
                    onDownvote={onDownvote}
                    onReprint={onReprint}
                    onBookmark={onBookmark}
                    // You can add user interaction states here
                    // isUpvoted={userInteractions[post.discussion_id]?.upvoted}
                    // isDownvoted={userInteractions[post.discussion_id]?.downvoted}
                    // isBookmarked={userInteractions[post.discussion_id]?.bookmarked}
                  />
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center pt-8">
                <motion.button
                  onClick={onLoadMore}
                  disabled={isLoading}
                  className="px-8 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    'Load More Posts'
                  )}
                </motion.button>
              </div>
            )}
          </>
        ) : (
          // Empty state
          <motion.div
            className="bookish-glass rounded-2xl border border-white/20 text-center py-16"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-16 h-16 bg-gradient-to-br from-accent/20 to-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <SparklesIcon className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-lora font-semibold text-primary mb-3">No posts found</h3>
            <p className="text-primary/70 mb-8 font-open-sans max-w-md mx-auto">
              {searchQuery || activeFilter !== 'all'
                ? 'Try adjusting your search or filters to discover more discussions'
                : 'Be the first to start a meaningful conversation with the community!'
              }
            </p>
            <motion.button
              onClick={() => setIsCreateModalOpen(true)}
              className="bookish-button-enhanced text-white px-8 py-3 rounded-xl font-medium transition-all duration-300"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              Create First Post
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Post Creation Modal */}
      <PostCreationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreatePost={handleCreatePost}
        isLoading={isLoading}
      />
    </div>
  );
};

export default EnhancedPostFeed;
