import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShareIcon,
  BookOpenIcon,
  UsersIcon,
  MapPinIcon,
  CalendarIcon,
  SparklesIcon,
  CameraIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  StarIcon as StarSolidIcon
} from '@heroicons/react/24/solid';

// Enhanced helper function to parse genres
const parseGenres = (genres) => {
  if (!genres) return [];

  const cleanGenre = (genre) => {
    if (typeof genre !== 'string') return genre;
    let cleaned = genre
      .replace(/^[[\\]"']+|[[\\]"']+$/g, '')
      .replace(/\\"/g, '"')
      .replace(/\\'/g, "'")
      .trim();
    return cleaned;
  };

  if (Array.isArray(genres)) {
    return genres
      .map(genre => {
        if (typeof genre === 'string') {
          if (genre.includes('[') && genre.includes(']')) {
            try {
              const parsed = JSON.parse(genre);
              if (Array.isArray(parsed)) {
                return parsed.map(cleanGenre);
              }
            } catch {
              const match = genre.match(/\[(.*)\]/);
              if (match) {
                return match[1]
                  .split(',')
                  .map(g => cleanGenre(g))
                  .filter(g => g && g.length > 0);
              }
            }
          }
          if (genre.includes(',')) {
            return genre.split(',').map(cleanGenre);
          }
          return cleanGenre(genre);
        }
        return genre;
      })
      .flat()
      .filter(genre => genre && typeof genre === 'string' && genre.length > 0)
      .map(genre => genre.charAt(0).toUpperCase() + genre.slice(1));
  }

  if (typeof genres === 'string') {
    try {
      const parsed = JSON.parse(genres);
      return parseGenres(parsed);
    } catch {
      if (genres.includes('[') && genres.includes(']')) {
        const match = genres.match(/\[(.*)\]/);
        if (match) {
          return match[1]
            .split(',')
            .map(cleanGenre)
            .filter(g => g && g.length > 0)
            .map(genre => genre.charAt(0).toUpperCase() + genre.slice(1));
        }
      }
      return genres.split(',').map(cleanGenre).filter(g => g && g.length > 0);
    }
  }

  return [];
};

const SimpleUserProfileCard = ({ profile, stats, onShareProfile, onEditProfile, onUploadPhoto }) => {
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
    } catch {
      return 'Recently';
    }
  };

  const genres = parseGenres(profile?.genres);

  return (
    <motion.div
      className="relative bookish-glass rounded-3xl p-6 sm:p-8 border border-white/20 bookish-shadow overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Floating Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-[var(--accent)]/10 to-[var(--primary)]/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 rounded-full blur-lg animate-pulse delay-1000"></div>
      </div>

      {/* Header with Share Button */}
      <div className="relative z-10 flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          {/* Profile Picture */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--primary)]/30 to-[var(--accent)]/30 rounded-full blur-sm"></div>
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-3 border-[var(--primary)]/30">
              {!imageError && profile?.profile_picture ? (
                <img
                  src={profile.profile_picture}
                  alt={profile.username}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center">
                  <span className="text-white font-bold text-lg sm:text-xl">
                    {profile?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </div>
            <button
              onClick={onUploadPhoto}
              className="absolute -bottom-1 -right-1 w-6 h-6 bg-[var(--accent)] rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform"
              title="Change profile picture"
            >
              <CameraIcon className="w-3 h-3" />
            </button>
          </div>

          {/* User Info */}
          <div>
            <h2 className="text-xl sm:text-2xl font-['Lora'] font-bold text-[var(--primary)] mb-1">
              {profile?.username || 'Anonymous Reader'}
            </h2>
            <div className="flex items-center gap-2 text-[var(--text)] text-sm mb-2">
              <MapPinIcon className="w-4 h-4" />
              <span>{profile?.city || 'Unknown'}, {profile?.country || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--text)]/70 text-xs">
              <CalendarIcon className="w-3 h-3" />
              <span>Joined {formatDate(profile?.date_joined)}</span>
            </div>
          </div>
        </div>

        {/* Share Button */}
        <motion.button
          onClick={onShareProfile}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <ShareIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Share Profile</span>
        </motion.button>
      </div>

      {/* Bio */}
      {profile?.bio && (
        <div className="relative z-10 mb-6">
          <p className="text-[var(--text)] text-sm leading-relaxed">
            {profile.bio}
          </p>
        </div>
      )}

      {/* Genres */}
      {genres.length > 0 && (
        <div className="relative z-10 mb-6">
          <h3 className="text-[var(--primary)] font-semibold text-sm mb-3 flex items-center gap-2">
            <SparklesIcon className="w-4 h-4" />
            Favorite Genres
          </h3>
          <div className="flex flex-wrap gap-2">
            {genres.slice(0, 6).map((genre, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--accent)]/10 text-[var(--primary)] text-xs rounded-full border border-[var(--primary)]/20"
              >
                {genre}
              </span>
            ))}
            {genres.length > 6 && (
              <span className="px-3 py-1 bg-[var(--primary)]/5 text-[var(--text)]/60 text-xs rounded-full border border-[var(--primary)]/10">
                +{genres.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-white/5 rounded-xl border border-[var(--primary)]/10">
          <BookOpenIcon className="w-5 h-5 mx-auto mb-2 text-[var(--primary)]" />
          <div className="text-lg font-bold text-[var(--primary)]">{stats?.booksRead || 0}</div>
          <div className="text-xs text-[var(--text)]/60">Books Read</div>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-xl border border-[var(--primary)]/10">
          <UsersIcon className="w-5 h-5 mx-auto mb-2 text-[var(--primary)]" />
          <div className="text-lg font-bold text-[var(--primary)]">{profile?.followers_count || 0}</div>
          <div className="text-xs text-[var(--text)]/60">Followers</div>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-xl border border-[var(--primary)]/10">
          <UsersIcon className="w-5 h-5 mx-auto mb-2 text-[var(--primary)]" />
          <div className="text-lg font-bold text-[var(--primary)]">{profile?.following_count || 0}</div>
          <div className="text-xs text-[var(--text)]/60">Following</div>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-xl border border-[var(--primary)]/10">
          <StarSolidIcon className="w-5 h-5 mx-auto mb-2 text-[var(--accent)]" />
          <div className="text-lg font-bold text-[var(--primary)]">{stats?.reviewsWritten || 0}</div>
          <div className="text-xs text-[var(--text)]/60">Reviews</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="relative z-10 mt-6 flex gap-3">
        <motion.button
          onClick={onEditProfile}
          className="flex-1 flex items-center justify-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-[var(--primary)]/10 text-[var(--primary)] text-sm font-medium transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <PencilIcon className="w-4 h-4" />
          Edit Profile
        </motion.button>
        <motion.button
          className="flex-1 flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--accent)]/10 hover:from-[var(--primary)]/20 hover:to-[var(--accent)]/20 rounded-xl border border-[var(--primary)]/20 text-[var(--primary)] text-sm font-medium transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <HeartSolidIcon className="w-4 h-4 text-[var(--accent)]" />
          View Activity
        </motion.button>
      </div>
    </motion.div>
  );
};

export default SimpleUserProfileCard;
