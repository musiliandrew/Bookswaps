import { useState } from 'react';
import { motion } from 'framer-motion';
import EmojiPicker from 'emoji-picker-react';
import { FaceSmileIcon } from '@heroicons/react/24/outline';

const ReactionButton = ({ onReact, className = '' }) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleEmojiClick = (emojiObject) => {
    onReact(emojiObject.emoji);
    setShowPicker(false);
  };

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <button
        onClick={() => setShowPicker((prev) => !prev)}
        className="p-1 rounded-full hover:bg-[var(--secondary)]"
      >
        <FaceSmileIcon className="w-4 h-4 text-[var(--accent)]" />
      </button>
      {showPicker && (
        <motion.div
          className="absolute z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </motion.div>
      )}
    </motion.div>
  );
};

export default ReactionButton;