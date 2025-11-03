import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  PencilSquareIcon,
  BookOpenIcon,
  TagIcon,
  PhotoIcon,
  EyeSlashIcon,
  SparklesIcon,
  MagnifyingGlassIcon,
  HashtagIcon,
  UserGroupIcon,
  ChatBubbleBottomCenterTextIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-toastify';
import { useLibrary } from '../../../hooks/useLibrary';

const PostCreationModal = ({ isOpen, onClose, onCreatePost, isLoading, initialPostType = 'Article' }) => {
  const { searchBooks, searchResults } = useLibrary();
  const [postData, setPostData] = useState({
    title: '',
    content: '',
    type: initialPostType,
    book_id: null,
    book_context: {
      chapter: '',
      page_range: '',
      quote: ''
    },
    tags: [],
    media_urls: '',
    spoiler_flag: false
  });

  const [charCount, setCharCount] = useState(0);
  const [step, setStep] = useState(1);
  const [bookSearch, setBookSearch] = useState('');
  const [showBookSearch, setShowBookSearch] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const maxChars = 2000;

  // Enhanced reaction types for the community
  const reactionTypes = [
    { emoji: '💡', label: 'Insightful', color: 'text-yellow-600' },
    { emoji: '😭', label: 'Emotional', color: 'text-blue-600' },
    { emoji: '🔥', label: 'Controversial', color: 'text-red-600' },
    { emoji: '🧠', label: 'Mind-blowing', color: 'text-purple-600' },
    { emoji: '🧩', label: 'Confusing', color: 'text-gray-600' },
    { emoji: '❤️', label: 'Loved it', color: 'text-pink-600' },
    { emoji: '📚', label: 'Educational', color: 'text-green-600' }
  ];

  const postTypes = [
    {
      value: 'Article',
      label: '📝 Article',
      description: 'Share detailed thoughts and insights',
      icon: PencilSquareIcon,
      gradient: 'from-primary to-primary/80'
    },
    {
      value: 'Synopsis',
      label: '📖 Synopsis',
      description: 'Book reviews and summaries',
      icon: BookOpenIcon,
      gradient: 'from-accent to-accent/80'
    },
    {
      value: 'Query',
      label: '❓ Query',
      description: 'Ask questions to the community',
      icon: SparklesIcon,
      gradient: 'from-primary/70 to-accent/70'
    }
  ];

  // Predefined tag categories for readers
  const tagCategories = {
    themes: [
      'Love', 'Friendship', 'Betrayal', 'Redemption', 'Coming of Age',
      'Good vs Evil', 'Identity', 'Family', 'Power', 'Justice', 'Sacrifice'
    ],
    characters: [
      'Protagonist', 'Antagonist', 'Supporting Cast', 'Character Development',
      'Relationships', 'Motivations', 'Backstory', 'Character Arc'
    ],
    style: [
      'Writing Style', 'Pacing', 'Dialogue', 'World Building', 'Plot Twist',
      'Narrative Structure', 'Point of View', 'Symbolism', 'Foreshadowing'
    ]
  };

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
        book_id: null,
        book_context: {
          chapter: '',
          page_range: '',
          quote: ''
        },
        tags: [],
        media_urls: '',
        spoiler_flag: false
      });
      setStep(1);
      setSelectedBook(null);
      setBookSearch('');
      setShowBookSearch(false);
    }
  }, [isOpen, initialPostType]);

  // Update post type when initialPostType changes
  useEffect(() => {
    if (isOpen) {
      setPostData(prev => ({ ...prev, type: initialPostType }));
    }
  }, [initialPostType, isOpen]);

  // Book search functionality
  const handleBookSearch = async (query) => {
    setBookSearch(query);
    if (query.length > 2) {
      try {
        await searchBooks({ query: query }, 1);
      } catch (error) {
        console.error('Book search failed:', error);
      }
    }
  };

  const selectBook = (book) => {
    setSelectedBook(book);
    setPostData({ ...postData, book_id: book.book_id });
    setShowBookSearch(false);
    setBookSearch(book.title);
  };

  // Tag management
  const addTag = (category, tag) => {
    const categoryKey = `${category}_tags`;
    if (!postData[categoryKey].includes(tag)) {
      setPostData({
        ...postData,
        [categoryKey]: [...postData[categoryKey], tag]
      });
    }
  };

  const removeTag = (category, tag) => {
    const categoryKey = `${category}_tags`;
    setPostData({
      ...postData,
      [categoryKey]: postData[categoryKey].filter(t => t !== tag)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!postData.title.trim() || !postData.content.trim()) {
      toast.error('Please fill in both title and content');
      return;
    }

    // Validate book requirement based on post type
    if ((postData.type === 'Synopsis' || postData.type === 'Query') && !postData.book_id) {
      toast.error(`Please select a book for ${postData.type} posts`);
      return;
    }



    const formattedData = {
      ...postData,
      // For Articles, book_id must be null. For Synopsis/Query, use selected book_id
      book_id: postData.type === 'Article' ? null : postData.book_id,
      tags: postData.tags.slice(0, 5), // Limit to 5 tags
      media_urls: postData.media_urls ? postData.media_urls.split(',').map(url => url.trim()).filter(url => url) : [],
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

    if (step === 2 && (postData.type === 'Synopsis' || postData.type === 'Query') && !postData.book_id) {
      toast.error(`Please select a book for ${postData.type} posts`);
      return;
    }

    if (step < 3) {
      setStep(step + 1);
    }
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
            <div className="bg-[var(--secondary)] rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-2xl lg:max-w-3xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden border border-[var(--primary)]/20 mx-2 sm:mx-4">
              {/* Header - Mobile Optimized */}
              <div className="flex items-center justify-between p-3 sm:p-4 border-b border-[var(--primary)]/20 flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20 rounded-lg">
                    <PencilSquareIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-lora font-bold text-[var(--primary)]">Create Post</h2>
                    <p className="text-xs text-[var(--primary)]/70 font-open-sans">
                      Step {step} of 3
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 hover:bg-[var(--primary)]/10 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  <XMarkIcon className="w-5 h-5 text-[var(--primary)]/70" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 sm:h-2 bg-[var(--primary)]/20">
                <motion.div
                  className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]"
                  initial={{ width: '33%' }}
                  animate={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Content - Mobile Optimized */}
              <div className="flex-1 overflow-y-auto">
                <form onSubmit={handleSubmit} className="p-3 sm:p-4 space-y-2.5 sm:space-y-3">
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-2.5 sm:space-y-3"
                  >
                    {/* Post Type Selection - Compact Dropdown */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[var(--primary)] mb-1.5 font-open-sans">
                        Post Type
                      </label>
                      <div className="relative">
                        <select
                          value={postData.type}
                          onChange={(e) => setPostData({ ...postData, type: e.target.value })}
                          className="w-full px-3 py-2.5 bg-white/80 border border-[var(--primary)]/20 rounded-xl text-[var(--primary)] font-open-sans text-sm focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 appearance-none cursor-pointer"
                        >
                          {postTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                              {type.label} - {type.description}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <svg className="w-4 h-4 text-[var(--primary)]/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                      {/* Selected Type Info */}
                      <div className="mt-2 p-2 bg-[var(--primary)]/5 rounded-lg border border-[var(--primary)]/10">
                        <div className="flex items-center space-x-2">
                          {(() => {
                            const selectedType = postTypes.find(t => t.value === postData.type);
                            const IconComponent = selectedType?.icon;
                            return (
                              <>
                                {IconComponent && <IconComponent className="w-4 h-4 text-[var(--primary)]" />}
                                <span className="text-xs text-[var(--primary)]/70 font-open-sans">
                                  {selectedType?.description}
                                </span>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    {/* Debate Question (if Debate type selected) */}
                    {postData.type === 'Debate' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-error/10 border border-error/20 rounded-xl p-4"
                      >
                        <label className="block text-sm font-medium text-error mb-2 font-open-sans">
                          Debate Question *
                        </label>
                        <input
                          type="text"
                          value={postData.debate_question}
                          onChange={(e) => setPostData({ ...postData, debate_question: e.target.value })}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 input rounded-xl font-open-sans text-sm sm:text-base mobile-form-input"
                          placeholder="e.g., Did the protagonist make the right choice?"
                          maxLength={200}
                        />
                        <p className="text-xs text-error/70 mt-2">
                          This will create two sides for readers to argue their positions.
                        </p>
                      </motion.div>
                    )}

                    {/* Title */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[var(--primary)] mb-1.5 font-open-sans">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={postData.title}
                        onChange={(e) => setPostData({ ...postData, title: e.target.value })}
                        className="w-full px-3 py-2.5 input rounded-xl font-open-sans text-sm bg-white/80 border border-[var(--primary)]/20 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                        placeholder="What's your post about?"
                        maxLength={200}
                      />
                      <div className="text-xs text-[var(--primary)]/60 mt-1 font-open-sans">
                        {postData.title.length}/200 characters
                      </div>
                    </div>

                    {/* Content */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-[var(--primary)] mb-1.5 font-open-sans">
                        Content *
                      </label>
                      <textarea
                        value={postData.content}
                        onChange={(e) => setPostData({ ...postData, content: e.target.value })}
                        className="w-full px-3 py-2.5 input rounded-xl font-open-sans resize-none text-sm bg-white/80 border border-[var(--primary)]/20 focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                        placeholder="Share your thoughts, insights, or questions..."
                        rows={3}
                        maxLength={maxChars}
                      />
                      <div className={`text-xs mt-1 font-open-sans ${charCount > maxChars * 0.9 ? 'text-error' : 'text-[var(--primary)]/60'}`}>
                        {charCount}/{maxChars} characters
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    {/* Book Selection */}
                    <div>
                      <label className="flex items-center space-x-2 text-sm font-medium text-primary mb-3 font-open-sans">
                        <BookOpenIcon className="w-4 h-4" />
                        <span>
                          {postData.type === 'Article'
                            ? 'Link to Book (optional)'
                            : `Select Book (required for ${postData.type})`
                          }
                        </span>
                        {(postData.type === 'Synopsis' || postData.type === 'Query') && (
                          <span className="text-error text-xs">*</span>
                        )}
                      </label>

                      <div className="relative">
                        <input
                          type="text"
                          value={bookSearch}
                          onChange={(e) => handleBookSearch(e.target.value)}
                          onFocus={() => setShowBookSearch(true)}
                          className="w-full px-4 py-3 input rounded-xl font-open-sans pr-10"
                          placeholder={
                            postData.type === 'Article'
                              ? "Search for a book to link your discussion (optional)..."
                              : `Search for the book for your ${postData.type.toLowerCase()}...`
                          }
                        />
                        <MagnifyingGlassIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary/50" />

                        {/* Book Search Results */}
                        {showBookSearch && searchResults && searchResults.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute z-10 w-full mt-2 bg-white/95 backdrop-blur-sm border border-white/30 rounded-xl shadow-lg max-h-60 overflow-y-auto"
                          >
                            {searchResults.slice(0, 5).map((book) => (
                              <button
                                key={book.book_id}
                                type="button"
                                onClick={() => selectBook(book)}
                                className="w-full p-3 text-left hover:bg-primary/10 transition-colors border-b border-white/20 last:border-b-0"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className="w-8 h-10 bg-accent/20 rounded flex items-center justify-center">
                                    <span className="text-xs">📚</span>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-primary truncate">{book.title}</p>
                                    <p className="text-xs text-primary/60 truncate">{book.author}</p>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </div>

                      {/* Selected Book Display */}
                      {selectedBook && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="mt-3 p-4 bg-accent/10 border border-accent/20 rounded-xl"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-12 bg-accent/30 rounded flex items-center justify-center">
                                <span className="text-sm">📚</span>
                              </div>
                              <div>
                                <p className="font-medium text-primary">{selectedBook.title}</p>
                                <p className="text-sm text-primary/70">{selectedBook.author}</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedBook(null);
                                setPostData({ ...postData, book_id: null });
                                setBookSearch('');
                              }}
                              className="p-1 hover:bg-accent/20 rounded-full transition-colors"
                            >
                              <XMarkIcon className="w-4 h-4 text-primary/70" />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Contextual Discussion Features */}
                    {selectedBook && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-4"
                      >
                        <h4 className="text-sm font-medium text-primary font-open-sans">
                          📍 Make it contextual (optional)
                        </h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Chapter */}
                          <div>
                            <label className="block text-xs font-medium text-primary/70 mb-2 font-open-sans">
                              Chapter/Section
                            </label>
                            <input
                              type="text"
                              value={postData.book_context.chapter}
                              onChange={(e) => setPostData({
                                ...postData,
                                book_context: { ...postData.book_context, chapter: e.target.value }
                              })}
                              className="w-full px-3 py-2 input rounded-lg text-sm font-open-sans"
                              placeholder="e.g., Chapter 3, Part II"
                            />
                          </div>

                          {/* Page Range */}
                          <div>
                            <label className="block text-xs font-medium text-primary/70 mb-2 font-open-sans">
                              Page Range
                            </label>
                            <input
                              type="text"
                              value={postData.book_context.page_range}
                              onChange={(e) => setPostData({
                                ...postData,
                                book_context: { ...postData.book_context, page_range: e.target.value }
                              })}
                              className="w-full px-3 py-2 input rounded-lg text-sm font-open-sans"
                              placeholder="e.g., 45-52, p.123"
                            />
                          </div>
                        </div>

                        {/* Quote */}
                        <div>
                          <label className="block text-xs font-medium text-primary/70 mb-2 font-open-sans">
                            Quote/Passage (for quote anchoring)
                          </label>
                          <textarea
                            value={postData.book_context.quote}
                            onChange={(e) => setPostData({
                              ...postData,
                              book_context: { ...postData.book_context, quote: e.target.value }
                            })}
                            className="w-full px-3 py-2 input rounded-lg text-sm font-open-sans resize-none"
                            placeholder="Paste a specific quote or passage you want to discuss..."
                            rows={3}
                            maxLength={500}
                          />
                          <p className="text-xs text-primary/60 mt-1 font-open-sans">
                            This helps readers understand exactly what you're referring to
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Media URLs */}
                    <div>
                      <label className="flex items-center space-x-2 text-sm font-medium text-primary mb-2 font-open-sans">
                        <PhotoIcon className="w-4 h-4" />
                        <span>Media URLs (optional)</span>
                      </label>
                      <input
                        type="text"
                        value={postData.media_urls}
                        onChange={(e) => setPostData({ ...postData, media_urls: e.target.value })}
                        className="w-full px-4 py-3 input rounded-xl font-open-sans"
                        placeholder="https://example.com/image.jpg (comma-separated)"
                      />
                    </div>

                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-3 sm:space-y-4"
                  >
                    {/* Simplified Tagging System */}
                    <div className="space-y-3">
                      <h4 className="text-base sm:text-lg font-medium text-[var(--primary)] font-lora">
                        🏷️ Tags & Settings
                      </h4>

                      {/* Simplified Tags Input */}
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-[var(--primary)] mb-1.5 font-open-sans">
                          Tags (optional)
                        </label>
                        <input
                          type="text"
                          value={postData.tags.join(', ')}
                          onChange={(e) => {
                            const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                            setPostData({ ...postData, tags });
                          }}
                          placeholder="e.g., romance, mystery, character-development"
                          className="w-full px-3 py-2.5 bg-white/80 border border-[var(--primary)]/20 rounded-xl text-[var(--primary)] font-open-sans text-sm focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                        />
                        <p className="text-xs text-[var(--primary)]/60 mt-1 font-open-sans">
                          Separate tags with commas. Max 5 tags.
                        </p>
                        {postData.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {postData.tags.slice(0, 5).map((tag, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 text-xs bg-[var(--primary)]/10 text-[var(--primary)] rounded-full"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newTags = postData.tags.filter((_, i) => i !== index);
                                    setPostData({ ...postData, tags: newTags });
                                  }}
                                  className="ml-1 hover:text-red-500"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Simplified Spoiler Settings */}
                    <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={postData.spoiler_flag}
                          onChange={(e) => setPostData({ ...postData, spoiler_flag: e.target.checked })}
                          className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500/50"
                        />
                        <span className="text-sm font-medium text-red-700">⚠️ Contains Spoilers</span>
                      </label>
                      {postData.spoiler_flag && (
                        <p className="text-xs text-red-600 mt-1 ml-6">
                          Your post will be marked with a spoiler warning
                        </p>
                      )}
                    </div>


                  </motion.div>
                )}

                {/* Footer - Mobile Optimized */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2 sm:mt-3 pt-2.5 sm:pt-3 border-t border-[var(--primary)]/20 space-y-2 sm:space-y-0 bg-[var(--secondary)] -mx-3 sm:-mx-4 px-3 sm:px-4">
                  <div className="flex space-x-2">
                    {step > 1 && (
                      <motion.button
                        type="button"
                        onClick={prevStep}
                        className="px-3 py-2 text-[var(--primary)]/70 hover:text-[var(--primary)] transition-colors font-open-sans text-sm min-h-[44px]"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        ← Back
                      </motion.button>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-3 py-2 text-[var(--primary)]/70 hover:text-[var(--primary)] transition-colors font-open-sans text-sm min-h-[44px]"
                    >
                      Cancel
                    </button>

                    {step < 3 ? (
                      <motion.button
                        type="button"
                        onClick={nextStep}
                        className="px-4 py-2 btn btn-primary text-white rounded-xl font-open-sans text-sm min-h-[44px]"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <span className="hidden sm:inline">
                          {step === 1 ? 'Add Book Context →' : 'Add Tags & Settings →'}
                        </span>
                        <span className="sm:hidden">
                          {step === 1 ? 'Next →' : 'Tags →'}
                        </span>
                      </motion.button>
                    ) : (
                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        className="px-4 py-2 btn btn-primary text-white rounded-xl font-open-sans disabled:opacity-50 text-sm min-h-[44px]"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        {isLoading ? (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Creating...</span>
                          </div>
                        ) : (
                          <span>✨ Create Post</span>
                        )}
                      </motion.button>
                    )}
                  </div>
                </div>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PostCreationModal;
