import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ChatBubbleLeftIcon,
  ChatBubbleBottomCenterTextIcon,
  EyeSlashIcon,
  ClockIcon,
  UserIcon,
  PaperAirplaneIcon,
  BookmarkIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import { useDiscussions } from '../../../hooks/useDiscussions';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import EnhancedReactionBar from './EnhancedReactionBar';
import EnhancedCommentSection from './EnhancedCommentSection';
import SmartTextRenderer from '../../Common/SmartTextRenderer';
import { getProfilePictureUrl } from '../../../utils/imageUtils';

// Helper functions for consistent styling
const getPostTypeColor = (type) => {
  switch (type?.toLowerCase()) {
    case 'review': return 'from-purple-500 to-purple-600';
    case 'discussion': return 'from-blue-500 to-blue-600';
    case 'question': return 'from-green-500 to-green-600';
    case 'recommendation': return 'from-orange-500 to-orange-600';
    case 'spoiler': return 'from-red-500 to-red-600';
    default: return 'from-gray-500 to-gray-600';
  }
};

const getPostTypeIcon = (type) => {
  switch (type?.toLowerCase()) {
    case 'review': return '⭐';
    case 'discussion': return '💬';
    case 'question': return '❓';
    case 'recommendation': return '👍';
    case 'spoiler': return '⚠️';
    default: return '📝';
  }
};

const EnhancedPostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const {
    getPost,
    listNotes,
    addDiscussionNote,
    likeDiscussionNote,
    agreeWithDiscussionNote,
    disagreeWithDiscussionNote,
    reprintDiscussionNote,
    bookmarkDiscussionNote,
    agreeWithDiscussionPost,
    disagreeWithDiscussionPost,
    reprintDiscussionPost,
    bookmarkDiscussionPost,
    post,
    notes,
    isLoading,
    error
  } = useDiscussions();

  const [showSpoiler, setShowSpoiler] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showComments, setShowComments] = useState(true);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (postId) {
      getPost(postId);
      listNotes(postId);
    }
  }, [postId, getPost, listNotes]);

  const handleAddComment = async (content, parentNoteId = null) => {
    if (!content.trim()) return false;

    setIsSubmittingComment(true);
    try {
      const data = { content: content.trim(), parent_note: parentNoteId };
      await addDiscussionNote(postId, data);
      toast.success('Comment added successfully! 💬');
      return true;
    } catch (error) {
      toast.error('Failed to add comment');
      return false;
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleReplyToComment = async (content, parentNoteId) => {
    return await handleAddComment(content, parentNoteId);
  };

  const handleAgreeComment = async (noteId) => {
    try {
      await agreeWithDiscussionNote(noteId);
      await listNotes(postId); // Refresh notes
    } catch (error) {
      toast.error('Failed to agree with comment');
    }
  };

  const handleDisagreeComment = async (noteId) => {
    try {
      await disagreeWithDiscussionNote(noteId);
      await listNotes(postId); // Refresh notes
    } catch (error) {
      toast.error('Failed to disagree with comment');
    }
  };

  const handleEchoComment = async (note) => {
    try {
      await reprintDiscussionNote(note.note_id);
      await listNotes(postId); // Refresh notes
      toast.success('Comment echoed successfully! 📢');
    } catch (error) {
      toast.error('Failed to echo comment');
    }
  };

  const handleBookmarkComment = async (noteId) => {
    try {
      await bookmarkDiscussionNote(noteId);
      await listNotes(postId); // Refresh notes
    } catch (error) {
      toast.error('Failed to bookmark comment');
    }
  };

  const handleAgree = async () => {
    try {
      await agreeWithDiscussionPost(postId);
      await getPost(postId);
    } catch (error) {
      toast.error('Failed to agree with post');
    }
  };

  const handleDisagree = async () => {
    try {
      await disagreeWithDiscussionPost(postId);
      await getPost(postId);
    } catch (error) {
      toast.error('Failed to disagree with post');
    }
  };

  const handleReprint = async () => {
    try {
      await reprintDiscussionPost(postId, { comment: '' });
      toast.success('Post reprinted successfully!');
      await getPost(postId);
    } catch (error) {
      toast.error('Failed to reprint post');
    }
  };

  const handleBookmark = async () => {
    try {
      if (bookmarkDiscussionPost) {
        await bookmarkDiscussionPost(postId);
        await getPost(postId);
      } else {
        toast.info('Bookmark feature coming soon!');
      }
    } catch (error) {
      toast.error('Failed to bookmark post');
    }
  };



  if (isLoading && !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-accent)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[var(--text)] font-open-sans">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-accent)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-[var(--error)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-[var(--dark-primary)] mb-2 font-lora">Post not found</h2>
          <p className="text-[var(--text)] mb-4 font-open-sans">{error || 'The post you\'re looking for doesn\'t exist.'}</p>
          <motion.button
            onClick={() => navigate('/socials/discussions')}
            className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--dark-accent)] transition-colors font-open-sans"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Back to Discussions
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg-primary)] via-[var(--bg-secondary)] to-[var(--bg-accent)]">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-4xl">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate('/socials/discussions')}
          className="flex items-center space-x-2 text-[var(--text)] hover:text-[var(--dark-primary)] mb-4 sm:mb-6 transition-colors"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="font-open-sans text-sm sm:text-base">Back to Discussions</span>
        </motion.button>

        {/* Post Content with Comments in Same Container */}
        <motion.div
          className="bookish-glass rounded-2xl border border-white/20 hover:border-white/30 bookish-shadow overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Header - Consistent with EnhancedPostCard */}
          <div className="p-4 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3 flex-1">
                {/* User Avatar */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[var(--accent)] to-[var(--dark-accent)] rounded-full flex items-center justify-center flex-shrink-0">
                  {post.user?.profile_picture ? (
                    <img
                      src={getProfilePictureUrl(post.user.profile_picture)}
                      alt={post.user.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold font-open-sans text-[var(--dark-primary)] text-sm sm:text-base truncate">
                      {post.user?.username || 'Anonymous'}
                    </span>
                    <span className="text-[var(--text)] text-xs sm:text-sm">•</span>
                    <span className="text-xs sm:text-sm text-[var(--text)] flex items-center space-x-1 font-open-sans">
                      <ClockIcon className="w-3 h-3" />
                      <span className="truncate">
                        {post.created_at && !isNaN(new Date(post.created_at).getTime())
                          ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
                          : 'Recently'
                        }
                      </span>
                    </span>
                  </div>

                  {/* Post Type Badge */}
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-3 py-1 text-xs font-medium font-open-sans text-white rounded-full bg-gradient-to-r ${getPostTypeColor(post.type)}`}>
                      {getPostTypeIcon(post.type)} {post.type}
                    </span>
                    {post.spoiler_flag && (
                      <span className="px-3 py-1 text-xs font-medium font-open-sans text-[var(--error)] bg-[var(--error)]/10 rounded-full flex items-center space-x-1">
                        <EyeSlashIcon className="w-3 h-3" />
                        <span>{post.spoiler_level || 'minor'} spoiler</span>
                      </span>
                    )}
                    {post.book && (
                      <span className="px-3 py-1 text-xs font-medium font-open-sans text-[var(--accent)] bg-[var(--accent)]/10 rounded-full flex items-center space-x-1">
                        <BookOpenIcon className="w-3 h-3" />
                        <span>{post.book.title}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Views */}
              <div className="text-sm text-[var(--text)] font-open-sans">
                {post.views || 0} views
              </div>
            </div>

            {/* Title - Consistent styling */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-lora font-bold text-[var(--dark-primary)] mb-4 leading-tight">
              {post.title}
            </h1>

            {/* Content - Consistent styling */}
            <div className="text-sm sm:text-base mb-6">
              {post.spoiler_flag && !showSpoiler ? (
                <div className="bg-[var(--error)]/5 border border-[var(--error)]/20 rounded-xl p-6 text-center">
                  <EyeSlashIcon className="w-12 h-12 text-[var(--error)]/60 mx-auto mb-4" />
                  <p className="text-[var(--text)] mb-4 text-base font-open-sans">This post contains spoilers</p>
                  <motion.button
                    onClick={() => setShowSpoiler(true)}
                    className="px-6 py-3 bg-[var(--accent)] text-white rounded-xl hover:bg-[var(--dark-accent)] transition-colors font-open-sans"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Show Content
                  </motion.button>
                </div>
              ) : (
                <div className="text-[var(--dark-primary)] leading-relaxed font-open-sans">
                  <SmartTextRenderer
                    text={post.content}
                    className="whitespace-pre-wrap"
                  />
                </div>
              )}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm bg-[var(--accent)]/10 text-[var(--accent)] rounded-full hover:bg-[var(--accent)]/20 transition-colors cursor-pointer font-open-sans"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Enhanced Reaction Bar - Consistent with app design */}
          <EnhancedReactionBar
            post={{
              discussion_id: post.discussion_id,
              upvotes: post.upvotes_count || 0,
              downvotes: post.downvotes_count || 0,
              reprint_count: post.reprint_count || 0,
              note_count: post.note_count || 0
            }}
            onAgree={handleAgree}
            onDisagree={handleDisagree}
            onReprint={handleReprint}
            onBookmark={handleBookmark}
            onToggleComments={() => setShowComments(!showComments)}
            isAgreed={post.is_upvoted}
            isDisagreed={post.is_downvoted}
            isBookmarked={post.is_bookmarked}
            showComments={true}
          />

          {/* Enhanced Comments Section - Inside Same Container */}
          <div className="border-t border-white/10">
            <EnhancedCommentSection
              notes={notes || []}
              onAddComment={handleAddComment}
              onLikeComment={likeDiscussionNote}
              onReplyToComment={handleReplyToComment}
              onAgreeComment={handleAgreeComment}
              onDisagreeComment={handleDisagreeComment}
              onEchoComment={handleEchoComment}
              onBookmarkComment={handleBookmarkComment}
              isSubmittingComment={isSubmittingComment}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedPostDetail;
