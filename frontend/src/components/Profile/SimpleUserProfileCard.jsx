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
  PencilIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarSolidIcon
} from '@heroicons/react/24/solid';
import OptimizedImage from '../Common/OptimizedImage';
import { getProfilePictureUrl } from '../../utils/imageUtils';

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

const SimpleUserProfileCard = ({ profile, stats, onShareProfile, onEditProfile, onUploadPhoto, isMobile = false }) => {
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
      className="card p-6 md:p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-6">
        {/* Profile Info */}
        <div className="flex items-start gap-4">
          {/* Profile Picture */}
          <div className="relative flex-shrink-0">
            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4"
                 style={{ borderColor: 'var(--primary-100)' }}>
              <OptimizedImage
                src={getProfilePictureUrl(profile, isMobile ? 'S' : 'M')}
                alt={profile?.username || 'User'}
                placeholder="user"
                className="w-full h-full object-cover"
                containerClassName="w-full h-full"
                showLoadingSpinner={true}
                showErrorState={false}
                retryOnError={true}
                maxRetries={2}
                lazy={false}
              />
              {!getProfilePictureUrl(profile, isMobile ? 'S' : 'M') && (
                <div className="absolute inset-0 flex items-center justify-center"
                     style={{
                       background: 'linear-gradient(135deg, var(--primary-500), var(--accent-500))'
                     }}>
                  <span className="text-white font-bold text-2xl">
                    {profile?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </div>
            <motion.button
              onClick={onUploadPhoto}
              className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-white"
              style={{ backgroundColor: 'var(--accent-500)' }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Change profile picture"
            >
              <CameraIcon className="w-4 h-4" />
            </motion.button>
          </div>

          {/* User Details */}
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--primary-600)' }}>
              {profile?.username || 'Anonymous Reader'}
            </h2>
            <div className="flex items-center gap-2 text-sm mb-2" style={{ color: 'var(--neutral-600)' }}>
              <MapPinIcon className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{profile?.city || 'Unknown'}, {profile?.country || 'Unknown'}</span>
            </div>
            <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--neutral-500)' }}>
              <CalendarIcon className="w-4 h-4 flex-shrink-0" />
              <span>Joined {formatDate(profile?.date_joined)}</span>
            </div>
          </div>
        </div>

        {/* Share Button */}
        <motion.button
          onClick={onShareProfile}
          className="btn btn-outline flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <ShareIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Share</span>
        </motion.button>
      </div>

      {/* Bio */}
      {profile?.bio && (
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--neutral-50)' }}>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--neutral-700)' }}>
            {profile.bio}
          </p>
        </div>
      )}

      {/* Favorite Genres */}
      {genres.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--primary-600)' }}>
            <SparklesIcon className="w-4 h-4" />
            Favorite Genres
          </h3>
          <div className="flex flex-wrap gap-2">
            {genres.slice(0, 6).map((genre, index) => (
              <span
                key={index}
                className="badge badge-primary"
              >
                {genre}
              </span>
            ))}
            {genres.length > 6 && (
              <span className="badge badge-neutral">
                +{genres.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--neutral-50)' }}>
          <BookOpenIcon className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--primary-500)' }} />
          <div className="text-2xl font-bold mb-1" style={{ color: 'var(--primary-600)' }}>
            {stats?.booksRead || 0}
          </div>
          <div className="text-xs" style={{ color: 'var(--neutral-600)' }}>
            Books Read
          </div>
        </div>

        <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--neutral-50)' }}>
          <UsersIcon className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--primary-500)' }} />
          <div className="text-2xl font-bold mb-1" style={{ color: 'var(--primary-600)' }}>
            {profile?.followers_count || 0}
          </div>
          <div className="text-xs" style={{ color: 'var(--neutral-600)' }}>
            Followers
          </div>
        </div>

        <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--neutral-50)' }}>
          <UsersIcon className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--primary-500)' }} />
          <div className="text-2xl font-bold mb-1" style={{ color: 'var(--primary-600)' }}>
            {profile?.following_count || 0}
          </div>
          <div className="text-xs" style={{ color: 'var(--neutral-600)' }}>
            Following
          </div>
        </div>

        <div className="text-center p-4 rounded-lg" style={{ backgroundColor: 'var(--neutral-50)' }}>
          <StarSolidIcon className="w-6 h-6 mx-auto mb-2" style={{ color: 'var(--accent-500)' }} />
          <div className="text-2xl font-bold mb-1" style={{ color: 'var(--primary-600)' }}>
            {stats?.reviewsWritten || 0}
          </div>
          <div className="text-xs" style={{ color: 'var(--neutral-600)' }}>
            Reviews
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <motion.button
          onClick={onEditProfile}
          className="btn btn-primary flex-1 flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <PencilIcon className="w-4 h-4" />
          Edit Profile
        </motion.button>
        <motion.button
          className="btn btn-secondary flex-1 flex items-center justify-center gap-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <HeartIcon className="w-4 h-4" />
          Activity
        </motion.button>
      </div>
    </motion.div>
  );
};

export default SimpleUserProfileCard;
