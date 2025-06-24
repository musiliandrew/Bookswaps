import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PencilSquareIcon, BookOpenIcon, TagIcon, PhotoIcon, ExclamationTriangleIcon, SparklesIcon } from '@heroicons/react/24/outline';

const PostCreationForm = ({ newPost, setNewPost, handleCreatePost }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const inputClasses = "w-full px-4 py-3 bookish-input rounded-xl border-0 bg-white/10 backdrop-blur-sm text-primary placeholder-primary/60 focus:bg-white/20 transition-all duration-300";
  const labelClasses = "flex items-center space-x-2 text-sm font-medium text-primary mb-2";

  const postTypes = [
    { value: 'Article', label: '📝 Article', description: 'Share detailed thoughts' },
    { value: 'Synopsis', label: '📖 Synopsis', description: 'Book summary or review' },
    { value: 'Query', label: '❓ Query', description: 'Ask the community' },
  ];

  return (
    <motion.div
      className="bookish-glass rounded-2xl p-6 border border-white/20 mb-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl">
            <PencilSquareIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="text-2xl font-lora font-bold text-primary">Create a Post</h3>
            <p className="text-sm text-primary/70">Share your thoughts with the community</p>
          </div>
        </div>

        <motion.button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-primary/70 hover:text-primary transition-colors duration-200 lg:hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </motion.button>
      </motion.div>

      <form onSubmit={handleCreatePost} className={`space-y-6 ${isExpanded ? 'block' : 'hidden lg:block'}`}>
        {/* Title and Content */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div>
            <label className={labelClasses}>
              <PencilSquareIcon className="w-4 h-4" />
              <span>Title *</span>
            </label>
            <input
              type="text"
              value={newPost.title}
              onChange={e => setNewPost({ ...newPost, title: e.target.value })}
              className={inputClasses}
              placeholder="What's on your mind?"
              required
            />
          </div>

          <div>
            <label className={labelClasses}>
              <BookOpenIcon className="w-4 h-4" />
              <span>Content *</span>
            </label>
            <textarea
              value={newPost.content}
              onChange={e => setNewPost({ ...newPost, content: e.target.value })}
              className={`${inputClasses} min-h-[120px] resize-none`}
              placeholder="Share your thoughts, insights, or questions..."
              rows={5}
              required
            />
          </div>
        </motion.div>

        {/* Post Type and Book ID */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div>
            <label className={labelClasses}>
              <SparklesIcon className="w-4 h-4" />
              <span>Post Type</span>
            </label>
            <select
              value={newPost.type}
              onChange={e => setNewPost({ ...newPost, type: e.target.value })}
              className={inputClasses}
            >
              {postTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label} - {type.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClasses}>
              <BookOpenIcon className="w-4 h-4" />
              <span>Book ID (Optional)</span>
            </label>
            <input
              type="text"
              value={newPost.book_id}
              onChange={e => setNewPost({ ...newPost, book_id: e.target.value })}
              className={inputClasses}
              placeholder="Link to a specific book"
            />
          </div>
        </motion.div>

        {/* Tags and Media */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <div>
            <label className={labelClasses}>
              <TagIcon className="w-4 h-4" />
              <span>Tags</span>
            </label>
            <input
              type="text"
              value={newPost.tags}
              onChange={e => setNewPost({ ...newPost, tags: e.target.value })}
              className={inputClasses}
              placeholder="fiction, mystery, thriller (comma-separated)"
            />
          </div>

          <div>
            <label className={labelClasses}>
              <PhotoIcon className="w-4 h-4" />
              <span>Media URLs</span>
            </label>
            <input
              type="text"
              value={newPost.media_urls}
              onChange={e => setNewPost({ ...newPost, media_urls: e.target.value })}
              className={inputClasses}
              placeholder="Image or video URLs (comma-separated)"
            />
          </div>
        </motion.div>

        {/* Spoiler Warning and Submit */}
        <motion.div
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <motion.label
            className="flex items-center p-3 bg-white/10 rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <input
              type="checkbox"
              checked={newPost.spoiler}
              onChange={e => setNewPost({ ...newPost, spoiler: e.target.checked })}
              className="checkbox-enhanced mr-3"
            />
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-amber-600" />
              <span className="font-medium text-primary">Contains Spoilers</span>
            </div>
          </motion.label>

          <motion.button
            type="submit"
            className="bookish-button-enhanced px-8 py-3 rounded-xl text-white font-semibold shadow-lg"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            ✨ Create Post
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  );
};

export default PostCreationForm;