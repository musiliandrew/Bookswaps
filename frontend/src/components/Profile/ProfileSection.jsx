import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useProfileData } from '../../hooks/useProfileData';
import { useUserInteractions } from '../../hooks/useUserInteractions';
import { useUserStats } from '../../hooks/useUserStats';
import UserProfileCard from '../Profile/UserProfile/UserProfileCard';
import ConnectionsSection from '../Profile/UserProfile/ConnectionsSection';
import DiscoverSection from '../Profile/UserProfile/DiscoverSection';
import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorDisplay from '../Common/ErrorDisplay';
import {
  UserIcon,
  UsersIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  ShareIcon,
  PencilIcon,
  CameraIcon,
  SparklesIcon,
  TrophyIcon,
  CalendarIcon,
  MapPinIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  BookmarkIcon as BookmarkSolidIcon,
  StarIcon as StarSolidIcon
} from '@heroicons/react/24/solid';

// Enhanced helper function to parse genres - handles multiple levels of encoding
const parseGenres = (genres) => {
  if (!genres) return [];

  // Helper function to clean a single genre string
  const cleanGenre = (genre) => {
    if (typeof genre !== 'string') return genre;

    // Remove various quote and bracket combinations
    let cleaned = genre
      .replace(/^[[\\]"']+|[[\\]"']+$/g, '') // Remove leading/trailing brackets and quotes
      .replace(/\\"/g, '"') // Unescape quotes
      .replace(/\\'/g, "'") // Unescape single quotes
      .trim();

    return cleaned;
  };

  // If it's already an array, process each item
  if (Array.isArray(genres)) {
    return genres
      .map(genre => {
        if (typeof genre === 'string') {
          // Check if this string contains a JSON array
          if (genre.includes('[') && genre.includes(']')) {
            try {
              // Try to parse as JSON
              const parsed = JSON.parse(genre);
              if (Array.isArray(parsed)) {
                return parsed.map(cleanGenre);
              }
            } catch {
              // If JSON parsing fails, manually extract genres
              const match = genre.match(/\[(.*)\]/);
              if (match) {
                return match[1]
                  .split(',')
                  .map(g => cleanGenre(g))
                  .filter(g => g && g.length > 0);
              }
            }
          }

          // Handle comma-separated genres in a single string
          if (genre.includes(',')) {
            return genre.split(',').map(cleanGenre);
          }

          return cleanGenre(genre);
        }
        return genre;
      })
      .flat() // Flatten nested arrays
      .filter(genre => genre && typeof genre === 'string' && genre.length > 0)
      .map(genre => genre.charAt(0).toUpperCase() + genre.slice(1)); // Capitalize
  }

  // If it's a string, try multiple parsing approaches
  if (typeof genres === 'string') {
    // First, try direct JSON parsing
    try {
      const parsed = JSON.parse(genres);
      return parseGenres(parsed); // Recursively parse
    } catch {
      // If that fails, try to extract from the string manually

      // Handle cases like: ["[\"Sci-fi\", \"Fiction\"]"]
      if (genres.includes('[') && genres.includes(']')) {
        // Extract everything between the outermost brackets
        const match = genres.match(/\[(.*)\]/);
        if (match) {
          const innerContent = match[1];

          // Try to parse the inner content as JSON
          try {
            const innerParsed = JSON.parse(`[${innerContent}]`);
            return parseGenres(innerParsed);
          } catch {
            // Manual parsing - split by comma and clean
            return innerContent
              .split(',')
              .map(cleanGenre)
              .filter(genre => genre && genre.length > 0)
              .map(genre => genre.charAt(0).toUpperCase() + genre.slice(1));
          }
        }
      }

      // Fallback: treat as comma-separated string
      return genres
        .split(',')
        .map(cleanGenre)
        .filter(genre => genre && genre.length > 0)
        .map(genre => genre.charAt(0).toUpperCase() + genre.slice(1));
    }
  }

  return [];
};

const ProfileSection = () => {
  const { profile } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('profile');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isProfileExpanded, setIsProfileExpanded] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);

  // Custom hook for managing profile data and pagination
  const {
    publicProfile,
    followers,
    following,
    mutualFollowers,
    recommendedUsers,
    searchResults,
    searchQuery,
    pagination,
    isLoading,
    error,
    handleSearch,
    handlePageChange,
    retryLoad,
  } = useProfileData(profile?.user_id);

  // Custom hook for user interactions (follow/unfollow)
  const {
    userFollowStatuses,
    handleFollow,
    handleUnfollow,
    handleRemoveFollower,
    viewUserProfile,
  } = useUserInteractions(profile?.user_id, {
    onDataChange: () => {
      // Refresh relevant data when interactions happen
      handlePageChange('followers', pagination.followers.page, true);
      handlePageChange('following', pagination.following.page, true);
    }
  });

  // Fetch real user statistics
  const { stats: userStats } = useUserStats();

  // Process stats for display
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
    joinDate: userStats.join_date || profile?.created_at,
    readingStreak: userStats.reading_streak || 0,
    daysAsMember: userStats.days_as_member || 0,
    favoriteGenres: parseGenres(profile?.genres),
    achievements: userStats.achievements || [],
    lastActive: userStats.last_active
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
    joinDate: profile?.created_at,
    readingStreak: 0,
    daysAsMember: 0,
    favoriteGenres: parseGenres(profile?.genres),
    achievements: [],
    lastActive: null
  };

  // Handle viewing another user's profile
  const handleViewUserProfile = useCallback(async (userId) => {
    const userProfile = await viewUserProfile(userId);
    if (userProfile) {
      setSelectedUser(userProfile);
    }
  }, [viewUserProfile]);

  // Handle going back from user profile view
  const handleBackToMain = useCallback(() => {
    setSelectedUser(null);
  }, []);

  // Tab configuration with enhanced design
  const tabs = [
    {
      id: 'profile',
      label: 'Profile',
      icon: UserIcon,
      gradient: 'from-[var(--primary)] to-[var(--accent)]',
      description: 'Your reading journey'
    },
    {
      id: 'connections',
      label: 'Community',
      icon: UsersIcon,
      gradient: 'from-[var(--accent)] to-[var(--primary)]',
      description: 'Your book network'
    },
    {
      id: 'discover',
      label: 'Discover',
      icon: MagnifyingGlassIcon,
      gradient: 'from-[var(--primary)] to-[var(--accent)]',
      description: 'Find new readers'
    },
  ];

  // Loading state
  if (!profile) {
    return <LoadingSpinner message="Loading profile..." />;
  }

  // Error state
  if (error) {
    return (
      <ErrorDisplay 
        message={error || 'Failed to load profile data.'} 
        onRetry={retryLoad}
      />
    );
  }

  return (
    <div className="min-h-screen font-open-sans text-text">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header Section */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-lora font-bold text-gradient mb-4 relative">
            👤 My Profile
            <motion.div
              className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full opacity-20"
              animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </h1>
          <motion.p
            className="font-open-sans text-primary/80 text-lg max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Your reading journey, connections, and literary adventures
          </motion.p>
        </motion.div>

      {/* Stats Modal */}
      <AnimatePresence>
        {showStatsModal && (
          <StatsModal
            stats={profileStats}
            onClose={() => setShowStatsModal(false)}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 pt-4">
        {selectedUser ? (
          <UserProfileView
            user={selectedUser}
            currentUserId={profile.user_id}
            followStatus={userFollowStatuses[selectedUser.user_id]}
            onBack={handleBackToMain}
            onFollow={handleFollow}
            onUnfollow={handleUnfollow}
          />
        ) : (
          <EnhancedMainProfileView
            activeTab={activeSubTab}
            tabs={tabs}
            onTabChange={setActiveSubTab}
            profile={profile}
            publicProfile={publicProfile}
            profileStats={profileStats}
            followers={followers}
            following={following}
            mutualFollowers={mutualFollowers}
            recommendedUsers={recommendedUsers}
            searchResults={searchResults}
            searchQuery={searchQuery}
            pagination={pagination}
            userFollowStatuses={userFollowStatuses}
            isLoading={isLoading}
            isProfileExpanded={isProfileExpanded}
            onToggleExpanded={() => setIsProfileExpanded(!isProfileExpanded)}
            onShowStats={() => setShowStatsModal(true)}
            onSearch={handleSearch}
            onPageChange={handlePageChange}
            onViewProfile={handleViewUserProfile}
            onFollow={handleFollow}
            onUnfollow={handleUnfollow}
            onRemoveFollower={handleRemoveFollower}
          />
        )}
      </div>
      </div>
    </div>
  );
};

// Separate component for user profile view
const UserProfileView = ({ 
  user, 
  currentUserId, 
  followStatus, 
  onBack, 
  onFollow, 
  onUnfollow 
}) => (
  <motion.div
    initial={{ opacity: 0, x: 100 }}
    animate={{ opacity: 1, x: 0 }}
    className="px-4 mb-4 rounded-xl"
  >
    <button
      onClick={onBack}
      className="flex items-center justify-center py-2 mb-2 text-sm text-[var(--accent)] hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--accent)] rounded"
      aria-label="Go back to main profile view"
    >
      <span className="mr-2" aria-hidden="true">←</span> 
      Back
    </button>
    <UserProfileCard
      user={user}
      isOwnProfile={user.user_id === currentUserId}
      followStatus={followStatus || {}}
      onFollow={() => onFollow(user.user_id, 'Profile')}
      onUnFollow={() => onUnfollow(user.user_id)}
      onRefreshProfile={() => {}} // Handled by the hook
    />
  </motion.div>
);

// Enhanced Stats Modal Component
const StatsModal = ({ stats, onClose }) => (
  <motion.div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />

    <motion.div
      className="relative w-full max-w-md bookish-glass rounded-2xl p-6 border border-white/20"
      initial={{ scale: 0.9, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      exit={{ scale: 0.9, opacity: 0, y: 20 }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-['Lora'] text-gradient">Your Reading Stats</h3>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <svg className="w-5 h-5 text-[var(--text)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div
          className="text-center p-4 rounded-xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20"
          whileHover={{ scale: 1.05 }}
        >
          <BookOpenIcon className="w-8 h-8 mx-auto mb-2 text-[var(--primary)]" />
          <div className="text-2xl font-bold text-[var(--text)]">{stats.booksRead}</div>
          <div className="text-sm text-[var(--text)]/70">Books Read</div>
        </motion.div>

        <motion.div
          className="text-center p-4 rounded-xl bg-gradient-to-br from-[var(--accent)]/20 to-[var(--primary)]/20"
          whileHover={{ scale: 1.05 }}
        >
          <ShareIcon className="w-8 h-8 mx-auto mb-2 text-[var(--accent)]" />
          <div className="text-2xl font-bold text-[var(--text)]">{stats.booksShared}</div>
          <div className="text-sm text-[var(--text)]/70">Books Shared</div>
        </motion.div>

        <motion.div
          className="text-center p-4 rounded-xl bg-gradient-to-br from-[var(--accent)]/20 to-[var(--primary)]/20"
          whileHover={{ scale: 1.05 }}
        >
          <StarSolidIcon className="w-8 h-8 mx-auto mb-2 text-[var(--accent)]" />
          <div className="text-2xl font-bold text-[var(--text)]">{stats.reviewsWritten}</div>
          <div className="text-sm text-[var(--text)]/70">Reviews</div>
        </motion.div>

        <motion.div
          className="text-center p-4 rounded-xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20"
          whileHover={{ scale: 1.05 }}
        >
          <HeartSolidIcon className="w-8 h-8 mx-auto mb-2 text-[var(--primary)]" />
          <div className="text-2xl font-bold text-[var(--text)]">{stats.likesReceived}</div>
          <div className="text-sm text-[var(--text)]/70">Likes</div>
        </motion.div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <motion.div
          className="text-center p-3 rounded-lg bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20"
          whileHover={{ scale: 1.05 }}
        >
          <BookmarkSolidIcon className="w-6 h-6 mx-auto mb-1 text-[var(--primary)]" />
          <div className="text-lg font-bold text-[var(--text)]">{stats.bookmarksCount}</div>
          <div className="text-xs text-[var(--text)]/70">Bookmarks</div>
        </motion.div>

        <motion.div
          className="text-center p-3 rounded-lg bg-gradient-to-br from-[var(--accent)]/20 to-[var(--primary)]/20"
          whileHover={{ scale: 1.05 }}
        >
          <HeartSolidIcon className="w-6 h-6 mx-auto mb-1 text-[var(--accent)]" />
          <div className="text-lg font-bold text-[var(--text)]">{stats.favoritesCount}</div>
          <div className="text-xs text-[var(--text)]/70">Favorites</div>
        </motion.div>

        <motion.div
          className="text-center p-3 rounded-lg bg-gradient-to-br from-[var(--primary)]/20 to-[var(--accent)]/20"
          whileHover={{ scale: 1.05 }}
        >
          <ShareIcon className="w-6 h-6 mx-auto mb-1 text-[var(--primary)]" />
          <div className="text-lg font-bold text-[var(--text)]">{stats.activeSwaps}</div>
          <div className="text-xs text-[var(--text)]/70">Active Swaps</div>
        </motion.div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-5 h-5 text-[var(--primary)]" />
            <span className="text-sm text-[var(--text)]">Member since</span>
          </div>
          <span className="text-sm font-medium text-[var(--text)]">
            {new Date(stats.joinDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long'
            })}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
          <div className="flex items-center gap-3">
            <SparklesIcon className="w-5 h-5 text-[var(--accent)]" />
            <span className="text-sm text-[var(--text)]">Reading streak</span>
          </div>
          <span className="text-sm font-medium text-[var(--text)]">{stats.readingStreak} days</span>
        </div>
      </div>

      {stats.achievements && stats.achievements.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-[var(--text)] mb-3">Achievements</h4>
          <div className="flex gap-2 flex-wrap">
            {stats.achievements.slice(0, 4).map((achievement) => {
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
                  className="flex-1 min-w-[80px] text-center p-3 rounded-lg bg-gradient-to-br from-[var(--accent)]/20 to-[var(--primary)]/20"
                  whileHover={{ scale: 1.05 }}
                  title={achievement.description}
                >
                  <IconComponent className={`w-6 h-6 mx-auto mb-1 ${achievement.color || 'text-[var(--accent)]'}`} />
                  <div className="text-xs text-[var(--text)]/80">{achievement.name}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  </motion.div>
);

// Enhanced Main Profile View Component
const EnhancedMainProfileView = ({
  activeTab,
  tabs,
  onTabChange,
  profile,
  publicProfile,
  profileStats,
  followers,
  following,
  mutualFollowers,
  recommendedUsers,
  searchResults,
  searchQuery,
  pagination,
  userFollowStatuses,
  isLoading,
  isProfileExpanded,
  onToggleExpanded,
  onShowStats,
  onSearch,
  onPageChange,
  onViewProfile,
  onFollow,
  onUnfollow,
  onRemoveFollower,
}) => {
  return (
  <>
    {/* Enhanced Profile Header */}
    <EnhancedProfileHeader
      profile={publicProfile || profile}
      stats={profileStats}
      isExpanded={isProfileExpanded}
      onToggleExpanded={onToggleExpanded}
      onShowStats={onShowStats}
    />

    {/* Enhanced Tab Navigation */}
    <EnhancedTabNavigation
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
    />

    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <TabContent
        activeTab={activeTab}
        publicProfile={publicProfile}
        followers={followers}
        following={following}
        mutualFollowers={mutualFollowers}
        recommendedUsers={recommendedUsers}
        searchResults={searchResults}
        searchQuery={searchQuery}
        pagination={pagination}
        userFollowStatuses={userFollowStatuses}
        isLoading={isLoading}
        onSearch={onSearch}
        onPageChange={onPageChange}
        onViewProfile={onViewProfile}
        onFollow={onFollow}
        onUnfollow={onUnfollow}
        onRemoveFollower={onRemoveFollower}
      />
    </motion.div>
  </>
  );
};

// Enhanced Profile Header Component
const EnhancedProfileHeader = ({ profile, stats, onShowStats }) => (
  <motion.div
    className="relative mb-6 bookish-glass rounded-2xl overflow-hidden border border-white/20"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  >
    {/* Background Gradient */}
    <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 via-[var(--accent)]/5 to-[var(--primary)]/10" />

    {/* Profile Content */}
    <div className="relative p-6">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Profile Picture with Glow Effect */}
        <motion.div
          className="relative"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] rounded-full blur-lg opacity-30 animate-pulse" />
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-3 border-white/30 shadow-2xl">
            <img
              src={profile?.profile_picture || '/default-avatar.png'}
              alt={profile?.username}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>

          {/* Edit Button */}
          <motion.button
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-[var(--accent)] rounded-full flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <CameraIcon className="w-4 h-4 text-white" />
          </motion.button>
        </motion.div>

        {/* Profile Info */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
            <h1 className="text-2xl sm:text-3xl font-['Lora'] text-gradient font-bold">
              {profile?.username}
            </h1>
            <motion.button
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white text-sm rounded-full shadow-lg"
              whileHover={{ scale: 1.05, boxShadow: "0 8px 25px rgba(0,0,0,0.15)" }}
              whileTap={{ scale: 0.95 }}
            >
              <PencilIcon className="w-4 h-4" />
              Edit Profile
            </motion.button>
          </div>

          {/* Location & Join Date */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mb-3 text-sm text-[var(--text)]/70">
            <div className="flex items-center gap-1">
              <MapPinIcon className="w-4 h-4" />
              <span>{profile?.city}, {profile?.country}</span>
            </div>
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4" />
              <span>Joined {new Date(stats.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}</span>
            </div>
          </div>

          {/* Bio */}
          <motion.p
            className="text-[var(--text)] mb-4 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {profile?.about_you || 'Passionate reader exploring new worlds through books 📚✨'}
          </motion.p>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4 justify-center sm:justify-start mb-4">
            <motion.button
              onClick={onShowStats}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <BookOpenIcon className="w-5 h-5 text-[var(--primary)]" />
              <div className="text-left">
                <div className="text-lg font-bold text-[var(--text)]">{stats.booksRead}</div>
                <div className="text-xs text-[var(--text)]/70">Books</div>
              </div>
            </motion.button>

            <motion.div
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10"
              whileHover={{ scale: 1.05 }}
            >
              <UsersIcon className="w-5 h-5 text-[var(--accent)]" />
              <div className="text-left">
                <div className="text-lg font-bold text-[var(--text)]">{profile?.followers_count || 0}</div>
                <div className="text-xs text-[var(--text)]/70">Followers</div>
              </div>
            </motion.div>

            <motion.div
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10"
              whileHover={{ scale: 1.05 }}
            >
              <HeartSolidIcon className="w-5 h-5 text-red-500" />
              <div className="text-left">
                <div className="text-lg font-bold text-[var(--text)]">{stats.likesReceived}</div>
                <div className="text-xs text-[var(--text)]/70">Likes</div>
              </div>
            </motion.div>
          </div>

          {/* Favorite Genres */}
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {stats.favoriteGenres.map((genre, index) => (
              <motion.span
                key={genre}
                className="px-3 py-1 bg-gradient-to-r from-[var(--primary)]/20 to-[var(--accent)]/20 text-[var(--text)] text-sm rounded-full border border-white/20"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                {genre}
              </motion.span>
            ))}
          </div>
        </div>
      </div>

      {/* Reading Streak Banner */}
      <motion.div
        className="mt-6 p-4 rounded-xl bg-gradient-to-r from-[var(--accent)]/20 to-[var(--primary)]/20 border border-[var(--accent)]/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] rounded-full flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-[var(--text)]">{stats.readingStreak} Day Streak!</div>
              <div className="text-sm text-[var(--text)]/70">Keep up the great reading habit</div>
            </div>
          </div>
          <TrophyIcon className="w-8 h-8 text-[var(--accent)]" />
        </div>
      </motion.div>
    </div>
  </motion.div>
);

// Enhanced Tab Navigation Component
const EnhancedTabNavigation = ({ tabs, activeTab, onTabChange }) => (
  <nav
    className="flex mb-6 gap-2 p-2 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10"
    role="tablist"
    aria-label="Profile sections"
  >
    {tabs.map((tab, index) => {
      const Icon = tab.icon;
      const isActive = activeTab === tab.id;

      return (
        <motion.button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`relative flex-1 flex flex-col items-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 ${
            isActive
              ? 'text-white shadow-lg'
              : 'text-[var(--text)]/70 hover:text-[var(--text)] hover:bg-white/10'
          }`}
          role="tab"
          aria-selected={isActive}
          aria-controls={`tabpanel-${tab.id}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {/* Active Background */}
          {isActive && (
            <motion.div
              className={`absolute inset-0 bg-gradient-to-r ${tab.gradient} rounded-xl`}
              layoutId="activeTab"
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center gap-1">
            <Icon className="w-5 h-5" />
            <span className="text-sm font-medium">{tab.label}</span>
            <span className="text-xs opacity-70">{tab.description}</span>
          </div>
        </motion.button>
      );
    })}
  </nav>
);

// Tab content component
const TabContent = ({
  activeTab,
  publicProfile,
  followers,
  following,
  mutualFollowers,
  recommendedUsers,
  searchResults,
  searchQuery,
  pagination,
  userFollowStatuses,
  isLoading,
  onSearch,
  onPageChange,
  onViewProfile,
  onFollow,
  onUnfollow,
  onRemoveFollower,
}) => {
  switch (activeTab) {
    case 'profile':
      return (
        <div role="tabpanel" id="tabpanel-profile" aria-labelledby="tab-profile">
          {/* Shareable Profile Card */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-['Lora'] text-[var(--text)]">Shareable Profile</h3>
              <div className="flex gap-2">
                <button
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-[var(--primary)]/10 hover:bg-[var(--primary)]/20 text-[var(--primary)] rounded-lg transition-colors"
                  title="Share your profile"
                >
                  <ShareIcon className="w-4 h-4" />
                  Share
                </button>
                <button
                  className="flex items-center gap-2 px-3 py-2 text-sm bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 text-[var(--accent)] rounded-lg transition-colors"
                  title="Copy profile link"
                >
                  <LinkIcon className="w-4 h-4" />
                  Copy Link
                </button>
              </div>
            </div>
            <UserProfileCard
              user={publicProfile}
              isOwnProfile={true}
              followStatus={{}}
              onFollow={() => {}}
              onUnFollow={() => {}}
              onViewProfile={() => {}}
            />
          </div>
        </div>
      );
    
    case 'connections':
      return (
        <div role="tabpanel" id="tabpanel-connections" aria-labelledby="tab-connections">
          <ConnectionsSection
            followers={followers}
            following={following}
            mutualFollowers={mutualFollowers}
            pagination={pagination}
            currentPage={pagination}
            onPageChange={onPageChange}
            onViewProfile={onViewProfile}
            onFollow={onFollow}
            onUnfollow={onUnfollow}
            onRemoveFollower={onRemoveFollower}
            userFollowStatuses={userFollowStatuses}
            isLoading={isLoading}
          />
        </div>
      );
    
    case 'discover':
      return (
        <div role="tabpanel" id="tabpanel-discover" aria-labelledby="tab-discover">
          <DiscoverSection
            recommendedUsers={recommendedUsers}
            searchResults={searchResults}
            searchQuery={searchQuery}
            onSearch={onSearch}
            pagination={pagination}
            currentPage={pagination}
            onPageChange={onPageChange}
            onViewProfile={onViewProfile}
            onFollow={onFollow}
            onUnFollow={onUnfollow}
            userFollowStatuses={userFollowStatuses}
            isLoading={isLoading}
          />
        </div>
      );
    
    default:
      return null;
  }
};

export default ProfileSection;