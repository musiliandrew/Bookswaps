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
  const [showSpoiler, setShowSpoiler] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getPostTypeColor = (type) => {
    switch (type) {
      case 'Article': return 'from-primary to-primary/80';
      case 'Synopsis': return 'from-accent to-accent/80';
      case 'Query': return 'from-primary/70 to-accent/70';
      case 'Debate': return 'from-error to-error/80';
      default: return 'from-primary/50 to-accent/50';
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
      className="bookish-glass rounded-2xl border border-white/20 hover:border-white/30 transition-all duration-300 overflow-hidden bookish-shadow"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.01 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
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
                  {post.user?.username || 'Anonymous'}
                </span>
                <span className="text-primary/40">•</span>
                <span className="text-sm text-primary/60 flex items-center space-x-1 font-open-sans">
                  <ClockIcon className="w-3 h-3" />
                  <span>
                    {post.created_at && !isNaN(new Date(post.created_at).getTime())
                      ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
                      : 'Recently'
                    }
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

        {/* Book Context (if available) */}
        {post.book && (post.book_context?.chapter || post.book_context?.page_range || post.book_context?.quote) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-4 p-3 bg-accent/10 border border-accent/20 rounded-xl"
          >
            <div className="flex items-start space-x-2">
              <MapPinIcon className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 text-xs text-accent font-medium mb-1">
                  {post.book_context.chapter && (
                    <span>📖 {post.book_context.chapter}</span>
                  )}
                  {post.book_context.page_range && (
                    <span>📄 {post.book_context.page_range}</span>
                  )}
                </div>
                {post.book_context.quote && (
                  <div className="bg-white/50 rounded-lg p-2 mt-2">
                    <div className="flex items-start space-x-2">
                      <ChatBubbleBottomCenterTextIcon className="w-3 h-3 text-accent mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-primary/80 italic font-open-sans">
                        "{post.book_context.quote}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

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
            <p className="whitespace-pre-wrap">
              {showFullContent ? post.content : truncateContent(post.content)}
              {!showFullContent && post.content?.length > 200 && (
                <Link
                  to={`/socials/discussions/post/${post.discussion_id}`}
                  className="text-accent hover:text-accent/80 ml-2 font-medium"
                >
                  Read more
                </Link>
              )}
            </p>
          )}
        </div>

        {/* Enhanced Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.slice(0, 5).map((tag, index) => {
              // Determine tag type for styling
              const isThemeTag = ['Love', 'Friendship', 'Betrayal', 'Redemption', 'Coming of Age', 'Good vs Evil', 'Identity', 'Family', 'Power', 'Justice', 'Sacrifice'].includes(tag);
              const isCharacterTag = ['Protagonist', 'Antagonist', 'Supporting Cast', 'Character Development', 'Relationships', 'Motivations', 'Backstory', 'Character Arc'].includes(tag);
              const isStyleTag = ['Writing Style', 'Pacing', 'Dialogue', 'World Building', 'Plot Twist', 'Narrative Structure', 'Point of View', 'Symbolism', 'Foreshadowing'].includes(tag);

              return (
                <span
                  key={index}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-colors cursor-pointer font-open-sans ${
                    isThemeTag ? 'bg-primary/20 text-primary hover:bg-primary/30' :
                    isCharacterTag ? 'bg-accent/20 text-accent hover:bg-accent/30' :
                    isStyleTag ? 'bg-success/20 text-success hover:bg-success/30' :
                    'bg-white/50 text-primary/70 hover:bg-white/70'
                  }`}
                >
                  {isThemeTag ? '🧵' : isCharacterTag ? '🧍' : isStyleTag ? '✍️' : '#'} {tag}
                </span>
              );
            })}
            {post.tags.length > 5 && (
              <span className="px-3 py-1 text-xs text-primary/60 font-open-sans">
                +{post.tags.length - 5} more
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
