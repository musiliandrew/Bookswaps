import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import {
  ArrowDownTrayIcon,
  BookOpenIcon,
  UsersIcon,
  XMarkIcon,
  ShareIcon,
  CalendarIcon,
  SparklesIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarSolidIcon,
  HeartIcon as HeartSolidIcon,
  BookmarkIcon as BookmarkSolidIcon
} from '@heroicons/react/24/solid';

// Helper function to parse genres
const parseGenres = (genres) => {
  if (!genres) return [];
  
  if (Array.isArray(genres)) {
    return genres.filter(genre => genre && typeof genre === 'string' && genre.length > 0);
  }
  
  if (typeof genres === 'string') {
    try {
      const parsed = JSON.parse(genres);
      if (Array.isArray(parsed)) {
        return parsed.filter(genre => genre && typeof genre === 'string' && genre.length > 0);
      }
    } catch {
      return genres.split(',').map(g => g.trim()).filter(g => g.length > 0);
    }
  }
  
  return [];
};

// BookSwaps Icon Component
const BookSwapsIcon = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 16 16" className={className} fill="currentColor">
    <rect x="0" y="0" width="2" height="16" />
    <path d="M11,6 L11,9 L11.885,9 L12,6 L11,6 Z" />
    <path d="M3,0 L3,16 L13.8208442,16 C14.4713435,16 15,15.5473033 15,14.9895162 L15,1.01048377 C15,0.451686245 14.4723504,0 13.8208442,0 L3,0 Z M13.051,9.053 L12.08,9.053 L12.062,10.063 L7.906,10.063 L7.924,9.042 L6.957,9.042 L6.957,6.99 L7.915,6.99 L7.915,5.948 L10.957,5.938 L10.957,5.051 L7.026,5.051 L7.026,6.048 L6.029,6.048 L6.029,9.958 L7.041,9.958 L7.041,10.975 L11.047,10.975 L11.047,12.014 L6.961,12.014 L6.961,11.063 L5.958,11.063 L5.958,10.032 L4.953,10.032 L4.953,5.991 L5.973,5.991 L5.973,4.973 L6.938,4.973 L6.938,3.938 L11.032,3.938 L11.032,4.959 L12.011,4.959 L12.011,5.949 L13.052,5.949 L13.052,9.053 L13.051,9.053 Z" />
    <rect x="8" y="7" width="2" height="2" />
  </svg>
);

const ShareableProfileCard = ({ user, stats, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStats, setSelectedStats] = useState({
    booksRead: true,
    followers: true,
    reviews: true,
    booksOwned: false,
    booksShared: false,
    likesReceived: false,
    joinDate: true,
    favoriteGenres: true
  });
  const cardRef = useRef(null);

  // Available stats with their display info
  const availableStats = [
    { key: 'booksRead', label: 'Books Read', value: stats?.booksRead || 0, icon: BookOpenIcon },
    { key: 'followers', label: 'Followers', value: user?.followers_count || 0, icon: UsersIcon },
    { key: 'reviews', label: 'Reviews', value: stats?.reviewsWritten || 0, icon: StarSolidIcon },
    { key: 'booksOwned', label: 'Books Owned', value: stats?.booksOwned || 0, icon: BookmarkSolidIcon },
    { key: 'booksShared', label: 'Books Shared', value: stats?.booksShared || 0, icon: ShareIcon },
    { key: 'likesReceived', label: 'Likes Received', value: stats?.likesReceived || 0, icon: HeartSolidIcon },
  ];

  const handleDownload = async () => {
    if (!cardRef.current) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#F0EAD0',
        scale: 3,
        useCORS: true,
        allowTaint: true,
        width: 400,
        height: 600
      });

      const link = document.createElement('a');
      link.download = `${user?.username || 'profile'}-bookswaps-library-card.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleStat = (statKey) => {
    setSelectedStats(prev => ({
      ...prev,
      [statKey]: !prev[statKey]
    }));
  };

  const genres = parseGenres(user?.favorite_genres);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(69, 106, 118, 0.9)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full max-w-4xl bookish-glass rounded-3xl border-2 border-[var(--primary)]/30 overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--primary)]/20">
          <div className="flex items-center gap-3">
            <BookSwapsIcon className="w-8 h-8 text-[var(--primary)]" />
            <div>
              <h3 className="text-xl font-['Lora'] font-bold text-[var(--primary)]">Library Card Generator</h3>
              <p className="text-sm text-[var(--text)]/70">Create your BookSwaps library card</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--primary)]/10 rounded-full transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-[var(--primary)]" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Stats Customization Panel */}
          <div className="lg:w-1/3 p-6 border-r border-[var(--primary)]/20">
            <h4 className="text-lg font-['Lora'] font-semibold text-[var(--primary)] mb-4">Customize Your Card</h4>

            {/* Stats Selection */}
            <div className="space-y-3 mb-6">
              <p className="text-sm font-medium text-[var(--text)] mb-3">Select stats to display:</p>
              {availableStats.map((stat) => {
                const IconComponent = stat.icon;
                return (
                  <label key={stat.key} className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={selectedStats[stat.key]}
                        onChange={() => toggleStat(stat.key)}
                        className="sr-only"
                      />
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        selectedStats[stat.key]
                          ? 'bg-[var(--accent)] border-[var(--accent)]'
                          : 'border-[var(--primary)]/30 group-hover:border-[var(--accent)]'
                      }`}>
                        {selectedStats[stat.key] && (
                          <CheckIcon className="w-3 h-3 text-white" />
                        )}
                      </div>
                    </div>
                    <IconComponent className="w-4 h-4 text-[var(--primary)]" />
                    <span className="text-sm text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                      {stat.label} ({stat.value})
                    </span>
                  </label>
                );
              })}

              {/* Additional Options */}
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={selectedStats.joinDate}
                    onChange={() => toggleStat('joinDate')}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    selectedStats.joinDate
                      ? 'bg-[var(--accent)] border-[var(--accent)]'
                      : 'border-[var(--primary)]/30 group-hover:border-[var(--accent)]'
                  }`}>
                    {selectedStats.joinDate && (
                      <CheckIcon className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
                <CalendarIcon className="w-4 h-4 text-[var(--primary)]" />
                <span className="text-sm text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                  Join Date
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={selectedStats.favoriteGenres}
                    onChange={() => toggleStat('favoriteGenres')}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    selectedStats.favoriteGenres
                      ? 'bg-[var(--accent)] border-[var(--accent)]'
                      : 'border-[var(--primary)]/30 group-hover:border-[var(--accent)]'
                  }`}>
                    {selectedStats.favoriteGenres && (
                      <CheckIcon className="w-3 h-3 text-white" />
                    )}
                  </div>
                </div>
                <SparklesIcon className="w-4 h-4 text-[var(--primary)]" />
                <span className="text-sm text-[var(--text)] group-hover:text-[var(--primary)] transition-colors">
                  Favorite Genres
                </span>
              </label>
            </div>
          </div>

          {/* Library Card Preview */}
          <div className="lg:w-2/3 p-6">
            <h4 className="text-lg font-['Lora'] font-semibold text-[var(--primary)] mb-4">Preview</h4>

            <div className="flex justify-center">
              <div
                ref={cardRef}
                className="relative w-80 h-[500px] rounded-2xl overflow-hidden shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, #F0EAD0 0%, #E8DCC0 50%, #D4C5A0 100%)',
                  border: '3px solid #456A76'
                }}
              >
                {/* Library Card Header */}
                <div className="relative bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BookSwapsIcon className="w-6 h-6" />
                      <div>
                        <h3 className="font-['Lora'] font-bold text-lg">BookSwaps</h3>
                        <p className="text-xs opacity-90">Community Library</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs opacity-90">Member Since</p>
                      {selectedStats.joinDate && (
                        <p className="text-sm font-semibold">
                          {new Date(user?.date_joined).getFullYear()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Decorative Pattern */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                </div>

                {/* Card Body */}
                <div className="p-6 h-full flex flex-col" style={{ paddingTop: '1.5rem' }}>
                  {/* User Info Section */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-3 border-[var(--primary)]/30 shadow-lg">
                        {user?.profile_picture ? (
                          <img
                            src={user.profile_picture}
                            alt={user.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
                            <span className="text-white font-bold text-xl">
                              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                        )}
                      </div>
                      {/* Library Card Number */}
                      <div className="absolute -bottom-2 -right-2 bg-[var(--accent)] text-white text-xs px-2 py-1 rounded-full font-mono">
                        #{user?.user_id?.slice(-6) || '000000'}
                      </div>
                    </div>

                    <div className="flex-1">
                      <h2 className="font-['Lora'] font-bold text-xl text-[var(--primary)] mb-1">
                        {user?.username || 'Book Lover'}
                      </h2>
                      <p className="text-sm text-[var(--text)] mb-1">
                        {user?.city || 'Unknown'}, {user?.country || 'Unknown'}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-[var(--accent)]">
                        <SparklesIcon className="w-3 h-3" />
                        <span>Verified Reader</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {availableStats.filter(stat => selectedStats[stat.key]).map((stat) => {
                      const IconComponent = stat.icon;
                      return (
                        <div key={stat.key} className="bg-white/10 rounded-lg p-3 text-center border border-[var(--primary)]/20">
                          <IconComponent className="w-5 h-5 mx-auto mb-1 text-[var(--primary)]" />
                          <div className="text-lg font-bold text-[var(--primary)]">{stat.value}</div>
                          <div className="text-xs text-[var(--text)]/70">{stat.label}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Favorite Genres */}
                  {selectedStats.favoriteGenres && genres.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-[var(--primary)] mb-2 flex items-center gap-1">
                        <SparklesIcon className="w-4 h-4" />
                        Favorite Genres
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {genres.slice(0, 3).map((genre, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/20 text-[var(--primary)] text-xs rounded-full border border-[var(--primary)]/30"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="mt-auto">
                    <div className="border-t border-[var(--primary)]/20 pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BookSwapsIcon className="w-4 h-4 text-[var(--primary)]" />
                          <span className="text-xs text-[var(--text)] font-medium">BookSwaps.com</span>
                        </div>
                        <div className="text-xs text-[var(--text)]/60">
                          Join the community
                        </div>
                      </div>
                      <div className="mt-2 text-center">
                        <p className="text-xs text-[var(--accent)] font-semibold">
                          "Every book is a new adventure"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-[var(--primary)]/20">
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
            {isGenerating ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Generating Library Card...
              </span>
            ) : (
              'Download Library Card'
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ShareableProfileCard;
