import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  ChatBubbleLeftIcon,
  ShareIcon,
  BookmarkIcon,
  EyeSlashIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { 
  ArrowUpIcon as ArrowUpSolid, 
  ArrowDownIcon as ArrowDownSolid,
  BookmarkIcon as BookmarkSolid
} from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';

const EnhancedPostCard = ({ 
  post, 
  onUpvote, 
  onDownvote, 
  onReprint, 
  onBookmark,
  isUpvoted = false,
  isDownvoted = false,
  isBookmarked = false,
  showFullContent = false 
}) => {
  const [showSpoiler, setShowSpoiler] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getPostTypeColor = (type) => {
    switch (type) {
      case 'Article': return 'from-blue-500 to-indigo-600';
      case 'Synopsis': return 'from-green-500 to-emerald-600';
      case 'Query': return 'from-purple-500 to-pink-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getPostTypeIcon = (type) => {
    switch (type) {
      case 'Article': return '📝';
      case 'Synopsis': return '📖';
      case 'Query': return '❓';
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
      className="bg-white rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-300 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* User Avatar */}
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
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
                <span className="font-semibold text-gray-900">
                  {post.user?.username || 'Anonymous'}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-sm text-gray-500 flex items-center space-x-1">
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
                <span className={`px-2 py-1 text-xs font-medium text-white rounded-full bg-gradient-to-r ${getPostTypeColor(post.type)}`}>
                  {getPostTypeIcon(post.type)} {post.type}
                </span>
                {post.spoiler_flag && (
                  <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full flex items-center space-x-1">
                    <EyeSlashIcon className="w-3 h-3" />
                    <span>Spoiler</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bookmark Button */}
          <motion.button
            onClick={(e) => handleReaction('bookmark', e)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isBookmarked ? (
              <BookmarkSolid className="w-5 h-5 text-blue-600" />
            ) : (
              <BookmarkIcon className="w-5 h-5 text-gray-400" />
            )}
          </motion.button>
        </div>

        {/* Title */}
        <Link to={`/socials/discussions/post/${post.discussion_id}`}>
          <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors cursor-pointer">
            {post.title}
          </h2>
        </Link>

        {/* Content */}
        <div className="text-gray-700 leading-relaxed">
          {post.spoiler_flag && !showSpoiler ? (
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <EyeSlashIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-3">This post contains spoilers</p>
              <button
                onClick={() => setShowSpoiler(true)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
              >
                Show Content
              </button>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">
              {showFullContent ? post.content : truncateContent(post.content)}
              {!showFullContent && post.content?.length > 200 && (
                <Link 
                  to={`/socials/discussions/post/${post.discussion_id}`}
                  className="text-blue-600 hover:text-blue-700 ml-2 font-medium"
                >
                  Read more
                </Link>
              )}
            </p>
          )}
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="px-2 py-1 text-xs text-gray-500">
                +{post.tags.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Actions Bar */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Upvote */}
            <motion.button
              onClick={(e) => handleReaction('upvote', e)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                isUpvoted 
                  ? 'bg-green-100 text-green-700' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isUpvoted ? (
                <ArrowUpSolid className="w-4 h-4" />
              ) : (
                <ArrowUpIcon className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">{post.upvotes || 0}</span>
            </motion.button>

            {/* Downvote */}
            <motion.button
              onClick={(e) => handleReaction('downvote', e)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all ${
                isDownvoted 
                  ? 'bg-red-100 text-red-700' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isDownvoted ? (
                <ArrowDownSolid className="w-4 h-4" />
              ) : (
                <ArrowDownIcon className="w-4 h-4" />
              )}
            </motion.button>

            {/* Comments */}
            <Link 
              to={`/socials/discussions/post/${post.discussion_id}`}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-all"
            >
              <ChatBubbleLeftIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{post.note_count || 0}</span>
            </Link>

            {/* Reprint */}
            <motion.button
              onClick={(e) => handleReaction('reprint', e)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShareIcon className="w-4 h-4" />
              <span className="text-sm font-medium">{post.reprint_count || 0}</span>
            </motion.button>
          </div>

          {/* Engagement Stats */}
          <div className="text-xs text-gray-500">
            {post.views && (
              <span>{post.views} views</span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedPostCard;
