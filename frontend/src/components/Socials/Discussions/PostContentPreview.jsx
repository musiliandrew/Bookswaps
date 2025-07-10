import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const PostContentPreview = ({ 
  content, 
  maxLength = 200, 
  showFullContent = false,
  className = "",
  expandable = true 
}) => {
  const [isExpanded, setIsExpanded] = useState(showFullContent);
  
  if (!content) return null;
  
  // Strip HTML tags for length calculation and display
  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const textContent = stripHtml(content);
  const shouldTruncate = textContent.length > maxLength && !showFullContent;
  const displayContent = shouldTruncate && !isExpanded
    ? textContent.substring(0, maxLength) + '...'
    : textContent;
  
  const canExpand = expandable && textContent.length > maxLength && !showFullContent;

  return (
    <div className={`relative ${className}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={isExpanded ? 'expanded' : 'collapsed'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="prose prose-sm max-w-none text-primary/80 leading-relaxed font-open-sans"
        >
          {displayContent}
        </motion.div>
      </AnimatePresence>
      
      {canExpand && (
        <motion.button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="inline-flex items-center space-x-1 text-accent hover:text-accent/80 font-medium text-sm mt-2 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>{isExpanded ? 'Show less' : 'Read more'}</span>
          {isExpanded ? (
            <ChevronUpIcon className="w-4 h-4" />
          ) : (
            <ChevronDownIcon className="w-4 h-4" />
          )}
        </motion.button>
      )}
    </div>
  );
};

export default PostContentPreview;
