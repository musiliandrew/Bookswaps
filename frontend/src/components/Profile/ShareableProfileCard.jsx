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
    booksOwned: true,      // Primary stat - core to your app
    booksShared: true,     // Secondary stat - sharing activity
    followers: true,       // Social engagement
    reviews: true,         // Community participation
    booksRead: false,      // Less relevant for library management
    likesReceived: false,  // Secondary social metric
    joinDate: true,
    favoriteGenres: true
  });
  const cardRef = useRef(null);

  // Available stats with their display info (ordered by relevance to BookSwaps)
  const availableStats = [
    { key: 'booksOwned', label: 'Books Owned', value: stats?.booksOwned || 0, icon: BookmarkSolidIcon },
    { key: 'booksShared', label: 'Books Shared', value: stats?.booksShared || 0, icon: ShareIcon },
    { key: 'followers', label: 'Followers', value: user?.followers_count || 0, icon: UsersIcon },
    { key: 'reviews', label: 'Reviews', value: stats?.reviewsWritten || 0, icon: StarSolidIcon },
    { key: 'booksRead', label: 'Books Read', value: stats?.booksRead || 0, icon: BookOpenIcon },
    { key: 'likesReceived', label: 'Likes Received', value: stats?.likesReceived || 0, icon: HeartSolidIcon },
  ];

  const handleDownload = async () => {
    if (!cardRef.current) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#1a1a1a',
        scale: 3,
        useCORS: true,
        allowTaint: true,
        width: 800,  // Landscape width
        height: 500  // Landscape height
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
              <h3 className="text-xl font-['Lora'] font-bold text-[var(--primary)]">Premium Library Card Generator</h3>
              <p className="text-sm text-[var(--text)]/70">Create your stunning BookSwaps library card</p>
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
                className="relative overflow-hidden shadow-2xl"
                style={{
                  width: '800px',
                  height: '500px',
                  background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
                  borderRadius: '24px',
                  border: '2px solid #8B4513',
                  fontFamily: 'system-ui, -apple-system, sans-serif'
                }}
              >
                {/* Background Pattern & Logo Watermark */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <BookSwapsIcon className="w-96 h-96 text-white" />
                  </div>
                  {/* Decorative book pattern */}
                  <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }} />
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
                      <div className="flex-1 p-8 flex flex-col justify-between">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <BookSwapsIcon className="w-12 h-12 text-[#D2691E]" />
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center">
                                <span className="text-xs font-bold text-black">✓</span>
                              </div>
                            </div>
                            <div>
                              <h1 className="text-2xl font-bold text-white font-['Lora']">BookSwaps</h1>
                              <p className="text-[#D2691E] text-sm font-medium">Premium Library Network</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-400 text-xs">MEMBER ID</p>
                            <p className="text-white font-mono text-sm font-bold">
                              #{user?.user_id?.slice(-6) || '000000'}
                            </p>
                          </div>
                        </div>

                        {/* User Profile Section */}
                        <div className="flex items-center gap-4 mb-6">
                          <div className="relative">
                            <div className="w-20 h-20 rounded-full overflow-hidden border-3 border-[#D2691E] shadow-xl">
                              {user?.profile_picture ? (
                                <img
                                  src={user.profile_picture}
                                  alt={user.username}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[#D2691E] to-[#8B4513] flex items-center justify-center">
                                  <span className="text-white font-bold text-2xl">
                                    {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                                  </span>
                                </div>
                              )}
                            </div>
                            {/* Premium Badge */}
                            <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs px-2 py-1 rounded-full font-bold">
                              VIP
                            </div>
                          </div>

                          <div className="flex-1">
                            <h2 className="font-['Lora'] font-bold text-2xl text-white mb-1">
                              {user?.username || 'Book Lover'}
                            </h2>
                            <p className="text-gray-300 text-sm mb-2">
                              📍 {user?.city || 'Global'}, {user?.country || 'BookSwaps Community'}
                            </p>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-xs text-[#D2691E] bg-[#D2691E]/20 px-2 py-1 rounded-full">
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

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 gap-3 mb-6">
                          {availableStats.filter(stat => selectedStats[stat.key]).slice(0, 4).map((stat) => {
                            const IconComponent = stat.icon;
                            return (
                              <div key={stat.key} className="bg-white/5 rounded-lg p-3 text-center border border-[#D2691E]/30 backdrop-blur-sm">
                                <IconComponent className="w-5 h-5 mx-auto mb-1 text-[#D2691E]" />
                                <div className="text-lg font-bold text-white">{stat.value}</div>
                                <div className="text-xs text-gray-400">{stat.label}</div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Footer CTA */}
                        <div className="mt-auto">
                          <div className="bg-gradient-to-r from-[#D2691E]/20 to-[#8B4513]/20 rounded-lg p-4 border border-[#D2691E]/30">
                            <p className="text-white text-sm font-medium mb-2">📚 Share Your Library, Discover New Books</p>
                            <p className="text-gray-300 text-xs">Manage your collection • Swap physical books • Connect with book lovers</p>
                            <div className="flex items-center gap-2 mt-2">
                              <BookSwapsIcon className="w-4 h-4 text-[#D2691E]" />
                              <span className="text-xs text-[#D2691E] font-bold">BookSwaps.com</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Showcase */}
                      <div className="w-80 relative">
                        {/* Decorative Side Panel */}
                        <div className="absolute inset-0 bg-gradient-to-b from-[#D2691E]/10 to-[#8B4513]/10 rounded-r-[19px]"></div>

                        <div className="relative h-full p-8 flex flex-col justify-center">
                          {/* Featured Stats */}
                          <div className="text-center mb-8">
                            <h3 className="text-white text-xl font-bold font-['Lora'] mb-2">Library Stats</h3>
                            <div className="w-16 h-1 bg-gradient-to-r from-[#D2691E] to-[#8B4513] mx-auto rounded-full mb-6"></div>

                            {/* Large Featured Stat */}
                            {availableStats.filter(stat => selectedStats[stat.key]).slice(0, 1).map((stat) => {
                              const IconComponent = stat.icon;
                              return (
                                <div key={stat.key} className="mb-6">
                                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-[#D2691E] to-[#8B4513] rounded-full flex items-center justify-center shadow-xl">
                                    <IconComponent className="w-10 h-10 text-white" />
                                  </div>
                                  <div className="text-4xl font-bold text-white mb-1">{stat.value}</div>
                                  <div className="text-[#D2691E] text-sm font-medium">{stat.label}</div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Favorite Genres */}
                          {selectedStats.favoriteGenres && genres.length > 0 && (
                            <div className="mb-6">
                              <h4 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
                                <SparklesIcon className="w-4 h-4 text-[#D2691E]" />
                                Favorite Genres
                              </h4>
                              <div className="space-y-2">
                                {genres.slice(0, 3).map((genre, index) => (
                                  <div
                                    key={index}
                                    className="bg-gradient-to-r from-[#D2691E]/20 to-[#8B4513]/20 text-white text-xs px-3 py-2 rounded-lg border border-[#D2691E]/30 text-center"
                                  >
                                    {genre}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* QR Code Placeholder */}
                          <div className="mt-auto text-center">
                            <div className="w-16 h-16 mx-auto bg-white rounded-lg flex items-center justify-center mb-2">
                              <div className="w-12 h-12 bg-black rounded grid grid-cols-4 gap-px">
                                {[...Array(16)].map((_, i) => (
                                  <div key={i} className={`${Math.random() > 0.5 ? 'bg-white' : 'bg-black'}`}></div>
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-400 text-xs">Scan to connect</p>
                          </div>
                        </div>
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
              'Download Premium Library Card'
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ShareableProfileCard;
