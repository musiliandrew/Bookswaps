import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChatBubbleLeftIcon,
  UserIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';
import SmartTextEditor from '../../Common/SmartTextEditor';
import SmartTextRenderer from '../../Common/SmartTextRenderer';
import EnhancedReactionBar from './EnhancedReactionBar';

const EnhancedCommentSection = ({
  notes = [],
  onAddComment,
  onLikeComment,
  onReplyToComment,
  onAgreeComment,
  onDisagreeComment,
  onEchoComment,
  onBookmarkComment,
  isSubmittingComment = false,
  currentUser
}) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'oldest', 'popular'
  const [showReplies, setShowReplies] = useState({});

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const success = await onAddComment(newComment);
    if (success) {
      setNewComment('');
    }
  };

  const handleSubmitReply = async (e, parentNoteId) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const success = await onReplyToComment(replyText, parentNoteId);
    if (success) {
      setReplyText('');
      setReplyingTo(null);
    }
  };

  const toggleReplies = (noteId) => {
    setShowReplies(prev => ({
      ...prev,
      [noteId]: !prev[noteId]
    }));
  };

  const sortedNotes = [...notes].sort((a, b) => {
    switch (sortBy) {
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'popular':
        return (b.likes || 0) - (a.likes || 0);
      case 'newest':
      default:
        return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  const topLevelComments = sortedNotes.filter(note => !note.parent_note);
  const getReplies = (parentId) => sortedNotes.filter(note => note.parent_note === parentId);

  const CommentItem = ({ note, depth = 0, isReply = false }) => {
    const replies = getReplies(note.note_id);
    const hasReplies = replies.length > 0;
    const showingReplies = showReplies[note.note_id];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2, scale: 1.01 }}
        className={`${depth > 0 ? 'ml-8 border-l-2 border-accent/20 pl-4' : ''}`}
      >
        <div className="bookish-glass rounded-xl sm:rounded-2xl border border-white/20 hover:border-white/30 bookish-shadow transition-all duration-300 overflow-hidden group relative mobile-post-card mb-4">
          {/* Header - Same structure as posts */}
          <div className="p-2 sm:p-6 pb-2 sm:pb-4">
            <div className="flex items-start justify-between mb-2 sm:mb-4">
              <div className="flex items-center space-x-2 sm:space-x-3">
                {/* User Avatar - Same size as posts */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                  {note.user?.profile_picture ? (
                    <img
                      src={note.user.profile_picture}
                      alt={note.user.username}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* User Info - Same as posts */}
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-primary text-sm sm:text-base font-lora">
                      {note.user?.username || 'Anonymous'}
                    </span>
                    <span className="text-xs text-primary/60 font-open-sans flex items-center space-x-1">
                      <ClockIcon className="w-3 h-3" />
                      <span>
                        {note.created_at && !isNaN(new Date(note.created_at).getTime())
                          ? formatDistanceToNow(new Date(note.created_at), { addSuffix: true })
                          : 'Recently'
                        }
                      </span>
                    </span>
                  </div>

                  {/* Type indicator - Same as posts */}
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="px-3 py-1 text-xs font-medium font-open-sans text-blue-600 bg-blue-600/10 rounded-full flex items-center space-x-1">
                      <ChatBubbleLeftIcon className="w-3 h-3" />
                      <span>{isReply ? 'Reply' : 'Comment'}</span>
                    </span>
                    {note.discussion && (
                      <a
                        href={`/discussions/${note.discussion.discussion_id}`}
                        className="px-2 py-1 text-xs font-medium font-open-sans text-accent/80 hover:text-accent bg-accent/10 hover:bg-accent/20 rounded-full transition-colors"
                        title="View original post"
                      >
                        Original Post
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Views - Same position as posts */}
              <div className="text-sm text-primary/60 font-open-sans">
                {/* Could add view count here if needed */}
              </div>
            </div>

            {/* Content - Same structure as posts */}
            <div className="text-sm sm:text-base">
              <SmartTextRenderer
                text={note.content || ''}
                enableBookLinks={true}
                enableUserMentions={true}
                className="text-primary/80 font-open-sans leading-relaxed mb-3"
              />
            </div>
          </div>

          {/* Enhanced Reaction Bar - EXACTLY same as posts */}
          <EnhancedReactionBar
            post={{
              discussion_id: note.note_id,
              upvotes: note.agree_count || 0,
              downvotes: note.disagree_count || 0,
              reprint_count: note.echo_count || 0,
              note_count: note.reply_count || 0
            }}
            onAgree={() => onAgreeComment && onAgreeComment(note.note_id)}
            onDisagree={() => onDisagreeComment && onDisagreeComment(note.note_id)}
            onReprint={() => onEchoComment && onEchoComment(note)}
            onBookmark={() => onBookmarkComment && onBookmarkComment(note.note_id)}
            onToggleComments={() => setReplyingTo(replyingTo === note.note_id ? null : note.note_id)}
            isAgreed={note.is_agreed}
            isDisagreed={note.is_disagreed}
            isBookmarked={note.is_bookmarked}
            showComments={true}
          />

          {hasReplies && (
            <motion.button
              onClick={() => toggleReplies(note.note_id)}
              className="absolute top-2 right-2 text-xs text-accent hover:text-accent/80 transition-colors font-open-sans"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {showingReplies ? 'Hide' : 'Show'} {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
            </motion.button>
          )}

              {/* Reply Form */}
              <AnimatePresence>
                {replyingTo === note.note_id && (
                  <motion.form
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    onSubmit={(e) => handleSubmitReply(e, note.note_id)}
                    className="mt-3 space-y-2"
                  >
                    <SmartTextEditor
                      value={replyText}
                      onChange={setReplyText}
                      placeholder={`Reply to ${note.user?.username || 'this comment'}... (try book@ to reference books)`}
                      className="w-full bookish-input rounded-lg font-open-sans text-sm"
                      maxLength={500}
                      minRows={2}
                      maxRows={4}
                      showBookReferences={true}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-primary/60 font-open-sans">
                        {replyText.length}/500 characters
                      </span>
                      <div className="flex space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setReplyingTo(null);
                            setReplyText('');
                          }}
                          className="px-3 py-1 text-xs text-primary/60 hover:text-primary transition-colors font-open-sans"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!replyText.trim() || isSubmittingComment}
                          className="px-3 py-1 bg-accent text-white text-xs rounded-lg hover:bg-accent/90 disabled:opacity-50 transition-colors font-open-sans"
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
        </div>

        {/* Replies */}
        <AnimatePresence>
          {hasReplies && showingReplies && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              {replies.map((reply) => (
                <CommentItem
                  key={reply.note_id}
                  note={reply}
                  depth={depth + 1}
                  isReply={true}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header with Sort Options */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-lora font-semibold text-primary flex items-center space-x-2">
          <ChatBubbleLeftIcon className="w-6 h-6 text-accent" />
          <span>Comments ({notes.length})</span>
        </h3>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-primary/60 font-open-sans">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-sm bookish-input rounded-lg px-3 py-1 font-open-sans"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="popular">Most Liked</option>
          </select>
        </div>
      </div>

      {/* Comment Form */}
      <motion.form
        onSubmit={handleSubmitComment}
        className="bookish-glass rounded-xl sm:rounded-2xl border border-white/20 hover:border-white/30 bookish-shadow transition-all duration-300 overflow-hidden group relative mobile-post-card p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center flex-shrink-0">
            <UserIcon className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1">
            <SmartTextEditor
              value={newComment}
              onChange={setNewComment}
              placeholder="Share your thoughts about this discussion... (try book@ to reference books)"
              className="w-full bookish-input rounded-lg font-open-sans"
              maxLength={1000}
              minRows={3}
              maxRows={6}
              showBookReferences={true}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-primary/60 font-open-sans">
                {newComment.length}/1000 characters
              </span>
              <motion.button
                type="submit"
                disabled={isSubmittingComment || !newComment.trim()}
                className="px-4 py-2 bookish-button-enhanced text-white rounded-lg font-open-sans disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isSubmittingComment ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Posting...</span>
                  </div>
                ) : (
                  '💬 Post Comment'
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.form>

      {/* Comments List */}
      <div className="space-y-4">
        {topLevelComments.length > 0 ? (
          topLevelComments.map((note) => (
            <CommentItem key={note.note_id} note={note} />
          ))
        ) : (
          <motion.div
            className="text-center py-12 bookish-glass rounded-xl sm:rounded-2xl border border-white/20 bookish-shadow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <ChatBubbleLeftIcon className="w-16 h-16 text-primary/30 mx-auto mb-4" />
            <h4 className="text-lg font-lora font-medium text-primary mb-2">No comments yet</h4>
            <p className="text-primary/60 font-open-sans">Be the first to share your thoughts on this discussion!</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EnhancedCommentSection;
