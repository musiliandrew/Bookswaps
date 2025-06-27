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
    theme_tags: [],
    character_tags: [],
    style_tags: [],
    media_urls: '',
    spoiler_flag: false,
    spoiler_level: 'minor' // minor, major, ending
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
        theme_tags: [],
        character_tags: [],
        style_tags: [],
        media_urls: '',
        spoiler_flag: false,
        spoiler_level: 'minor'
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
      tags: [
        ...postData.tags,
        ...postData.theme_tags,
        ...postData.character_tags,
        ...postData.style_tags
      ],
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
            <div className="bookish-glass rounded-2xl bookish-shadow w-full max-w-4xl max-h-[90vh] overflow-hidden border border-white/20">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-primary/20 to-accent/20 rounded-xl">
                    <PencilSquareIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-lora font-bold text-primary">Create New Post</h2>
                    <p className="text-sm text-primary/70 font-open-sans">
                      Step {step} of 3 - {step === 1 ? 'Content & Type' : step === 2 ? 'Book Context' : 'Tags & Settings'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <XMarkIcon className="w-5 h-5 text-primary/70" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="h-2 bg-white/20">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-accent"
                  initial={{ width: '33%' }}
                  animate={{ width: step === 1 ? '33%' : step === 2 ? '66%' : '100%' }}
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
                      <label className="block text-sm font-medium text-primary mb-3 font-open-sans">
                        Choose Post Type
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                        {postTypes.map((type) => {
                          const IconComponent = type.icon;
                          return (
                            <motion.button
                              key={type.value}
                              type="button"
                              onClick={() => setPostData({ ...postData, type: type.value })}
                              className={`p-4 rounded-xl border-2 transition-all font-open-sans ${
                                postData.type === type.value
                                  ? 'border-primary bg-primary/10 bookish-shadow'
                                  : 'border-white/30 hover:border-primary/50 hover:bg-white/20'
                              }`}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className={`w-10 h-10 mx-auto mb-3 p-2 rounded-lg bg-gradient-to-br ${type.gradient}`}>
                                <IconComponent className="w-full h-full text-white" />
                              </div>
                              <div className="text-sm font-medium text-primary">{type.label}</div>
                              <div className="text-xs text-primary/70 mt-1">{type.description}</div>
                            </motion.button>
                          );
                        })}
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
                          className="w-full px-4 py-3 bookish-input rounded-xl font-open-sans"
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
                      <label className="block text-sm font-medium text-primary mb-2 font-open-sans">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={postData.title}
                        onChange={(e) => setPostData({ ...postData, title: e.target.value })}
                        className="w-full px-4 py-3 bookish-input rounded-xl font-open-sans"
                        placeholder="What's your post about?"
                        maxLength={200}
                      />
                      <div className="text-xs text-primary/60 mt-1 font-open-sans">
                        {postData.title.length}/200 characters
                      </div>
                    </div>

                    {/* Content */}
                    <div>
                      <label className="block text-sm font-medium text-primary mb-2 font-open-sans">
                        Content *
                      </label>
                      <textarea
                        value={postData.content}
                        onChange={(e) => setPostData({ ...postData, content: e.target.value })}
                        className="w-full px-4 py-3 bookish-input rounded-xl font-open-sans resize-none"
                        placeholder="Share your thoughts, insights, or questions..."
                        rows={8}
                        maxLength={maxChars}
                      />
                      <div className={`text-xs mt-1 font-open-sans ${charCount > maxChars * 0.9 ? 'text-error' : 'text-primary/60'}`}>
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
                          className="w-full px-4 py-3 bookish-input rounded-xl font-open-sans pr-10"
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
                              className="w-full px-3 py-2 bookish-input rounded-lg text-sm font-open-sans"
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
                              className="w-full px-3 py-2 bookish-input rounded-lg text-sm font-open-sans"
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
                            className="w-full px-3 py-2 bookish-input rounded-lg text-sm font-open-sans resize-none"
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
                        className="w-full px-4 py-3 bookish-input rounded-xl font-open-sans"
                        placeholder="https://example.com/image.jpg (comma-separated)"
                      />
                    </div>

                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    {/* Enhanced Tagging System */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-primary font-lora">
                        🏷️ Tag Your Discussion
                      </h4>

                      {/* Theme Tags */}
                      <div>
                        <label className="block text-sm font-medium text-primary mb-2 font-open-sans">
                          🧵 Themes
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {tagCategories.themes.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => addTag('theme', tag)}
                              className={`px-3 py-1 text-xs rounded-full transition-all font-open-sans ${
                                postData.theme_tags.includes(tag)
                                  ? 'bg-primary text-white'
                                  : 'bg-white/50 text-primary hover:bg-primary/20'
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                        {postData.theme_tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {postData.theme_tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-1 text-xs bg-primary/20 text-primary rounded-full"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeTag('theme', tag)}
                                  className="ml-1 hover:text-error"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Character Tags */}
                      <div>
                        <label className="block text-sm font-medium text-primary mb-2 font-open-sans">
                          🧍 Characters
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {tagCategories.characters.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => addTag('character', tag)}
                              className={`px-3 py-1 text-xs rounded-full transition-all font-open-sans ${
                                postData.character_tags.includes(tag)
                                  ? 'bg-accent text-white'
                                  : 'bg-white/50 text-primary hover:bg-accent/20'
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                        {postData.character_tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {postData.character_tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-1 text-xs bg-accent/20 text-primary rounded-full"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeTag('character', tag)}
                                  className="ml-1 hover:text-error"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Style Tags */}
                      <div>
                        <label className="block text-sm font-medium text-primary mb-2 font-open-sans">
                          ✍️ Writing Style
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {tagCategories.style.map((tag) => (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => addTag('style', tag)}
                              className={`px-3 py-1 text-xs rounded-full transition-all font-open-sans ${
                                postData.style_tags.includes(tag)
                                  ? 'bg-success text-white'
                                  : 'bg-white/50 text-primary hover:bg-success/20'
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                        {postData.style_tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {postData.style_tags.map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-1 text-xs bg-success/20 text-primary rounded-full"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => removeTag('style', tag)}
                                  className="ml-1 hover:text-error"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Spoiler Management */}
                    <div className="bg-error/5 border border-error/20 rounded-xl p-4">
                      <h4 className="text-sm font-medium text-error mb-3 font-open-sans flex items-center">
                        <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                        Spoiler Settings
                      </h4>

                      <label className="flex items-center space-x-3 cursor-pointer mb-3">
                        <input
                          type="checkbox"
                          checked={postData.spoiler_flag}
                          onChange={(e) => setPostData({ ...postData, spoiler_flag: e.target.checked })}
                          className="w-4 h-4 text-error border-gray-300 rounded focus:ring-error/50"
                        />
                        <span className="text-sm font-medium text-error">Contains Spoilers</span>
                      </label>

                      {postData.spoiler_flag && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="space-y-3"
                        >
                          <div>
                            <label className="block text-xs font-medium text-error/70 mb-2 font-open-sans">
                              Spoiler Level
                            </label>
                            <select
                              value={postData.spoiler_level}
                              onChange={(e) => setPostData({ ...postData, spoiler_level: e.target.value })}
                              className="w-full px-3 py-2 bookish-input rounded-lg text-sm font-open-sans"
                            >
                              <option value="minor">Minor Spoilers (Character details, early plot)</option>
                              <option value="major">Major Spoilers (Plot twists, character deaths)</option>
                              <option value="ending">Ending Spoilers (Final outcomes, conclusions)</option>
                            </select>
                          </div>
                        </motion.div>
                      )}
                    </div>

                    {/* Preview */}
                    <div className="bg-white/30 rounded-xl p-4 border border-white/20">
                      <h4 className="text-sm font-medium text-primary mb-3 font-open-sans">📋 Preview</h4>
                      <div className="bg-white/50 rounded-lg p-4 border border-white/30">
                        <div className="flex items-center flex-wrap gap-2 mb-3">
                          <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                            postData.type === 'Article' ? 'bg-primary/20 text-primary' :
                            postData.type === 'Synopsis' ? 'bg-accent/20 text-accent' :
                            postData.type === 'Query' ? 'bg-primary/30 text-primary' :
                            'bg-error/20 text-error'
                          }`}>
                            {postData.type}
                          </span>
                          {postData.spoiler_flag && (
                            <span className="px-3 py-1 bg-error/20 text-error text-xs rounded-full font-medium">
                              {postData.spoiler_level} Spoiler
                            </span>
                          )}
                          {selectedBook && (
                            <span className="px-3 py-1 bg-accent/20 text-accent text-xs rounded-full font-medium">
                              📚 {selectedBook.title}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-primary mb-2 font-lora">
                          {postData.title || 'Your title here...'}
                        </h3>
                        <p className="text-primary/80 text-sm font-open-sans">
                          {postData.content ? postData.content.substring(0, 150) + '...' : 'Your content here...'}
                        </p>

                        {/* Show context if available */}
                        {selectedBook && (postData.book_context.chapter || postData.book_context.page_range) && (
                          <div className="mt-3 p-2 bg-accent/10 rounded-lg">
                            <p className="text-xs text-accent font-medium">
                              📍 {postData.book_context.chapter && `Chapter: ${postData.book_context.chapter}`}
                              {postData.book_context.chapter && postData.book_context.page_range && ' • '}
                              {postData.book_context.page_range && `Pages: ${postData.book_context.page_range}`}
                            </p>
                          </div>
                        )}

                        {/* Show tags */}
                        {(postData.theme_tags.length > 0 || postData.character_tags.length > 0 || postData.style_tags.length > 0) && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {[...postData.theme_tags, ...postData.character_tags, ...postData.style_tags].slice(0, 5).map((tag, index) => (
                              <span key={index} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                                #{tag}
                              </span>
                            ))}
                            {(postData.theme_tags.length + postData.character_tags.length + postData.style_tags.length) > 5 && (
                              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                                +{(postData.theme_tags.length + postData.character_tags.length + postData.style_tags.length) - 5} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/20">
                  <div className="flex space-x-3">
                    {step > 1 && (
                      <motion.button
                        type="button"
                        onClick={prevStep}
                        className="px-4 py-2 text-primary/70 hover:text-primary transition-colors font-open-sans"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        ← Back
                      </motion.button>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2 text-primary/70 hover:text-primary transition-colors font-open-sans"
                    >
                      Cancel
                    </button>

                    {step < 3 ? (
                      <motion.button
                        type="button"
                        onClick={nextStep}
                        className="px-6 py-2 bookish-button-enhanced text-white rounded-xl font-open-sans"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {step === 1 ? 'Add Book Context →' : 'Add Tags & Settings →'}
                      </motion.button>
                    ) : (
                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        className="px-8 py-2 bookish-button-enhanced text-white rounded-xl font-open-sans disabled:opacity-50"
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
