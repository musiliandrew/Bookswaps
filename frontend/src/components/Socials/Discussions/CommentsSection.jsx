import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChatBubbleLeftIcon,
  UserIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckIcon,
  XMarkIcon,
  SpeakerWaveIcon,
  ShareIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';
import {
  CheckIcon as CheckSolid,
  XMarkIcon as XMarkSolid,
  SpeakerWaveIcon as SpeakerWaveSolid
} from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';
import SmartTextEditor from '../../Common/SmartTextEditor';
import SmartTextRenderer from '../../Common/SmartTextRenderer';
import { useDiscussions } from '../../../hooks/useDiscussions';
import { toast } from 'react-toastify';

const CommentItem = ({
  comment,
  onLike,
  onReply,
  onAgree,
  onDisagree,
  onEcho,
  onShare,
  depth = 0
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [showReplies, setShowReplies] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onReply(comment.note_id, replyText);
      setReplyText('');
      setShowReplyForm(false);
      toast.success('Reply added!');
    } catch (error) {
      toast.error('Failed to add reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const maxDepth = 3; // Limit nesting depth
  const canReply = depth < maxDepth;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${depth > 0 ? 'ml-3 sm:ml-4 border-l-2 border-[var(--accent)]/20 pl-2 sm:pl-3' : ''}`}
    >
      {/* Note styled exactly like a post - App themed */}
      <div className="bookish-glass rounded-xl border border-white/20 hover:border-white/30 transition-all duration-300 overflow-hidden bookish-shadow mobile-post-card">
        {/* Post-style header with gradient background */}
        <div className="bg-gradient-to-r from-[var(--primary)]/5 to-[var(--accent)]/5 px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[var(--accent)] to-[var(--dark-accent)] rounded-full flex items-center justify-center">
                {comment.user?.profile_picture ? (
                  <img
                    src={comment.user.profile_picture}
                    alt={comment.user.username}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
                  />
                ) : (
                  <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-[var(--dark-primary)] text-sm sm:text-base font-lora">
                    {comment.user?.username || 'Anonymous'}
                  </span>
                  <span className="text-xs text-[var(--text)] font-open-sans">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                {/* Replying to indicator - Twitter style */}
                {depth > 0 && (
                  <div className="text-xs text-[var(--text)] font-open-sans mt-1">
                    Replying to original post
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Post-style content */}
        <div className="px-4 sm:px-6 py-3 sm:py-4">
          <SmartTextRenderer
            text={comment.content}
            className="text-[var(--dark-primary)] text-sm sm:text-base leading-relaxed font-open-sans"
          />
        </div>

        {/* Exact same reaction bar as posts - No heart button */}
        <div className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 bg-white/30 backdrop-blur-sm border-t border-white/20">
          {/* Main actions - Same as posts */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Agree/Disagree */}
            <motion.button
              onClick={() => onAgree && onAgree(comment.note_id)}
              className={`flex items-center space-x-1 transition-all font-open-sans mobile-touch-target ${
                comment.is_agreed
                  ? 'text-green-600'
                  : 'text-gray-500 hover:text-green-600'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Agree / Correct"
            >
              {comment.is_agreed ? (
                <CheckSolid className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <CheckIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
              <span className="text-xs sm:text-sm font-medium mobile-text-xs">{comment.agree_count || 0}</span>
            </motion.button>

            <motion.button
              onClick={() => onDisagree && onDisagree(comment.note_id)}
              className={`flex items-center space-x-1 transition-all font-open-sans mobile-touch-target ${
                comment.is_disagreed
                  ? 'text-red-600'
                  : 'text-gray-500 hover:text-red-600'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Disagree / Wrong"
            >
              {comment.is_disagreed ? (
                <XMarkSolid className="w-4 h-4 sm:w-5 sm:h-5" />
              ) : (
                <XMarkIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              )}
              <span className="text-xs sm:text-sm font-medium mobile-text-xs">{comment.disagree_count || 0}</span>
            </motion.button>

            {/* Echo */}
            <motion.button
              onClick={() => onEcho && onEcho(comment)}
              className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-all font-open-sans mobile-touch-target"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Echo (Repost)"
            >
              <SpeakerWaveIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm font-medium mobile-text-xs">{comment.echo_count || 0}</span>
            </motion.button>

            {/* Reply */}
            {canReply && (
              <motion.button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center space-x-1 text-gray-500 hover:text-purple-600 transition-all font-open-sans mobile-touch-target"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Reply"
              >
                <ChatBubbleLeftIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm font-medium mobile-text-xs">Reply</span>
              </motion.button>
            )}
          </div>

          {/* Secondary actions - Same as posts */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Share */}
            <motion.button
              onClick={() => onShare && onShare(comment)}
              className="text-gray-400 hover:text-gray-600 transition-all mobile-touch-target"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Share"
            >
              <ShareIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>

            {/* Toggle replies */}
            {comment.replies && comment.replies.length > 0 && (
              <button
                onClick={() => setShowReplies(!showReplies)}
                className="flex items-center space-x-1 text-xs text-gray-500 hover:text-gray-700 mobile-touch-target"
              >
                {showReplies ? (
                  <ChevronUpIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <ChevronDownIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
                <span className="text-xs sm:text-sm mobile-text-xs">{comment.replies.length}</span>
              </button>
            )}

            {/* More options */}
            <motion.button
              className="text-gray-400 hover:text-gray-600 transition-all mobile-touch-target"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="More options"
            >
              <EllipsisHorizontalIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>
          </div>
        </div>

        {/* Reply form */}
        <AnimatePresence>
          {showReplyForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-100"
            >
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <SmartTextEditor
                    value={replyText}
                    onChange={setReplyText}
                    placeholder="Write a reply... (try book@ to reference books)"
                    maxLength={300}
                    minRows={1}
                    maxRows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowReplyForm(false)}
                    className="px-2 py-1 text-xs text-[var(--text)] hover:text-[var(--dark-primary)] font-open-sans"
                  >
                    Cancel
                  </button>
                  <motion.button
                    onClick={handleReply}
                    disabled={!replyText.trim() || isSubmitting}
                    className="px-3 py-1 bg-[var(--accent)] text-white text-xs rounded-lg hover:bg-[var(--dark-accent)] disabled:opacity-50 disabled:cursor-not-allowed font-open-sans"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isSubmitting ? 'Replying...' : 'Reply'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nested replies */}
      <AnimatePresence>
        {showReplies && comment.replies && comment.replies.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-3"
          >
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.note_id}
                comment={reply}
                onLike={() => {}} // No longer using likes
                onReply={onReply}
                onAgree={onAgree}
                onDisagree={onDisagree}
                onEcho={onEcho}
                onShare={onShare}
                depth={depth + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const CommentsSection = ({
  discussionId,
  isOpen,
  onClose,
  onAgreeNote,
  onDisagreeNote,
  onEchoNote,
  onShareNote
}) => {
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { 
    addDiscussionNote, 
    listNotes, 
    likeDiscussionNote, 
    notes, 
    isLoading 
  } = useDiscussions();

  useEffect(() => {
    if (isOpen && discussionId) {
      listNotes(discussionId);
    }
  }, [isOpen, discussionId, listNotes]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    try {
      await addDiscussionNote(discussionId, { content: newComment });
      setNewComment('');
      toast.success('Note added!');
      // Refresh notes
      await listNotes(discussionId);
    } catch (error) {
      toast.error('Failed to add note');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Removed like functionality - using agree/disagree instead

  const handleReplyToComment = async (parentNoteId, content) => {
    try {
      await addDiscussionNote(discussionId, {
        content,
        parent_note: parentNoteId
      });
      // Refresh notes to show new reply
      await listNotes(discussionId);
    } catch (error) {
      throw error; // Let the CommentItem handle the error
    }
  };

  // Note reaction handlers
  const handleAgreeNote = async (noteId) => {
    try {
      // TODO: Implement note agree API
      toast.info('Note agree feature coming soon!');
    } catch (error) {
      toast.error('Failed to agree with note');
    }
  };

  const handleDisagreeNote = async (noteId) => {
    try {
      // TODO: Implement note disagree API
      toast.info('Note disagree feature coming soon!');
    } catch (error) {
      toast.error('Failed to disagree with note');
    }
  };

  const handleEchoNote = async (note) => {
    try {
      // TODO: Implement note echo API
      toast.info('Note echo feature coming soon!');
    } catch (error) {
      toast.error('Failed to echo note');
    }
  };

  const handleShareNote = async (note) => {
    try {
      // Copy note link to clipboard
      const noteUrl = `${window.location.origin}/discussions/post/${discussionId}#note-${note.note_id}`;
      await navigator.clipboard.writeText(noteUrl);
      toast.success('Note link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to share note');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="mt-6 bookish-glass rounded-xl p-4 sm:p-6 border border-white/20 bookish-shadow"
    >
      {/* Notes header - Mobile optimized */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-lora font-semibold text-[var(--dark-primary)] flex items-center space-x-2">
          <ChatBubbleLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--accent)]" />
          <span className="mobile-text-sm">Notes ({notes?.length || 0})</span>
        </h3>
        <button
          onClick={onClose}
          className="text-[var(--text)] hover:text-[var(--dark-primary)] text-xs sm:text-sm font-open-sans mobile-touch-target"
        >
          Hide Notes
        </button>
      </div>

      {/* Add new note - Mobile optimized */}
      <div className="mb-3 sm:mb-4">
        <div className="flex items-end space-x-2 sm:space-x-3">
          <div className="flex-1">
            <SmartTextEditor
              value={newComment}
              onChange={setNewComment}
              placeholder="Add your note... (try book@ to reference books)"
              maxLength={500}
              minRows={1}
              maxRows={3}
              showBookReferences={true}
            />
          </div>
          <motion.button
            onClick={handleSubmitComment}
            disabled={!newComment.trim() || isSubmitting}
            className="px-3 sm:px-4 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--dark-accent)] disabled:opacity-50 disabled:cursor-not-allowed font-medium font-open-sans text-xs sm:text-sm mobile-touch-target"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSubmitting ? 'Adding...' : 'Add'}
          </motion.button>
        </div>
      </div>

      {/* Notes list - Mobile optimized */}
      <div className="space-y-3 sm:space-y-4">
        {isLoading ? (
          <div className="text-center py-6 sm:py-8 text-gray-500">
            <div className="text-sm sm:text-base font-open-sans">Loading notes...</div>
          </div>
        ) : notes && notes.length > 0 ? (
          notes
            .filter(note => !note.parent_note) // Only show top-level notes
            .map((comment) => (
              <CommentItem
                key={comment.note_id}
                comment={comment}
                onLike={() => {}} // No longer using likes
                onReply={handleReplyToComment}
                onAgree={handleAgreeNote}
                onDisagree={handleDisagreeNote}
                onEcho={handleEchoNote}
                onShare={handleShareNote}
                depth={0}
              />
            ))
        ) : (
          <div className="text-center py-6 sm:py-8 text-[var(--text)]">
            <ChatBubbleLeftIcon className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-[var(--accent)]/40" />
            <p className="font-open-sans text-sm sm:text-base">No notes yet. Be the first to share your thoughts!</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default CommentsSection;
