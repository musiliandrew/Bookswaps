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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Discussions</h1>
            <p className="text-gray-600">Share thoughts, reviews, and connect with fellow readers</p>
          </div>
          
          {/* Create Post Button */}
          <motion.button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <PlusIcon className="w-5 h-5" />
            <span className="font-medium">Create Post</span>
          </motion.button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
          {/* Search Bar */}
          <div className="relative mb-4">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search discussions..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Filter Tabs */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setActiveFilter(option.value)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeFilter === option.value
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {option.label}
                  {option.count > 0 && (
                    <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                      activeFilter === option.value
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-200 text-gray-600'
                    }`}>
                      {option.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Sort Options */}
            <div className="flex items-center space-x-2">
              <FunnelIcon className="w-4 h-4 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        {isLoading && posts?.length === 0 ? (
          // Loading skeleton
          <div className="space-y-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
                <div className="flex space-x-4 mt-4">
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
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
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SparklesIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || activeFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Be the first to start a discussion!'
              }
            </p>
            <motion.button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Create First Post
            </motion.button>
          </div>
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
