import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../../../hooks/useChat';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from 'react-toastify';
import {
  HeartIcon,
  HandThumbUpIcon,
  FaceSmileIcon,
  FireIcon,
  EyeIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartIconSolid,
  HandThumbUpIcon as HandThumbUpIconSolid,
  FaceSmileIcon as FaceSmileIconSolid,
  FireIcon as FireIconSolid
} from '@heroicons/react/24/solid';

const MessageReactions = ({ messageId, reactions = [], onReactionAdd, onReactionRemove }) => {
  const { profile } = useAuth();
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [userReactions, setUserReactions] = useState(new Set());

  const reactionTypes = [
    { 
      type: 'like', 
      icon: HandThumbUpIcon, 
      solidIcon: HandThumbUpIconSolid, 
      emoji: '👍', 
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/20'
    },
    { 
      type: 'love', 
      icon: HeartIcon, 
      solidIcon: HeartIconSolid, 
      emoji: '❤️', 
      color: 'text-red-500',
      bgColor: 'bg-red-500/20'
    },
    { 
      type: 'laugh', 
      icon: FaceSmileIcon, 
      solidIcon: FaceSmileIconSolid, 
      emoji: '😂', 
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/20'
    },
    { 
      type: 'fire', 
      icon: FireIcon, 
      solidIcon: FireIconSolid, 
      emoji: '🔥', 
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/20'
    },
    { 
      type: 'wow', 
      icon: EyeIcon, 
      solidIcon: EyeIcon, 
      emoji: '😮', 
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/20'
    }
  ];

  useEffect(() => {
    if (reactions && profile) {
      const userReactionTypes = reactions
        .filter(r => r.user?.user_id === profile.user_id)
        .map(r => r.reaction_type);
      setUserReactions(new Set(userReactionTypes));
    }
  }, [reactions, profile]);

  const handleReactionClick = async (reactionType) => {
    if (!profile) return;

    const hasReacted = userReactions.has(reactionType);
    
    try {
      if (hasReacted) {
        // Remove reaction
        await onReactionRemove?.(messageId, reactionType);
        setUserReactions(prev => {
          const newSet = new Set(prev);
          newSet.delete(reactionType);
          return newSet;
        });
      } else {
        // Add reaction
        await onReactionAdd?.(messageId, reactionType);
        setUserReactions(prev => new Set([...prev, reactionType]));
      }
    } catch (error) {
      toast.error('Failed to update reaction');
      console.error('Reaction error:', error);
    }
  };

  const getReactionCount = (reactionType) => {
    return reactions.filter(r => r.reaction_type === reactionType).length;
  };

  const getReactionUsers = (reactionType) => {
    return reactions
      .filter(r => r.reaction_type === reactionType)
      .map(r => r.user?.username || 'Unknown')
      .slice(0, 5); // Show max 5 users in tooltip
  };

  const groupedReactions = reactionTypes
    .map(reactionType => ({
      ...reactionType,
      count: getReactionCount(reactionType.type),
      users: getReactionUsers(reactionType.type),
      hasUserReacted: userReactions.has(reactionType.type)
    }))
    .filter(reaction => reaction.count > 0);

  return (
    <div className="relative">
      {/* Existing Reactions */}
      {groupedReactions.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {groupedReactions.map((reaction) => {
            const IconComponent = reaction.hasUserReacted ? reaction.solidIcon : reaction.icon;
            
            return (
              <motion.button
                key={reaction.type}
                onClick={() => handleReactionClick(reaction.type)}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-all duration-200 ${
                  reaction.hasUserReacted
                    ? `${reaction.bgColor} ${reaction.color} border border-current`
                    : 'bg-white/10 text-primary/70 hover:bg-white/20 border border-transparent'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title={`${reaction.users.join(', ')}${reaction.count > 5 ? ` and ${reaction.count - 5} others` : ''}`}
              >
                <IconComponent className="w-3 h-3" />
                <span className="font-medium">{reaction.count}</span>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Reaction Picker */}
      <div className="relative">
        <button
          onClick={() => setShowReactionPicker(!showReactionPicker)}
          className="flex items-center gap-1 px-2 py-1 text-xs text-primary/50 hover:text-primary/70 hover:bg-white/10 rounded-full transition-all duration-200"
        >
          <PlusIcon className="w-3 h-3" />
          <span>React</span>
        </button>

        <AnimatePresence>
          {showReactionPicker && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowReactionPicker(false)}
              />
              
              {/* Reaction Picker */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                className="absolute bottom-full left-0 mb-2 z-20 bookish-glass rounded-xl border border-white/20 p-2 shadow-xl"
              >
                <div className="flex gap-1">
                  {reactionTypes.map((reaction) => {
                    const hasReacted = userReactions.has(reaction.type);
                    const IconComponent = hasReacted ? reaction.solidIcon : reaction.icon;
                    
                    return (
                      <motion.button
                        key={reaction.type}
                        onClick={() => {
                          handleReactionClick(reaction.type);
                          setShowReactionPicker(false);
                        }}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          hasReacted
                            ? `${reaction.bgColor} ${reaction.color}`
                            : 'hover:bg-white/20 text-primary/70'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        title={reaction.type}
                      >
                        <IconComponent className="w-5 h-5" />
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MessageReactions;
