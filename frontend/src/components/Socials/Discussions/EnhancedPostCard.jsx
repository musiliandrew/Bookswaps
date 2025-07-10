import React, { useState, useEffect } from 'react';
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
import { useDiscussions } from '../../../hooks/useDiscussions';
import EnhancedReactionBar from './EnhancedReactionBar';
import EnhancedCommentSection from './EnhancedCommentSection';
import SmartTextRenderer from '../../Common/SmartTextRenderer';
import PostContentPreview from './PostContentPreview';

const EnhancedPostCard = ({
  post,
  onAgree,
  onDisagree,
  onReprint,
  onBookmark,
  isAgreed = false,
  isDisagreed = false,
  isBookmarked = false,
  showFullContent = false,
  isEmbedded = false
}) => {
  const { user: currentUser } = useAuth();
  const [showSpoiler, setShowSpoiler] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [notesLoaded, setNotesLoaded] = useState(false);

  const {
    addDiscussionNote,
    listNotes,
    notes,
    isLoading: notesLoading,
    agreeWithDiscussionNote,
    disagreeWithDiscussionNote,
    reprintDiscussionNote,
    bookmarkDiscussionNote
  } = useDiscussions();
  const [showBookContext, setShowBookContext] = useState(false);

  // Load notes when comments section is opened
  useEffect(() => {
    if (showComments && !notesLoaded) {
      listNotes(post.discussion_id);
      setNotesLoaded(true);
    }
  }, [showComments, notesLoaded, post.discussion_id, listNotes]);

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
      case 'agree':
        await onAgree(post.discussion_id);
        break;
      case 'disagree':
        await onDisagree(post.discussion_id);
        break;
      case 'reprint':
        await onReprint(post);
        break;
      case 'bookmark':
        await onBookmark(post.discussion_id);
        break;
    }
  };

  const handlePostClick = (e) => {
    // Don't navigate if clicking on interactive elements
    if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.reaction-bar')) {
      return;
    }
    // Navigate to post detail
    window.location.href = `/socials/discussions/post/${post.discussion_id}`;
  };

  return (
    <motion.div
      className={`${
        isEmbedded
          ? 'bg-white/30 rounded-xl border border-white/10 hover:border-white/20'
          : 'bookish-glass rounded-xl sm:rounded-2xl border border-white/20 hover:border-white/30 bookish-shadow'
      } transition-all duration-300 overflow-hidden group relative mobile-post-card ${!isEmbedded ? 'cursor-pointer' : ''}
      mx-2 sm:mx-0 max-w-sm sm:max-w-none`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!isEmbedded ? { y: -2, scale: 1.01 } : {}}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={!isEmbedded ? handlePostClick : undefined}
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
      {/* Header - Mobile Optimized */}
      <div className="p-2 sm:p-6 pb-2 sm:pb-4">
        <div className="flex items-start justify-between mb-2 sm:mb-4">
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* User Avatar - Smaller on mobile */}
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              {post.user?.profile_picture ? (
                <img
                  src={post.user.profile_picture}
                  alt={post.user.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <span className="font-semibold font-open-sans text-primary text-sm sm:text-base truncate">
                  {isOwnPost ? (
                    <span className="flex items-center space-x-1">
                      <span>You</span>
                      {isRecentPost && (
                        <span className="text-xs bg-accent/20 text-accent px-1.5 sm:px-2 py-0.5 rounded-full">
                          <span className="hidden sm:inline">posted</span>
                          <span className="sm:hidden">•</span>
                        </span>
                      )}
                    </span>
                  ) : (
                    post.user?.username || 'Anonymous'
                  )}
                </span>
                <span className="text-primary/40 text-xs sm:text-sm">•</span>
                <span className="text-xs sm:text-sm text-primary/60 flex items-center space-x-1 font-open-sans">
                  <ClockIcon className="w-2.5 sm:w-3 h-2.5 sm:h-3" />
                  <span className="truncate">
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



        {/* Title - Compact for mobile */}
        <Link to={`/socials/discussions/post/${post.discussion_id}`}>
          <h2 className="text-base sm:text-xl font-lora font-bold text-primary mb-2 sm:mb-3 hover:text-accent transition-colors cursor-pointer line-clamp-2">
            {post.title}
          </h2>
        </Link>

        {/* Content - Enhanced with Preview */}
        <div className="text-sm sm:text-base">
          {post.spoiler_flag && !showSpoiler ? (
            <div className="bg-error/5 border border-error/20 rounded-lg p-6 text-center">
              <EyeSlashIcon className="w-12 h-12 text-error/60 mx-auto mb-3" />
              <p className="text-error font-medium mb-2">⚠️ {post.spoiler_level || 'Minor'} Spoiler Warning</p>
              <p className="text-primary/70 mb-4 text-sm">This post contains plot spoilers. Proceed with caution!</p>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowSpoiler(true);
                }}
                className="px-6 py-2 bookish-button-enhanced text-white rounded-lg font-open-sans"
              >
                Show Content Anyway
              </button>
            </div>
          ) : (
            <SmartTextRenderer
              text={showFullContent ? post.content : (post.content?.length > 200 ? post.content.substring(0, 200) + '...' : post.content)}
              className="text-primary/80 leading-relaxed font-open-sans"
              enableBookLinks={true}
              enableAutoDetection={true}
            />
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
      <div className="reaction-bar">
        <EnhancedReactionBar
          post={post}
          onAgree={onAgree}
          onDisagree={onDisagree}
          onReprint={onReprint}
          onBookmark={onBookmark}
          onToggleComments={() => setShowComments(!showComments)}
          isAgreed={isAgreed}
          isDisagreed={isDisagreed}
          isBookmarked={isBookmarked}
          showComments={true}
        />

        {/* Enhanced Comments Section */}
        {showComments && (
          <div className="border-t border-white/10 pt-4">
            <EnhancedCommentSection
              notes={notes || []}
              onAddComment={async (content) => {
                try {
                  await addDiscussionNote(post.discussion_id, { content });
                  // Refresh notes after adding
                  await listNotes(post.discussion_id);
                  return true;
                } catch (error) {
                  console.error('Failed to add note:', error);
                  return false;
                }
              }}
              onLikeComment={() => {}} // Not used anymore
              onReplyToComment={async (parentNoteId, content) => {
                try {
                  await addDiscussionNote(post.discussion_id, {
                    content,
                    parent_note: parentNoteId
                  });
                  await listNotes(post.discussion_id);
                } catch (error) {
                  throw error;
                }
              }}
              onAgreeComment={agreeWithDiscussionNote}
              onDisagreeComment={disagreeWithDiscussionNote}
              onEchoComment={reprintDiscussionNote}
              onBookmarkComment={bookmarkDiscussionNote}
              isSubmittingComment={notesLoading}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EnhancedPostCard;
