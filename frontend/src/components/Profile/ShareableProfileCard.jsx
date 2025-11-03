import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import {
  XMarkIcon,
  ArrowDownTrayIcon,
  BookOpenIcon,
  EyeIcon,
  ArrowPathIcon,
  CheckIcon,
  SparklesIcon,
  StarIcon,
  HeartIcon,
  BookmarkIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

// BookSwaps Icon Component
const BookSwapsIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
    <rect x="2" y="3" width="2" height="2" />
    <rect x="2" y="8" width="2" height="2" />
    <rect x="2" y="13" width="2" height="2" />
  </svg>
);

const ShareableProfileCard = ({ user, stats, onClose, isInline = false }) => {
  const cardRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStats, setSelectedStats] = useState({
    booksOwned: true,
    booksRead: true,
    booksShared: true,
    reviewsWritten: true,
    joinDate: true,
    favoriteGenres: true
  });

  const availableStats = [
    { key: 'booksOwned', label: 'Books Owned', value: stats?.books_owned || 0, icon: BookOpenIcon },
    { key: 'booksRead', label: 'Books Read', value: stats?.books_read || 0, icon: EyeIcon },
    { key: 'booksShared', label: 'Books Shared', value: stats?.books_shared || 0, icon: ArrowPathIcon },
    { key: 'reviewsWritten', label: 'Reviews Written', value: stats?.reviews_written || 0, icon: StarIcon },
    { key: 'likesReceived', label: 'Likes Received', value: stats?.likes_received || 0, icon: HeartIcon },
    { key: 'bookmarksCount', label: 'Bookmarks', value: stats?.bookmarks_count || 0, icon: BookmarkIcon },
    { key: 'readingStreak', label: 'Reading Streak', value: `${stats?.reading_streak || 0} days`, icon: SparklesIcon },
    { key: 'daysAsMember', label: 'Days as Member', value: stats?.days_as_member || 0, icon: CalendarIcon },
  ];

  const toggleStat = (statKey) => {
    setSelectedStats(prev => ({
      ...prev,
      [statKey]: !prev[statKey]
    }));
  };

  const parseGenres = (genresData) => {
    if (!genresData) return [];
    
    // If it's already an array, return it
    if (Array.isArray(genresData)) {
      return genresData.filter(Boolean);
    }
    
    // If it's a string, try to parse it
    if (typeof genresData === 'string') {
      try {
        // Try parsing as JSON first
        const parsed = JSON.parse(genresData);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        // If JSON parsing fails, split by comma
        return genresData.split(',').map(g => g.trim()).filter(Boolean);
      }
    }
    
    // For any other type, try to convert to array
    return [genresData].filter(Boolean);
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width: isInline ? 600 : 800,
        height: isInline ? 300 : 500
      });

      const link = document.createElement('a');
      link.download = `${user?.username || 'user'}-library-card.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error generating library card:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const genres = parseGenres(user?.genres);

  const renderStatsCustomization = () => (
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
        <SparklesIcon className="w-4 h-4 text-[var(--primary)]" />
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
  );

  const renderLibraryCard = (isCompact = false) => (
    <div
      ref={cardRef}
      className="relative overflow-hidden shadow-2xl"
      style={{
        width: isCompact ? '100%' : '800px',
        maxWidth: isCompact ? '600px' : '800px',
        height: isCompact ? '300px' : '500px',
        background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
        borderRadius: '24px',
        border: '2px solid #8B4513',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Background Pattern & Logo Watermark */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <BookSwapsIcon className={`${isCompact ? 'w-64 h-64' : 'w-96 h-96'} text-white`} />
        </div>
      </div>

      {/* Premium Border Effect */}
      <div className="absolute inset-0 rounded-[22px]" style={{
        background: 'linear-gradient(45deg, #8B4513, #D2691E, #8B4513)',
        padding: '3px'
      }}>
        <div className="w-full h-full rounded-[19px]" style={{
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)'
        }}>
          {/* Main Content Container */}
          <div className="relative h-full flex">
            {/* Left Section - User Info */}
            <div className={`flex-1 ${isCompact ? 'p-4' : 'p-8'} flex flex-col justify-between`}>
              <div>
                {/* Header */}
                <div className={`flex items-center gap-${isCompact ? '3' : '4'} ${isCompact ? 'mb-4' : 'mb-6'}`}>
                  <div className="relative">
                    <div className={`${isCompact ? 'w-12 h-12' : 'w-20 h-20'} rounded-full overflow-hidden border-3 border-[#D2691E] shadow-lg`}>
                      <img
                        src={user?.profile_picture || '/default-avatar.png'}
                        alt={user?.username}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className={`absolute -bottom-1 -right-1 ${isCompact ? 'w-4 h-4' : 'w-6 h-6'} bg-[#D2691E] rounded-full flex items-center justify-center`}>
                      <BookSwapsIcon className={`${isCompact ? 'w-2 h-2' : 'w-4 h-4'} text-white`} />
                    </div>
                  </div>

                  <div className="flex-1">
                    <h2 className={`font-['Lora'] font-bold ${isCompact ? 'text-lg' : 'text-2xl'} text-white mb-1`}>
                      {user?.username || 'Book Lover'}
                    </h2>
                    <p className={`text-gray-300 ${isCompact ? 'text-xs' : 'text-sm'} ${isCompact ? 'mb-1' : 'mb-2'}`}>
                      📍 {user?.city || 'Global'}, {user?.country || 'BookSwaps Community'}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1 text-xs text-[#D2691E] bg-[#D2691E]/20 px-2 py-1 rounded-full`}>
                        <SparklesIcon className="w-3 h-3" />
                        <span>Library Owner</span>
                      </div>
                      {selectedStats.joinDate && (
                        <div className="text-xs text-gray-400">
                          Member since {new Date(user?.date_joined).getFullYear()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className={`grid ${isCompact ? 'grid-cols-3 gap-2 mb-3' : 'grid-cols-2 gap-4 mb-6'}`}>
                  {availableStats.filter(stat => selectedStats[stat.key]).map((stat) => {
                    const IconComponent = stat.icon;
                    return (
                      <div key={stat.key} className={`bg-[var(--bg-card)]/5 rounded-lg ${isCompact ? 'p-2' : 'p-3'} border border-white/10`}>
                        <div className={`flex items-center ${isCompact ? 'gap-1 mb-1' : 'gap-2 mb-1'}`}>
                          <IconComponent className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'} text-[#D2691E]`} />
                          <span className="text-xs text-gray-400 uppercase tracking-wide">{stat.label}</span>
                        </div>
                        <div className={`${isCompact ? 'text-sm' : 'text-xl'} font-bold text-white`}>{stat.value}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Favorite Genres */}
                {selectedStats.favoriteGenres && genres.length > 0 && (
                  <div className={isCompact ? 'mb-2' : 'mb-4'}>
                    <h4 className={`${isCompact ? 'text-xs' : 'text-sm'} text-gray-400 ${isCompact ? 'mb-1' : 'mb-2'} flex items-center ${isCompact ? 'gap-1' : 'gap-2'}`}>
                      <SparklesIcon className={`${isCompact ? 'w-3 h-3' : 'w-4 h-4'} text-[#D2691E]`} />
                      Favorite Genres
                    </h4>
                    <div className={`flex flex-wrap ${isCompact ? 'gap-1' : 'gap-2'}`}>
                      {genres.slice(0, 3).map((genre, index) => (
                        <span key={index} className="text-xs bg-[#D2691E]/20 text-[#D2691E] px-2 py-1 rounded-full">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookSwapsIcon className={`${isCompact ? 'w-4 h-4' : 'w-6 h-6'} text-[#D2691E]`} />
                  <span className={`${isCompact ? 'text-xs' : 'text-sm'} font-semibold text-white`}>BookSwaps</span>
                </div>
                <div className="text-xs text-gray-500">
                  Share. Read. Connect.
                </div>
              </div>
            </div>

            {/* Right Section - QR Code */}
            <div className={`${isCompact ? 'w-20' : 'w-32'} ${isCompact ? 'p-4' : 'p-6'} flex flex-col items-center justify-center bg-[var(--bg-card)]/5 border-l border-white/10`}>
              <div className={`${isCompact ? 'w-12 h-12' : 'w-20 h-20'} bg-[var(--bg-card)] rounded-lg ${isCompact ? 'p-1 mb-1' : 'p-2 mb-2'}`}>
                <div className="w-full h-full bg-black rounded flex items-center justify-center">
                  <div className="text-white text-xs font-mono">QR</div>
                </div>
              </div>
              <p className="text-gray-400 text-xs">Scan to connect</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Inline mode (for slide-down)
  if (isInline) {
    return (
      <div className="card rounded-2xl border-2 border-[var(--primary)]/30 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--primary)]/20 bg-gradient-to-r from-[var(--primary)]/5 to-[var(--accent)]/5">
          <div className="flex items-center gap-3">
            <BookSwapsIcon className="w-6 h-6 text-[var(--primary)]" />
            <div>
              <h3 className="text-lg font-['Lora'] font-bold text-[var(--primary)]">Share Your Library Card</h3>
              <p className="text-xs text-[var(--text)]/70">Customize and download your profile card</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--primary)]/10 rounded-full transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-[var(--primary)]" />
          </button>
        </div>

        <div className="flex flex-col">
          {/* Stats Customization Panel */}
          <div className="w-full border-b p-4 border-[var(--primary)]/20">
            <h4 className="text-lg font-['Lora'] font-semibold text-[var(--primary)] mb-4">Customize Your Card</h4>
            {renderStatsCustomization()}
          </div>

          {/* Library Card Preview */}
          <div className="w-full p-4">
            <h4 className="text-lg font-['Lora'] font-semibold text-[var(--primary)] mb-4">Preview</h4>
            <div className="flex justify-center">
              {renderLibraryCard(true)}
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-t border-[var(--primary)]/20">
            <button
              onClick={handleDownload}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-3 p-3 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              {isGenerating ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Generating Library Card...
                </span>
              ) : (
                'Download Premium Library Card'
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Modal mode (for overlay) - will be added in next edit
  return null;
};

export default ShareableProfileCard;
