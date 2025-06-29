import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useProfileData } from '../../hooks/useProfileData';
import { useUserInteractions } from '../../hooks/useUserInteractions';
import { useUserStats } from '../../hooks/useUserStats';
import UserProfileCard from '../Profile/UserProfile/UserProfileCard';
import ConnectionsSection from '../Profile/UserProfile/ConnectionsSection';
import DiscoverSection from '../Profile/UserProfile/DiscoverSection';
import SimpleUserProfileCard from '../Profile/SimpleUserProfileCard';
import ShareableProfileCard from '../Profile/ShareableProfileCard';

import LoadingSpinner from '../Common/LoadingSpinner';
import ErrorDisplay from '../Common/ErrorDisplay';



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
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeSubTab, setActiveSubTab] = useState('profile');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [connectionsActiveList, setConnectionsActiveList] = useState('followers');

  // Navigation handlers
  const handleEditProfile = () => {
    // Navigate to settings tab in ProfilePage
    setSearchParams({ tab: 'settings' });
  };

  const handleUploadPhoto = () => {
    // Navigate to settings tab in ProfilePage
    setSearchParams({ tab: 'settings' });
  };

  // Only refresh profile data if we don't have it yet (removed excessive refresh)
  // The AuthContext already handles profile fetching and caching properly

  // Custom hook for managing profile data and pagination
  const {
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

  // Handle showing followers list
  const handleShowFollowers = useCallback(() => {
    setConnectionsActiveList('followers');
    setActiveSubTab('connections');
  }, []);

  // Handle showing following list
  const handleShowFollowing = useCallback(() => {
    setConnectionsActiveList('following');
    setActiveSubTab('connections');
  }, []);

  // Simple sections like in settings
  const sections = [
    {
      id: 'profile',
      label: 'Profile',
      icon: '👤'
    },
    {
      id: 'connections',
      label: 'Community',
      icon: '👥'
    },
    {
      id: 'discover',
      label: 'Discover',
      icon: '🔍'
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



      <div className="relative z-10 pt-4">
        {selectedUser ? (
          <UserProfileView
            user={selectedUser}
            currentUserId={profile.user_id}
            followStatus={userFollowStatuses[selectedUser.user_id]}
            onBack={handleBackToMain}
            onFollow={handleFollow}
            onUnfollow={handleUnfollow}
            currentUserStats={userStats} // Pass current user stats to avoid redundant API calls
          />
        ) : (
          <div>


            {/* Simple Navigation like Settings */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2 p-1 bookish-glass rounded-lg">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSubTab(section.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-['Open_Sans'] font-medium text-sm transition-all duration-200 ${
                      activeSubTab === section.id
                        ? 'bg-[var(--accent)] text-white shadow-sm'
                        : 'text-[var(--primary)] hover:text-[var(--accent)] hover:bg-white/50'
                    }`}
                  >
                    <span className="text-base">{section.icon}</span>
                    <span>{section.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Section */}
            <div className="bookish-glass rounded-lg p-6">
              {activeSubTab === 'profile' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <SimpleUserProfileCard
                    profile={profile}
                    stats={profileStats}
                    onShareProfile={() => setShowShareModal(true)}
                    onEditProfile={handleEditProfile}
                    onUploadPhoto={handleUploadPhoto}
                  />
                </motion.div>
              )}

              {activeSubTab === 'connections' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ConnectionsSection
                    followers={followers}
                    following={following}
                    mutualFollowers={mutualFollowers}
                    userFollowStatuses={userFollowStatuses}
                    isLoading={isLoading}
                    onViewProfile={handleViewUserProfile}
                    onFollow={handleFollow}
                    onUnfollow={handleUnfollow}
                    onRemoveFollower={handleRemoveFollower}
                    onShowFollowers={handleShowFollowers}
                    onShowFollowing={handleShowFollowing}
                    connectionsActiveList={connectionsActiveList}
                  />
                </motion.div>
              )}

              {activeSubTab === 'discover' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <DiscoverSection
                    recommendedUsers={recommendedUsers}
                    searchResults={searchResults}
                    searchQuery={searchQuery}
                    pagination={pagination}
                    userFollowStatuses={userFollowStatuses}
                    isLoading={isLoading}
                    onSearch={handleSearch}
                    onPageChange={handlePageChange}
                    onViewProfile={handleViewUserProfile}
                    onFollow={handleFollow}
                    onUnfollow={handleUnfollow}
                  />
                </motion.div>
              )}
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Share Profile Modal */}
      <AnimatePresence>
        {showShareModal && (
          <ShareableProfileCard
            user={profile}
            stats={profileStats}
            onClose={() => setShowShareModal(false)}
          />
        )}
      </AnimatePresence>
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
  onUnfollow,
  currentUserStats = null // Add stats prop to avoid redundant API calls
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
      stats={user.user_id === currentUserId ? currentUserStats : null} // Pass stats for current user to avoid redundant API calls
    />
  </motion.div>
);









export default ProfileSection;