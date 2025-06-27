import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ChatBubbleLeftIcon,
  ChatBubbleBottomCenterTextIcon,
  ShareIcon,
  BookmarkIcon,
  EyeSlashIcon,
  ClockIcon,
  UserIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { 
  ArrowUpIcon as ArrowUpSolid, 
  ArrowDownIcon as ArrowDownSolid,
  BookmarkIcon as BookmarkSolid
} from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';
import { useDiscussions } from '../../../hooks/useDiscussions';
import { toast } from 'react-toastify';

const EnhancedPostDetail = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const {
    getPost,
    listNotes,
    addDiscussionNote,
    likeDiscussionNote,
    upvoteDiscussionPost,
    reprintDiscussionPost,
    post,
    notes,
    isLoading,
    error
  } = useDiscussions();

  const [showSpoiler, setShowSpoiler] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    if (postId) {
      getPost(postId);
      listNotes(postId);
    }
  }, [postId, getPost, listNotes]);

  const handleAddComment = async (e, parentNoteId = null) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      const data = { content: newComment, parent_note: parentNoteId };
      await addDiscussionNote(postId, data);
      setNewComment('');
      setReplyingTo(null);
      toast.success('Comment added successfully!');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleReaction = async (action) => {
    try {
      switch (action) {
        case 'upvote':
          await upvoteDiscussionPost(postId);
          break;
        case 'reprint':
          await reprintDiscussionPost(postId, { comment: '' });
          toast.success('Post reprinted successfully!');
          break;
        case 'bookmark':
          toast.info('Bookmark feature coming soon!');
          break;
      }
    } catch (error) {
      toast.error(`Failed to ${action} post`);
    }
  };

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

  if (isLoading && !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Post not found</h2>
          <p className="text-gray-600 mb-4">{error || 'The post you\'re looking for doesn\'t exist.'}</p>
          <button
            onClick={() => navigate('/socials/discussions')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Discussions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <motion.button
          onClick={() => navigate('/socials/discussions')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to Discussions</span>
        </motion.button>

        {/* Post Content */}
        <motion.div
          className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Header */}
          <div className="p-8 pb-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                {/* User Avatar */}
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  {post.user?.profile_picture ? (
                    <img 
                      src={post.user.profile_picture} 
                      alt={post.user.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-6 h-6 text-white" />
                  )}
                </div>
                
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900 text-lg">
                      {post.user?.username || 'Anonymous'}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-sm text-gray-500 flex items-center space-x-1">
                      <ClockIcon className="w-4 h-4" />
                      <span>
                        {post.created_at && !isNaN(new Date(post.created_at).getTime())
                          ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
                          : 'Recently'
                        }
                      </span>
                    </span>
                  </div>
                  
                  {/* Post Type Badge */}
                  <div className="flex items-center space-x-2 mt-2">
                    <span className={`px-3 py-1 text-sm font-medium text-white rounded-full bg-gradient-to-r ${getPostTypeColor(post.type)}`}>
                      {getPostTypeIcon(post.type)} {post.type}
                    </span>
                    {post.spoiler_flag && (
                      <span className="px-3 py-1 text-sm font-medium text-red-800 bg-red-100 rounded-full flex items-center space-x-1">
                        <EyeSlashIcon className="w-4 h-4" />
                        <span>Spoiler</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bookmark Button */}
              <motion.button
                onClick={() => handleReaction('bookmark')}
                className="p-3 hover:bg-gray-100 rounded-full transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <BookmarkIcon className="w-6 h-6 text-gray-400" />
              </motion.button>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Content */}
            <div className="text-gray-700 leading-relaxed text-lg">
              {post.spoiler_flag && !showSpoiler ? (
                <div className="bg-gray-100 rounded-xl p-8 text-center">
                  <EyeSlashIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4 text-lg">This post contains spoilers</p>
                  <button
                    onClick={() => setShowSpoiler(true)}
                    className="px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-colors"
                  >
                    Show Content
                  </button>
                </div>
              ) : (
                <div className="prose prose-lg max-w-none">
                  <p className="whitespace-pre-wrap">{post.content}</p>
                </div>
              )}
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Actions Bar */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                {/* Upvote */}
                <motion.button
                  onClick={() => handleReaction('upvote')}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowUpIcon className="w-5 h-5" />
                  <span className="font-medium">{post.upvotes || 0}</span>
                </motion.button>

                {/* Comments */}
                <div className="flex items-center space-x-2 px-4 py-2 text-gray-600">
                  <ChatBubbleLeftIcon className="w-5 h-5" />
                  <span className="font-medium">{notes?.length || 0}</span>
                </div>

                {/* Reprint */}
                <motion.button
                  onClick={() => handleReaction('reprint')}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ShareIcon className="w-5 h-5" />
                  <span className="font-medium">{post.reprint_count || 0}</span>
                </motion.button>
              </div>

              {/* Views */}
              <div className="text-sm text-gray-500">
                {post.views && `${post.views} views`}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Comments Section */}
        <motion.div
          className="bg-white rounded-2xl border border-gray-100 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Comments ({notes?.length || 0})
          </h2>

          {/* Enhanced Comment Form */}
          <motion.form
            onSubmit={handleAddComment}
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bookish-glass rounded-2xl border border-white/20 p-6">
              <h3 className="text-lg font-lora font-semibold text-primary mb-4">Share Your Thoughts</h3>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Share your thoughts about this discussion..."
                    className="w-full px-4 py-3 bookish-input rounded-xl font-open-sans resize-none focus:ring-2 focus:ring-accent/50 transition-all"
                    rows={4}
                    maxLength={1000}
                  />
                  <div className="flex justify-between items-center mt-3">
                    <span className="text-sm text-primary/60 font-open-sans">
                      {newComment.length}/1000 characters
                    </span>
                    <motion.button
                      type="submit"
                      disabled={isSubmittingComment || !newComment.trim()}
                      className="px-6 py-2 bookish-button-enhanced text-white rounded-xl font-open-sans disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSubmittingComment ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Posting...</span>
                        </div>
                      ) : (
                        '💬 Post Comment'
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.form>

          {/* Enhanced Comments List */}
          <div className="space-y-4">
            <h3 className="text-xl font-lora font-semibold text-primary mb-6 flex items-center space-x-2">
              <ChatBubbleLeftIcon className="w-6 h-6 text-accent" />
              <span>Comments ({notes?.length || 0})</span>
            </h3>

            {notes && notes.length > 0 ? (
              notes.map((note, index) => (
                <motion.div
                  key={note.note_id}
                  className="bookish-glass rounded-xl border border-white/20 p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
                      {note.user?.profile_picture ? (
                        <img
                          src={note.user.profile_picture}
                          alt={note.user.username}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <UserIcon className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="font-semibold text-primary font-open-sans">
                          {note.user?.username || 'Anonymous'}
                        </span>
                        <span className="text-sm text-primary/60 font-open-sans">
                          {note.created_at && !isNaN(new Date(note.created_at).getTime())
                            ? formatDistanceToNow(new Date(note.created_at), { addSuffix: true })
                            : 'Recently'
                          }
                        </span>
                      </div>

                      {/* Comment Content with HTML Rendering */}
                      <div
                        className="text-primary/80 font-open-sans leading-relaxed mb-4"
                        dangerouslySetInnerHTML={{
                          __html: note.content || ''
                        }}
                      />

                      <div className="flex items-center space-x-4">
                        <motion.button
                          onClick={() => likeDiscussionNote(note.note_id)}
                          className="flex items-center space-x-1 text-sm text-primary/60 hover:text-accent transition-colors font-open-sans"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <span>👍</span>
                          <span>{note.likes || 0}</span>
                        </motion.button>
                        <motion.button
                          onClick={() => setReplyingTo(note.note_id)}
                          className="text-sm text-primary/60 hover:text-accent transition-colors font-open-sans"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          💬 Reply
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                className="text-center py-12 bookish-glass rounded-xl border border-white/20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <ChatBubbleLeftIcon className="w-16 h-16 text-primary/30 mx-auto mb-4" />
                <h4 className="text-lg font-lora font-medium text-primary mb-2">No comments yet</h4>
                <p className="text-primary/60 font-open-sans">Be the first to share your thoughts on this discussion!</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default EnhancedPostDetail;
