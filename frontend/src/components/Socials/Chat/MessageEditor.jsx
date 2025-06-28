import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../../../hooks/useChat';
import { toast } from 'react-toastify';
import {
  CheckIcon,
  XMarkIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

const MessageEditor = ({ 
  message, 
  isEditing, 
  onStartEdit, 
  onCancelEdit, 
  onSaveEdit,
  canEdit = false 
}) => {
  const { editMessage, isLoading } = useChat();
  const [editContent, setEditContent] = useState(message?.content || '');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(editContent.length, editContent.length);
    }
  }, [isEditing, editContent.length]);

  useEffect(() => {
    setEditContent(message?.content || '');
  }, [message?.content]);

  const handleSave = async () => {
    if (!editContent.trim()) {
      toast.error('Message cannot be empty');
      return;
    }

    if (editContent.trim() === message.content.trim()) {
      onCancelEdit();
      return;
    }

    try {
      const result = await editMessage(message.chat_id, { content: editContent.trim() });
      if (result) {
        toast.success('Message updated successfully');
        onSaveEdit?.(result);
      }
    } catch (error) {
      toast.error('Failed to update message');
      console.error('Message edit error:', error);
    }
  };

  const handleCancel = () => {
    setEditContent(message?.content || '');
    onCancelEdit();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!message) return null;

  return (
    <div className="relative">
      {isEditing ? (
        /* Edit Mode */
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3"
        >
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-primary resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50"
              rows={Math.max(2, editContent.split('\n').length)}
              placeholder="Edit your message..."
              disabled={isLoading}
            />
            
            {/* Character count */}
            <div className="absolute bottom-2 right-2 text-xs text-primary/50">
              {editContent.length}/1000
            </div>
          </div>

          {/* Edit Actions */}
          <div className="flex items-center gap-2">
            <motion.button
              onClick={handleSave}
              disabled={isLoading || !editContent.trim() || editContent.trim() === message.content.trim()}
              className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 disabled:bg-green-500/50 text-white text-sm rounded-lg transition-colors disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <CheckIcon className="w-4 h-4" />
              {isLoading ? 'Saving...' : 'Save'}
            </motion.button>
            
            <motion.button
              onClick={handleCancel}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1.5 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-500/50 text-white text-sm rounded-lg transition-colors disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <XMarkIcon className="w-4 h-4" />
              Cancel
            </motion.button>
            
            <div className="text-xs text-primary/50 ml-2">
              Press Enter to save, Esc to cancel
            </div>
          </div>
        </motion.div>
      ) : (
        /* Display Mode */
        <div className="group relative">
          {/* Message Content */}
          <div className="whitespace-pre-wrap break-words">
            {message.content}
            {message.edited_at && message.edited_at !== message.created_at && (
              <span className="text-xs text-primary/50 ml-2 italic">
                (edited)
              </span>
            )}
          </div>

          {/* Edit Button */}
          {canEdit && (
            <motion.button
              onClick={onStartEdit}
              className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 p-1 bg-white/10 hover:bg-white/20 rounded text-primary/70 hover:text-primary transition-all duration-200"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Edit message"
            >
              <PencilIcon className="w-3 h-3" />
            </motion.button>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageEditor;
