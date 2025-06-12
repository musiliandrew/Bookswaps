import { useState } from 'react';
import { motion } from 'framer-motion';
import EmojiPicker from 'emoji-picker-react';
import { toast } from 'react-toastify';
import Input from '../Common/Input';
import Button from '../Common/Button';
import { FaceSmileIcon } from '@heroicons/react/24/outline';

const MessageInput = ({ onSend, isLoading, className = '' }) => {
  const [content, setContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Message is required');
      return;
    }
    try {
      await onSend(content);
      setContent('');
    } catch {
      toast.error('Failed to send message');
    }
  };

  const onEmojiClick = (emojiObject) => {
    setContent((prev) => prev + emojiObject.emoji);
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={`bookish-glass p-4 rounded-xl ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center gap-2">
        <Input
          placeholder="Type a message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="bookish-input flex-grow"
          type="textarea"
          rows={2}
        />
        <Button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="bookish-button-enhanced bg-gray-600 text-white"
        >
          <FaceSmileIcon className="w-5 h-5" />
        </Button>
        <Button
          type="submit"
          text="Send"
          className="bookish-button-enhanced bg-[var(--accent)] text-white"
          disabled={isLoading || !content.trim()}
          isLoading={isLoading}
        />
      </div>
      {showEmojiPicker && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute bottom-12 right-0 z-10"
        >
          <EmojiPicker onEmojiClick={onEmojiClick} />
        </motion.div>
      )}
    </motion.form>
  );
};

export default MessageInput;