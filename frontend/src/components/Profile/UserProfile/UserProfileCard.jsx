import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserStats } from '../../../hooks/useUserStats';
import ShareableProfileCard from '../ShareableProfileCard';
import {
  HeartIcon,
  ChatBubbleLeftRightIcon,
  ShareIcon,
  BookOpenIcon,
  UsersIcon,
  StarIcon,
  MapPinIcon,
  CalendarIcon,
  SparklesIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  StarIcon as StarSolidIcon,
  BookmarkIcon as BookmarkSolidIcon
} from '@heroicons/react/24/solid';

// Enhanced helper function to parse genres that might be double-encoded
const parseGenres = (genres) => {
  if (!genres) return [];

  // If it's already an array, clean each item
  if (Array.isArray(genres)) {
    return genres
      .map(genre => {
        if (typeof genre === 'string') {
          // Handle double-encoded strings like ["[\"Sci-fi\"", "\"Fiction\""]
          let cleaned = genre;

          // Remove outer brackets and quotes
          cleaned = cleaned.replace(/^\["|"\]$/g, '');
          cleaned = cleaned.replace(/^"|"$/g, '');
          cleaned = cleaned.replace(/\\"/g, '"');

          // Split by comma if it contains multiple genres
          if (cleaned.includes('","') || cleaned.includes('", "')) {
            return cleaned.split(/",\s*"/).map(g => g.replace(/^"|"$/g, '').trim());
          }

          return cleaned.trim();
        }
        return genre;
      })
      .flat() // Flatten in case we split any strings
      .filter(genre => genre && genre.length > 0) // Remove empty strings
      .map(genre => genre.charAt(0).toUpperCase() + genre.slice(1)); // Capitalize first letter
  }

  // If it's a string, try to parse it
  if (typeof genres === 'string') {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(genres);
      return parseGenres(parsed); // Recursively parse the result
    } catch {
      // If parsing fails, clean up the string manually
      let cleaned = genres;

      // Remove brackets and quotes
      cleaned = cleaned.replace(/[\[\]"\\]/g, '');

      // Split by comma and clean each item
      return cleaned
        .split(',')
        .map(genre => genre.trim())
        .filter(genre => genre.length > 0)
        .map(genre => genre.charAt(0).toUpperCase() + genre.slice(1));
    }
  }

  return [];
};

const UserProfileCard = ({
  user,
  isOwnProfile,
  followStatus,
  onFollow,
  onUnfollow,
  onRefreshProfile // Add this new prop
}) => {
  const [localUser, setLocalUser] = useState(user);
  const [localFollowStatus, setLocalFollowStatus] = useState(followStatus);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);

  // Fetch user statistics
  const { stats: userStats, isLoading: statsLoading } = useUserStats(user?.user_id);

  // Update local state when props change
  useEffect(() => {
    setLocalUser(user);
  }, [user]);

  useEffect(() => {
    setLocalFollowStatus(followStatus);
  }, [followStatus]);

  if (!localUser) return <p className="text-[var(--text)] text-center">Profile data not available.</p>;

  const handleFollow = async () => {
    if (!onFollow) return;
    
    setIsProcessing(true);
    try {
      // Optimistically update UI
      setLocalUser(prev => ({
        ...prev,
        followers_count: (prev.followers_count || 0) + 1
      }));
      setLocalFollowStatus({
        is_following: true,
        is_mutual: false
      });
      
      // Perform the actual follow action
      await onFollow();
      
      // Refresh profile data from server
      if (onRefreshProfile) {
        await onRefreshProfile();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUnfollow = async () => {
    if (!onUnfollow) return;
    
    setIsProcessing(true);
    try {
      // Optimistically update UI
      setLocalUser(prev => ({
        ...prev,
        followers_count: Math.max((prev.followers_count || 1) - 1, 0)
      }));
      setLocalFollowStatus({
        is_following: false,
        is_mutual: false
      });
      
      // Perform the actual unfollow action
      await onUnfollow();
      
      // Refresh profile data from server
      if (onRefreshProfile) {
        await onRefreshProfile();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Process real stats data
  const profileStats = userStats ? {
    booksRead: userStats.books_read || 0,
    booksOwned: userStats.books_owned || 0,
    booksShared: userStats.books_shared || 0,
    booksReceived: userStats.books_received || 0,
    reviewsWritten: userStats.reviews_written || 0,
    likesReceived: userStats.likes_received || 0,
    bookmarksCount: userStats.bookmarks_count || 0,
    favoritesCount: userStats.favorites_count || 0,
    activeSwaps: userStats.active_swaps || 0,
    joinDate: userStats.join_date || localUser?.created_at,
    readingStreak: userStats.reading_streak || 0,
    daysAsMember: userStats.days_as_member || 0,
    achievements: userStats.achievements || [],
    lastActive: userStats.last_active,
    isOnline: userStats.last_active ?
      (new Date() - new Date(userStats.last_active)) < 5 * 60 * 1000 : false // Online if active within 5 minutes
  } : {
    booksRead: 0,
    booksOwned: 0,
    booksShared: 0,
    booksReceived: 0,
    reviewsWritten: 0,
    likesReceived: 0,
    bookmarksCount: 0,
    favoritesCount: 0,
    activeSwaps: 0,
    joinDate: localUser?.created_at,
    readingStreak: 0,
    daysAsMember: 0,
    achievements: [],
    lastActive: null,
    isOnline: false
  };

  return (
    <motion.div
      className="profile-card-enhanced rounded-2xl mb-6 overflow-hidden border border-white/20"
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 via-transparent to-[var(--accent)]/10" />

      {/* Content */}
      <div className="relative p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Enhanced Profile Picture */}
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {/* Animated Border */}
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)] via-[var(--primary)] to-[var(--accent)] rounded-full blur-sm opacity-60 animate-pulse" />

            {/* Profile Picture Container */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-3 border-white/30 shadow-2xl">
              <img
                src={localUser.profile_picture || '/default-avatar.png'}
                alt={localUser.username}
                className="w-full h-full object-cover"
              />

              {/* Online Status */}
              {profileStats.isOnline && (
                <motion.div
                  className="absolute bottom-2 right-2 w-4 h-4 bg-[var(--accent)] rounded-full border-2 border-white shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 }}
                />
              )}

              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </motion.div>

          {/* Profile Information */}
          <div className="flex-1 text-center sm:text-left">
            {/* Name and Status */}
            <motion.div
              className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-center sm:justify-start gap-3">
                <h2 className="text-2xl sm:text-3xl font-['Lora'] text-gradient font-bold">
                  {localUser.username}
                </h2>

                {/* Mutual Badge */}
                {localFollowStatus?.is_mutual && !isOwnProfile && (
                  <motion.span
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] text-white text-xs rounded-full shadow-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <HeartSolidIcon className="w-3 h-3" />
                    Mutual
                  </motion.span>
                )}
              </div>
            </motion.div>

            {/* Location and Join Date */}
            <motion.div
              className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mb-3 text-sm text-[var(--text)]/70"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-1">
                <MapPinIcon className="w-4 h-4" />
                <span>{localUser.city}, {localUser.country}</span>
              </div>
              <div className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                <span>Joined {new Date(profileStats.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
              </div>
            </motion.div>

            {/* Bio */}
            <motion.p
              className="text-[var(--text)] mb-4 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {localUser.about_you || 'Passionate reader exploring new worlds through books 📚✨'}
            </motion.p>

            {/* Genres */}
            <motion.div
              className="flex flex-wrap gap-2 justify-center sm:justify-start mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {parseGenres(localUser.genres)?.map((genre, index) => (
                <motion.span
                  key={genre}
                  className="px-3 py-1 bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/20 text-[var(--text)] text-sm rounded-full border border-white/20 backdrop-blur-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  {genre}
                </motion.span>
              ))}
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <div className="stats-card p-3 rounded-xl text-center">
                <BookOpenIcon className="w-5 h-5 mx-auto mb-1 text-[var(--primary)]" />
                <div className="text-lg font-bold text-[var(--text)]">
                  {statsLoading ? '...' : profileStats.booksRead}
                </div>
                <div className="text-xs text-[var(--text)]/70">Books</div>
              </div>

              <div className="stats-card p-3 rounded-xl text-center">
                <UsersIcon className="w-5 h-5 mx-auto mb-1 text-[var(--accent)]" />
                <div className="text-lg font-bold text-[var(--text)]">{localUser.followers_count || 0}</div>
                <div className="text-xs text-[var(--text)]/70">Followers</div>
              </div>

              <div className="stats-card p-3 rounded-xl text-center">
                <StarSolidIcon className="w-5 h-5 mx-auto mb-1 text-[var(--accent)]" />
                <div className="text-lg font-bold text-[var(--text)]">
                  {statsLoading ? '...' : profileStats.reviewsWritten}
                </div>
                <div className="text-xs text-[var(--text)]/70">Reviews</div>
              </div>

              <div className="stats-card p-3 rounded-xl text-center">
                <HeartSolidIcon className="w-5 h-5 mx-auto mb-1 text-[var(--primary)]" />
                <div className="text-lg font-bold text-[var(--text)]">
                  {statsLoading ? '...' : profileStats.likesReceived}
                </div>
                <div className="text-xs text-[var(--text)]/70">Likes</div>
              </div>
            </motion.div>

            {/* Achievements */}
            {profileStats.achievements && profileStats.achievements.length > 0 && (
              <motion.div
                className="flex gap-2 justify-center sm:justify-start mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                {profileStats.achievements.slice(0, 3).map((achievement, index) => {
                  // Map icon names to actual icons
                  const getIcon = (iconName) => {
                    switch(iconName) {
                      case 'BookOpenIcon': return BookOpenIcon;
                      case 'ShareIcon': return ShareIcon;
                      case 'UsersIcon': return UsersIcon;
                      case 'StarIcon': return StarSolidIcon;
                      default: return TrophyIcon;
                    }
                  };

                  const IconComponent = getIcon(achievement.icon);

                  return (
                    <motion.div
                      key={achievement.id}
                      className="profile-achievement p-2 rounded-lg"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      whileHover={{ scale: 1.1 }}
                      title={achievement.description}
                    >
                      <IconComponent className={`w-5 h-5 ${achievement.color || 'text-[var(--accent)]'}`} />
                    </motion.div>
                  );
                })}
              </motion.div>
            )}

            {/* Action Buttons */}
            {!isOwnProfile && (
              <motion.div
                className="flex flex-wrap gap-3 justify-center sm:justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
              >
                {localFollowStatus?.is_following ? (
                  <motion.button
                    onClick={handleUnfollow}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl shadow-lg button-glow"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <UsersIcon className="w-4 h-4" />
                    {isProcessing ? 'Processing...' : 'Following'}
                  </motion.button>
                ) : (
                  <motion.button
                    onClick={handleFollow}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white rounded-xl shadow-lg button-glow"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <UsersIcon className="w-4 h-4" />
                    {isProcessing ? 'Processing...' : 'Follow'}
                  </motion.button>
                )}

                <motion.button
                  className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-[var(--text)] rounded-xl backdrop-blur-sm border border-white/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  Message
                </motion.button>

                <motion.button
                  onClick={() => setShowShareCard(true)}
                  className="flex items-center gap-2 px-4 py-3 bg-white/10 hover:bg-white/20 text-[var(--text)] rounded-xl backdrop-blur-sm border border-white/20"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Share Profile"
                >
                  <ShareIcon className="w-4 h-4" />
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Reading Streak Banner (for own profile) */}
        {isOwnProfile && (
          <motion.div
            className="mt-6 p-4 rounded-xl reading-streak-glow bg-gradient-to-r from-[var(--accent)]/20 to-[var(--primary)]/20 border border-[var(--accent)]/30"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] rounded-full flex items-center justify-center">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold text-[var(--text)]">
                    {statsLoading ? 'Loading...' : `${profileStats.readingStreak} Day Streak!`}
                  </div>
                  <div className="text-sm text-[var(--text)]/70">Keep up the amazing reading habit</div>
                </div>
              </div>
              <TrophyIcon className="w-8 h-8 text-[var(--accent)]" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Shareable Profile Card Modal */}
      <AnimatePresence>
        {showShareCard && (
          <ShareableProfileCard
            user={localUser}
            stats={profileStats}
            onClose={() => setShowShareCard(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UserProfileCard;