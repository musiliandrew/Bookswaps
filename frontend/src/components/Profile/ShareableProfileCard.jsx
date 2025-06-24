import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';
import { 
  ShareIcon, 
  DownloadIcon, 
  BookOpenIcon, 
  UsersIcon, 
  StarIcon,
  SparklesIcon,
  HeartIcon,
  QrCodeIcon
} from '@heroicons/react/24/outline';
import { 
  HeartIcon as HeartSolidIcon,
  StarIcon as StarSolidIcon 
} from '@heroicons/react/24/solid';

// Enhanced helper function to parse genres
const parseGenres = (genres) => {
  if (!genres) return [];

  if (Array.isArray(genres)) {
    return genres
      .map(genre => {
        if (typeof genre === 'string') {
          let cleaned = genre;
          cleaned = cleaned.replace(/^\["|"\]$/g, '');
          cleaned = cleaned.replace(/^"|"$/g, '');
          cleaned = cleaned.replace(/\\"/g, '"');
          
          if (cleaned.includes('","') || cleaned.includes('", "')) {
            return cleaned.split(/",\s*"/).map(g => g.replace(/^"|"$/g, '').trim());
          }
          
          return cleaned.trim();
        }
        return genre;
      })
      .flat()
      .filter(genre => genre && genre.length > 0)
      .map(genre => genre.charAt(0).toUpperCase() + genre.slice(1));
  }

  if (typeof genres === 'string') {
    try {
      const parsed = JSON.parse(genres);
      return parseGenres(parsed);
    } catch {
      let cleaned = genres;
      cleaned = cleaned.replace(/[\[\]"\\]/g, '');
      
      return cleaned
        .split(',')
        .map(genre => genre.trim())
        .filter(genre => genre.length > 0)
        .map(genre => genre.charAt(0).toUpperCase() + genre.slice(1));
    }
  }

  return [];
};

const ShareableProfileCard = ({ user, stats, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const cardRef = useRef(null);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      const link = document.createElement('a');
      link.download = `${user.username}-bookswaps-profile.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user.username}'s BookSwaps Profile`,
          text: `Check out ${user.username}'s reading journey on BookSwaps!`,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Profile link copied to clipboard!');
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative max-w-md w-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Action Buttons */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-lora font-bold text-white">Share Profile</h3>
          <div className="flex gap-2">
            <motion.button
              onClick={handleShare}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm border border-white/20 text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShareIcon className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={handleDownload}
              disabled={isGenerating}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm border border-white/20 text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <DownloadIcon className="w-5 h-5" />
            </motion.button>
            <motion.button
              onClick={onClose}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm border border-white/20 text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ✕
            </motion.button>
          </div>
        </div>

        {/* Shareable Card */}
        <div
          ref={cardRef}
          className="relative w-full bg-gradient-to-br from-[#2C5F7A] via-[#3A7A9A] to-[#4A94BA] rounded-3xl overflow-hidden shadow-2xl"
          style={{ aspectRatio: '3/4' }}
        >
          {/* Flying Books Background */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-8 left-8 text-4xl opacity-20 animate-bounce" style={{ animationDelay: '0s' }}>📚</div>
            <div className="absolute top-16 right-12 text-3xl opacity-15 animate-bounce" style={{ animationDelay: '1s' }}>📖</div>
            <div className="absolute bottom-20 left-12 text-3xl opacity-10 animate-bounce" style={{ animationDelay: '2s' }}>📕</div>
            <div className="absolute top-32 right-8 text-2xl opacity-20 animate-bounce" style={{ animationDelay: '3s' }}>📘</div>
            <div className="absolute bottom-32 right-16 text-3xl opacity-15 animate-bounce" style={{ animationDelay: '4s' }}>📗</div>
          </div>

          {/* BookSwaps Branding */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <BookOpenIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-bold text-lg">BookSwaps</span>
            </div>
            <QrCodeIcon className="w-6 h-6 text-white/60" />
          </div>

          {/* Profile Content */}
          <div className="relative z-10 p-6 pt-20 h-full flex flex-col">
            {/* Profile Picture */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-white/10 rounded-full blur-sm" />
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-3 border-white/30">
                  <img
                    src={user.profile_picture || '/default-avatar.png'}
                    alt={user.username}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">{user.username}</h2>
              <p className="text-white/80 text-sm mb-3">{user.city}, {user.country}</p>
              
              {/* Genres */}
              <div className="flex flex-wrap gap-1 justify-center mb-4">
                {parseGenres(user.genres)?.slice(0, 3).map((genre) => (
                  <span
                    key={genre}
                    className="px-2 py-1 bg-white/20 text-white text-xs rounded-full backdrop-blur-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <BookOpenIcon className="w-5 h-5 mx-auto mb-1 text-white" />
                <div className="text-lg font-bold text-white">{stats?.booksRead || 0}</div>
                <div className="text-xs text-white/70">Books</div>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <UsersIcon className="w-5 h-5 mx-auto mb-1 text-white" />
                <div className="text-lg font-bold text-white">{user.followers_count || 0}</div>
                <div className="text-xs text-white/70">Followers</div>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <StarSolidIcon className="w-5 h-5 mx-auto mb-1 text-white" />
                <div className="text-lg font-bold text-white">{stats?.reviewsWritten || 0}</div>
                <div className="text-xs text-white/70">Reviews</div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="text-center">
                  <HeartSolidIcon className="w-6 h-6 mx-auto mb-2 text-white" />
                  <p className="text-white font-semibold text-sm mb-1">Join our community!</p>
                  <p className="text-white/80 text-xs mb-2">Swap books with fellow readers</p>
                  <div className="flex items-center justify-center gap-2 text-xs text-white/70">
                    <SparklesIcon className="w-3 h-3" />
                    <span>Connect • Discover • Exchange</span>
                    <SparklesIcon className="w-3 h-3" />
                  </div>
                </div>
              </div>
            </div>

            {/* Watermark */}
            <div className="absolute bottom-4 right-4 text-xs text-white/50">
              BookSwaps.com
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ShareableProfileCard;
