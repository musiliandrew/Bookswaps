import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  EyeSlashIcon,
  ClockIcon,
  UserIcon,
  TagIcon,
  BookOpenIcon,
  MapPinIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../../contexts/AuthContext';
import EnhancedReactionBar from './EnhancedReactionBar';

const EnhancedPostCard = ({
  post,
  onUpvote,
  onDownvote,
  onReprint,
  onBookmark,
  onReact,
  isUpvoted = false,
  isDownvoted = false,
  isBookmarked = false,
  showFullContent = false
}) => {
  const { user: currentUser } = useAuth();
  const [showSpoiler, setShowSpoiler] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [showBookContext, setShowBookContext] = useState(false);

  // Check if current user is the author
  const isOwnPost = currentUser && post.user && currentUser.user_id === post.user.user_id;

  // Check if post was created recently (within last 5 minutes)
  const isRecentPost = post.created_at &&
    (new Date() - new Date(post.created_at)) < 5 * 60 * 1000;



  const getPostTypeColor = (type) => {
    switch (type) {
      case 'Article': return 'from-blue-500 to-blue-600';
      case 'Synopsis': return 'from-orange-500 to-orange-600';
      case 'Query': return 'from-purple-500 to-purple-600';
      case 'Debate': return 'from-red-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getPostTypeIcon = (type) => {
    switch (type) {
      case 'Article': return '📝';
      case 'Synopsis': return '📖';
      case 'Query': return '❓';
      case 'Debate': return '⚖️';
      default: return '💭';
    }
  };

  const truncateContent = (content, maxLength = 200) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const handleReaction = async (action, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    switch (action) {
      case 'upvote':
        await onUpvote(post.discussion_id);
        break;
      case 'downvote':
        await onDownvote(post.discussion_id);
        break;
      case 'reprint':
        await onReprint(post.discussion_id, { comment: '' });
        break;
      case 'bookmark':
        await onBookmark(post.discussion_id);
        break;
    }
  };

  return (
    <motion.div
      className="bookish-glass rounded-2xl border border-white/20 hover:border-white/30 transition-all duration-300 overflow-hidden bookish-shadow group relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.01 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Enhanced Hover Tooltip for Book References */}
      {post.book && (
        <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto">
          <div className="bg-white/95 backdrop-blur-md border border-white/30 rounded-xl shadow-xl p-5 min-w-72 bookish-glass">
            <div className="space-y-3">
              {/* Book Title with Link */}
              <div className="border-b border-white/20 pb-3">
                <div className="flex items-start space-x-3">
                  <span className="text-accent text-lg">📚</span>
                  <div className="flex-1">
                    <Link
                      to={`/library/book/${post.book.book_id}`}
                      className="font-semibold text-primary hover:text-accent transition-colors cursor-pointer text-sm leading-tight"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {post.book.title}
                    </Link>
                    {post.book.author && (
                      <p className="text-xs text-primary/70 mt-1">by {post.book.author}</p>
                    )}
                    {post.book.genre && (
                      <p className="text-xs text-primary/60 mt-1">Genre: {post.book.genre}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Context Information */}
              {(post.book_context?.chapter || post.book_context?.page_range) && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-primary/80 uppercase tracking-wide">Discussion Context</h4>

                  {/* Chapter Reference */}
                  {post.book_context.chapter && (
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-accent">📖</span>
                      <span className="font-medium text-primary">{post.book_context.chapter}</span>
                    </div>
                  )}

                  {/* Page Reference */}
                  {post.book_context.page_range && (
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-accent">📄</span>
                      <span className="font-medium text-primary">{post.book_context.page_range}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Quote Section */}
              {post.book_context?.quote && (
                <div className="pt-3 border-t border-white/20">
                  <h4 className="text-xs font-semibold text-primary/80 uppercase tracking-wide mb-2">Referenced Quote</h4>
                  <div className="flex items-start space-x-2">
                    <ChatBubbleBottomCenterTextIcon className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-primary/80 italic font-open-sans leading-relaxed">
                      "{post.book_context.quote}"
                    </p>
                  </div>
                </div>
              )}

              {/* Action Hint */}
              <div className="pt-2 border-t border-white/20">
                <p className="text-xs text-primary/60 font-open-sans">
                  💡 Click book title to view in library
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* User Avatar */}
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              {post.user?.profile_picture ? (
                <img
                  src={post.user.profile_picture}
                  alt={post.user.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-5 h-5 text-white" />
              )}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold font-open-sans text-primary">
                  {isOwnPost ? (
                    <span className="flex items-center space-x-1">
                      <span>You</span>
                      {isRecentPost && (
                        <span className="text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                          posted
                        </span>
                      )}
                    </span>
                  ) : (
                    post.user?.username || 'Anonymous'
                  )}
                </span>
                <span className="text-primary/40">•</span>
                <span className="text-sm text-primary/60 flex items-center space-x-1 font-open-sans">
                  <ClockIcon className="w-3 h-3" />
                  <span>
                    {(() => {
                      if (!post.created_at) return 'Recently';
                      const date = new Date(post.created_at);
                      if (isNaN(date.getTime())) return 'Recently';
                      try {
                        return formatDistanceToNow(date, { addSuffix: true });
                      } catch (error) {
                        console.error('Date formatting error:', error, 'Date:', post.created_at);
                        return 'Recently';
                      }
                    })()}
                  </span>
                </span>
              </div>
              
              {/* Post Type Badge */}
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-3 py-1 text-xs font-medium font-open-sans text-white rounded-full bg-gradient-to-r ${getPostTypeColor(post.type)}`}>
                  {getPostTypeIcon(post.type)} {post.type}
                </span>
                {post.spoiler_flag && (
                  <span className="px-3 py-1 text-xs font-medium font-open-sans text-error bg-error/10 rounded-full flex items-center space-x-1">
                    <EyeSlashIcon className="w-3 h-3" />
                    <span>{post.spoiler_level || 'minor'} spoiler</span>
                  </span>
                )}
                {post.book && (
                  <span className="px-3 py-1 text-xs font-medium font-open-sans text-accent bg-accent/10 rounded-full flex items-center space-x-1">
                    <BookOpenIcon className="w-3 h-3" />
                    <span>{post.book.title}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Views */}
          <div className="text-sm text-primary/60 font-open-sans">
            {post.views || 0} views
          </div>
        </div>



        {/* Title */}
        <Link to={`/socials/discussions/post/${post.discussion_id}`}>
          <h2 className="text-xl font-lora font-bold text-primary mb-3 hover:text-accent transition-colors cursor-pointer">
            {post.title}
          </h2>
        </Link>

        {/* Content */}
        <div className="text-primary/80 leading-relaxed font-open-sans">
          {post.spoiler_flag && !showSpoiler ? (
            <div className="bg-error/5 border border-error/20 rounded-lg p-6 text-center">
              <EyeSlashIcon className="w-12 h-12 text-error/60 mx-auto mb-3" />
              <p className="text-error font-medium mb-2">⚠️ {post.spoiler_level || 'Minor'} Spoiler Warning</p>
              <p className="text-primary/70 mb-4 text-sm">This post contains plot spoilers. Proceed with caution!</p>
              <button
                onClick={() => setShowSpoiler(true)}
                className="px-6 py-2 bookish-button-enhanced text-white rounded-lg font-open-sans"
              >
                Show Content Anyway
              </button>
            </div>
          ) : (
            <>
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{
                  __html: showFullContent ? post.content : truncateContent(post.content)
                }}
              />
              {!showFullContent && post.content?.length > 200 && (
                <Link
                  to={`/socials/discussions/post/${post.discussion_id}`}
                  className="text-accent hover:text-accent/80 ml-2 font-medium inline-block mt-2"
                >
                  Read more
                </Link>
              )}
            </>
          )}
        </div>



        {/* Essential Tags Only */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {post.tags.slice(0, 4).map((tag, index) => {
              // Determine tag type for styling
              const isThemeTag = ['Love', 'Friendship', 'Betrayal', 'Redemption', 'Coming of Age', 'Good vs Evil', 'Identity', 'Family', 'Power', 'Justice', 'Sacrifice'].includes(tag);
              const isCharacterTag = ['Protagonist', 'Antagonist', 'Supporting Cast', 'Character Development', 'Relationships', 'Motivations', 'Backstory', 'Character Arc'].includes(tag);
              const isStyleTag = ['Writing Style', 'Pacing', 'Dialogue', 'World Building', 'Plot Twist', 'Narrative Structure', 'Point of View', 'Symbolism', 'Foreshadowing'].includes(tag);

              return (
                <span
                  key={index}
                  className={`px-2.5 py-1 text-xs font-medium rounded-full transition-all cursor-pointer font-open-sans ${
                    isThemeTag ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                    isCharacterTag ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' :
                    isStyleTag ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                    'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  title={tag}
                >
                  {isThemeTag ? '🧵' : isCharacterTag ? '🧍' : isStyleTag ? '✍️' : '#'} {tag}
                </span>
              );
            })}

            {post.tags.length > 4 && (
              <span className="px-2.5 py-1 text-xs text-gray-500 bg-gray-50 rounded-full font-open-sans">
                +{post.tags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Enhanced Reaction Bar */}
      <EnhancedReactionBar
        post={post}
        onUpvote={onUpvote}
        onDownvote={onDownvote}
        onReprint={onReprint}
        onBookmark={onBookmark}
        onReact={onReact}
        isUpvoted={isUpvoted}
        isDownvoted={isDownvoted}
        isBookmarked={isBookmarked}
        showComments={true}
      />
    </motion.div>
  );
};

export default EnhancedPostCard;
