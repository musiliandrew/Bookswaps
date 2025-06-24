import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  PencilSquareIcon, 
  BookOpenIcon, 
  TagIcon,
  PhotoIcon,
  EyeSlashIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';

const PostCreationModal = ({ isOpen, onClose, onCreatePost, isLoading, initialPostType = 'Article' }) => {
  const [postData, setPostData] = useState({
    title: '',
    content: '',
    type: initialPostType,
    book_id: '',
    tags: '',
    media_urls: '',
    spoiler: false
  });

  const [charCount, setCharCount] = useState(0);
  const [step, setStep] = useState(1);
  const maxChars = 2000;

  const postTypes = [
    { 
      value: 'Article', 
      label: '📝 Article', 
      description: 'Share detailed thoughts and insights',
      icon: PencilSquareIcon,
      color: 'from-blue-500 to-indigo-600'
    },
    { 
      value: 'Synopsis', 
      label: '📖 Synopsis', 
      description: 'Book reviews and summaries',
      icon: BookOpenIcon,
      color: 'from-green-500 to-emerald-600'
    },
    { 
      value: 'Query', 
      label: '❓ Query', 
      description: 'Ask questions to the community',
      icon: SparklesIcon,
      color: 'from-purple-500 to-pink-600'
    },
  ];

  useEffect(() => {
    setCharCount(postData.content.length);
  }, [postData.content]);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setPostData({
        title: '',
        content: '',
        type: initialPostType,
        book_id: '',
        tags: '',
        media_urls: '',
        spoiler: false
      });
      setStep(1);
    }
  }, [isOpen, initialPostType]);

  // Update post type when initialPostType changes
  useEffect(() => {
    if (isOpen) {
      setPostData(prev => ({ ...prev, type: initialPostType }));
    }
  }, [initialPostType, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!postData.title.trim() || !postData.content.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    const formattedData = {
      ...postData,
      tags: postData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      media_urls: postData.media_urls.split(',').map(url => url.trim()).filter(url => url),
    };

    const success = await onCreatePost(formattedData);
    if (success) {
      onClose();
      toast.success('🎉 Post created successfully!');
    }
  };

  const nextStep = () => {
    if (step === 1 && (!postData.title.trim() || !postData.content.trim())) {
      toast.error('Please fill in title and content first');
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl">
                    <PencilSquareIcon className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Create New Post</h2>
                    <p className="text-sm text-gray-500">Step {step} of 2</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="h-1 bg-gray-100">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                  initial={{ width: '50%' }}
                  animate={{ width: step === 1 ? '50%' : '100%' }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {/* Post Type Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Choose Post Type
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {postTypes.map((type) => {
                          const IconComponent = type.icon;
                          return (
                            <motion.button
                              key={type.value}
                              type="button"
                              onClick={() => setPostData({ ...postData, type: type.value })}
                              className={`p-4 rounded-xl border-2 transition-all ${
                                postData.type === type.value
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className={`w-8 h-8 mx-auto mb-2 p-1.5 rounded-lg bg-gradient-to-br ${type.color}`}>
                                <IconComponent className="w-full h-full text-white" />
                              </div>
                              <div className="text-sm font-medium text-gray-900">{type.label}</div>
                              <div className="text-xs text-gray-500 mt-1">{type.description}</div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={postData.title}
                        onChange={(e) => setPostData({ ...postData, title: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="What's your post about?"
                        maxLength={200}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {postData.title.length}/200 characters
                      </div>
                    </div>

                    {/* Content */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Content *
                      </label>
                      <textarea
                        value={postData.content}
                        onChange={(e) => setPostData({ ...postData, content: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                        placeholder="Share your thoughts, insights, or questions..."
                        rows={8}
                        maxLength={maxChars}
                      />
                      <div className={`text-xs mt-1 ${charCount > maxChars * 0.9 ? 'text-red-500' : 'text-gray-500'}`}>
                        {charCount}/{maxChars} characters
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {/* Tags */}
                    <div>
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                        <TagIcon className="w-4 h-4" />
                        <span>Tags (optional)</span>
                      </label>
                      <input
                        type="text"
                        value={postData.tags}
                        onChange={(e) => setPostData({ ...postData, tags: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="fiction, mystery, thriller (comma-separated)"
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        Add relevant tags to help others discover your post
                      </div>
                    </div>

                    {/* Media URLs */}
                    <div>
                      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                        <PhotoIcon className="w-4 h-4" />
                        <span>Media URLs (optional)</span>
                      </label>
                      <input
                        type="text"
                        value={postData.media_urls}
                        onChange={(e) => setPostData({ ...postData, media_urls: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="https://example.com/image.jpg (comma-separated)"
                      />
                    </div>

                    {/* Spoiler Warning */}
                    <div>
                      <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={postData.spoiler}
                          onChange={(e) => setPostData({ ...postData, spoiler: e.target.checked })}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="flex items-center space-x-2">
                          <EyeSlashIcon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">Contains Spoilers</span>
                        </div>
                      </label>
                      <div className="text-xs text-gray-500 mt-1 ml-7">
                        Check this if your post contains plot spoilers
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
                      <div className="bg-white rounded-lg p-4 border">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {postData.type}
                          </span>
                          {postData.spoiler && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                              Spoiler
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">{postData.title || 'Your title here...'}</h3>
                        <p className="text-gray-600 text-sm">
                          {postData.content ? postData.content.substring(0, 150) + '...' : 'Your content here...'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                  <div className="flex space-x-3">
                    {step > 1 && (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        ← Back
                      </button>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Cancel
                    </button>

                    {step < 2 ? (
                      <motion.button
                        type="button"
                        onClick={nextStep}
                        className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Next →
                      </motion.button>
                    ) : (
                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {isLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Creating...</span>
                          </div>
                        ) : (
                          '✨ Create Post'
                        )}
                      </motion.button>
                    )}
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PostCreationModal;
