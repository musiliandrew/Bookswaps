import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  FireIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import EnhancedPostCard from './EnhancedPostCard';
import EchoFeedItem from './EchoFeedItem';
import NoteAsPost from './NoteAsPost';
import MobileFilterDropdown from './MobileFilterDropdown';

const EnhancedPostFeed = ({
  posts,
  isLoading,
  onCreatePost,
  onAgree,
  onDisagree,
  onReprint,
  onBookmark,
  onLoadMore,
  hasMore,
  filters,
  onFiltersChange
}) => {

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



  const filteredPosts = posts?.filter(post => {
    const matchesSearch = !searchQuery ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.user?.username.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter = activeFilter === 'all' || post.type === activeFilter;

    return matchesSearch && matchesFilter;
  }) || [];

  // Function to render different post types - Twitter style
  const renderPostItem = (post, index) => {
    // Check if this is an echoed post (has echo attribution)
    if (post.item_type === 'echo') {
      return (
        <EchoFeedItem
          key={`echo-${post.reprint_id}`}
          echo={post}
          originalPost={post.original_post}
          onAgree={onAgree}
          onDisagree={onDisagree}
          onReprint={onReprint}
          onBookmark={onBookmark}
          currentUser={null} // TODO: Get current user from context
        />
      );
    }

    // Check if this is a note/comment appearing as independent post
    if (post.item_type === 'note') {
      return (
        <NoteAsPost
          key={`note-${post.note_id}`}
          note={post}
          originalPost={post.original_post}
          onAgree={onAgree}
          onDisagree={onDisagree}
          onEcho={onReprint}
          onShare={onBookmark} // Reuse bookmark handler for share
          onReply={() => {}} // TODO: Handle note replies
          currentUser={null} // TODO: Get current user from context
        />
      );
    }

    // Regular post
    return (
      <EnhancedPostCard
        key={post.discussion_id}
        post={post}
        onAgree={onAgree}
        onDisagree={onDisagree}
        onReprint={onReprint}
        onBookmark={onBookmark}
        isAgreed={post.is_upvoted}
        isDisagreed={post.is_downvoted}
        isBookmarked={post.is_bookmarked || false}
      />
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Enhanced Controls Section */}
      <motion.div
        className="card rounded-2xl border border-white/20 p-6 mb-8 mobile-discussion-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Section - Mobile Optimized */}
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="p-2 sm:p-3 bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg sm:rounded-xl">
            <span className="text-lg sm:text-2xl">💬</span>
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-lora font-semibold text-primary mb-0 sm:mb-1">Community Discussions</h2>
            <p className="text-primary/70 text-xs sm:text-sm hidden sm:block">Join the conversation with fellow book lovers</p>
          </div>
        </div>

        {/* Search Bar - Mobile Optimized */}
        <div className="relative mb-4 sm:mb-6">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary/50 mobile-search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search discussions..."
            className="input w-full pl-12 pr-4 py-3 sm:py-4 rounded-xl text-primary placeholder-primary/50 font-open-sans mobile-form-input mobile-search-input"
          />
        </div>

        {/* Mobile-First Filter Navigation */}
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          {/* Mobile: Dropdown Filter */}
          <div className="block sm:hidden">
            <MobileFilterDropdown
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              filterOptions={filterOptions}
            />
          </div>

          {/* Desktop: Tab-style Filter */}
          <div className="hidden sm:flex sm:items-center sm:justify-between">
            <div className="flex justify-around gap-2 p-2 card rounded-2xl border border-white/20 backdrop-blur-xl">
              {filterOptions.map((option, index) => (
                <motion.button
                  key={option.value}
                  onClick={() => setActiveFilter(option.value)}
                  className="relative flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 font-medium"
                  style={{
                    color: activeFilter === option.value ? 'white' : 'var(--primary)',
                    background: activeFilter === option.value
                      ? 'linear-gradient(135deg, var(--primary), var(--accent))'
                      : 'transparent',
                    boxShadow: activeFilter === option.value ? '0 10px 25px rgba(0,0,0,0.15)' : 'none',
                    opacity: activeFilter === option.value ? 1 : 0.7
                  }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  title={option.label}
                >
                  <div className="relative z-10 flex items-center gap-3">
                    <span className="text-sm font-semibold">{option.label}</span>
                    {option.count > 0 && (
                      <span className={`px-2 py-0.5 text-xs rounded-full transition-all duration-300 ${
                        activeFilter === option.value
                          ? 'bg-[var(--bg-card)]/20 text-white'
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {option.count}
                      </span>
                    )}
                  </div>

                  {/* Active indicator sparkle */}
                  {activeFilter === option.value && (
                    <motion.div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <SparklesIcon className="w-2 h-2 text-white m-0.5" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>

            {/* Sort Options - Desktop Only */}
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="card border border-white/20 rounded-xl px-4 py-3 text-sm font-medium text-primary bg-transparent backdrop-blur-xl appearance-none cursor-pointer min-w-[120px] focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value} className="bg-[var(--bg-card)] text-primary">
                    {option.label}
                  </option>
                ))}
              </select>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Posts Feed - Mobile Optimized */}
      <div className="space-y-4 sm:space-y-6 mobile-post-feed mobile-scroll-container">
        {isLoading && posts?.length === 0 ? (
          // Loading skeleton
          <div className="space-y-6">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="card rounded-2xl border border-white/20 p-6">
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
                    key={post.item_type === 'echo' ? `echo-${post.reprint_id}` : post.discussion_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    {renderPostItem(post, index)}
                  </motion.div>
                ))}
            </AnimatePresence>

            {/* Load More Button */}
            {hasMore && (
              <div className="text-center pt-8">
                <motion.button
                  onClick={onLoadMore}
                  disabled={isLoading}
                  className="px-8 py-3 bg-[var(--bg-card)] border border-gray-200 text-gray-700 rounded-xl hover:bg-[var(--bg-primary)] transition-all disabled:opacity-50"
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
            className="card rounded-2xl border border-white/20 text-center py-16"
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
            <p className="text-primary/50 text-sm font-open-sans">
              Use the + button to create your first post!
            </p>
          </motion.div>
        )}
      </div>


    </div>
  );
};

export default EnhancedPostFeed;
