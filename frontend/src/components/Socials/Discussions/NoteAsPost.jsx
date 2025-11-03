import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  UserIcon,
  ClockIcon,
  ChatBubbleLeftIcon,
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
import SmartTextRenderer from '../../Common/SmartTextRenderer';
import EnhancedReactionBar from './EnhancedReactionBar';

const NoteAsPost = ({
  note,
  originalPost,
  onAgree,
  onDisagree,
  onEcho,
  onShare,
  onReply,
  currentUser
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isOwnNote = currentUser && note.user && currentUser.user_id === note.user.user_id;

  // Create a post-like object for the reaction bar
  const noteAsPostData = {
    discussion_id: note.note_id,
    upvotes: note.agree_count || 0,
    downvotes: note.disagree_count || 0,
    reprint_count: note.echo_count || 0,
    note_count: note.reply_count || 0,
    is_upvoted: note.is_agreed,
    is_downvoted: note.is_disagreed
  };

  return (
    <motion.div
      className="card rounded-2xl border border-white/20 hover:border-white/30 transition-all duration-300 overflow-hidden shadow-elevated group relative mobile-post-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.01 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Post Header */}
      <div className="bg-gradient-to-r from-[var(--primary)]/5 to-[var(--accent)]/5 px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[var(--accent)] to-[var(--dark-accent)] rounded-full flex items-center justify-center">
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
            <div>
              <div className="flex items-center space-x-2">
                <Link 
                  to={`/profile/${note.user?.username}`}
                  className="font-semibold text-[var(--dark-primary)] text-sm sm:text-base font-lora hover:text-[var(--accent)] transition-colors"
                >
                  {note.user?.username || 'Anonymous'}
                </Link>
                <span className="text-xs text-[var(--text)] font-open-sans">
                  {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                </span>
              </div>
              {/* Twitter-style "Replying to" */}
              <div className="text-xs text-[var(--text)] font-open-sans mt-1">
                Replying to{' '}
                <Link 
                  to={`/discussions/post/${originalPost.discussion_id}`}
                  className="text-[var(--accent)] hover:underline"
                >
                  @{originalPost.user?.username}'s post
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Note Content */}
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <SmartTextRenderer 
          text={note.content}
          className="text-[var(--dark-primary)] text-sm sm:text-base leading-relaxed font-open-sans"
        />
      </div>

      {/* Original Post Preview - Quoted */}
      <div className="mx-4 sm:mx-6 mb-4 border border-[var(--accent)]/20 rounded-lg overflow-hidden">
        <div className="bg-[var(--accent)]/5 px-3 py-2 border-b border-[var(--accent)]/10">
          <div className="flex items-center space-x-2 text-xs text-[var(--text)]">
            <ChatBubbleLeftIcon className="w-3 h-3" />
            <span>Original post by @{originalPost.user?.username}</span>
          </div>
        </div>
        <div className="p-3">
          <h4 className="font-medium text-[var(--dark-primary)] text-sm font-lora mb-1">
            {originalPost.title}
          </h4>
          <p className="text-xs text-[var(--text)] font-open-sans line-clamp-2">
            {originalPost.content?.substring(0, 100)}...
          </p>
        </div>
      </div>

      {/* Exact same reaction bar as posts */}
      <EnhancedReactionBar
        post={noteAsPostData}
        onAgree={() => onAgree && onAgree(note.note_id)}
        onDisagree={() => onDisagree && onDisagree(note.note_id)}
        onReprint={() => onEcho && onEcho(note)}
        onBookmark={() => {}} // Notes don't have bookmarks
        onToggleComments={() => onReply && onReply(note)}
        isAgreed={note.is_agreed}
        isDisagreed={note.is_disagreed}
        isBookmarked={false}
        showComments={true}
      />
    </motion.div>
  );
};

export default NoteAsPost;
