import { parseGenres } from './genreParser';

/**
 * Processes raw user statistics and profile data into a standardized format
 * @param {Object} userStats - Raw user statistics from API
 * @param {Object} profile - User profile data
 * @returns {Object} - Processed profile statistics
 */
export const processProfileStats = (userStats, profile) => {
  if (userStats) {
    return {
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
    };
  }

  // Fallback when no stats are available
  return {
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
};

/**
 * Custom hook for processing profile statistics
 * @param {Object} userStats - Raw user statistics
 * @param {Object} profile - User profile data
 * @returns {Object} - Processed profile statistics
 */
export const useProcessedProfileStats = (userStats, profile) => {
  return processProfileStats(userStats, profile);
};

export default processProfileStats;
