import { useMemo } from 'react';
import UserList from './UserList';
import Pagination from '../../Common/Pagination';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const DiscoverSection = ({
  recommendedUsers,
  searchResults,
  searchQuery,
  onSearch, // New prop for handling search input changes
  pagination,
  currentPage,
  onPageChange,
  onViewProfile,
  onFollow,
  onUnfollow,
  userFollowStatuses,
  isLoading,
}) => {
  const filteredRecommendedUsers = useMemo(() => {
    return recommendedUsers?.filter(user => {
      const status = userFollowStatuses[user.user_id];
      return !status?.is_following;
    }) || [];
  }, [recommendedUsers, userFollowStatuses]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative w-full max-w-md mx-auto mb-4">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#456A76]" />
        <input
          type="text"
          value={searchQuery}
          onChange={onSearch}
          placeholder="Search book readers..."
          className="bookish-input w-full pl-10 pr-4 py-2 rounded-xl text-[var(--text)] text-sm focus:outline-none"
        />
      </div>

      {/* Search Results */}
      {searchQuery && (
        <div className="bookish-glass p-4 rounded-xl">
          <h2 className="text-lg font-['Lora'] text-[#456A76] mb-3">
            {searchResults.length > 0 
              ? `Search Results for "${searchQuery}"`
              : `No results found for "${searchQuery}"`}
          </h2>
          
          {searchResults.length > 0 ? (
            <>
              <UserList
                users={searchResults}
                onViewProfile={onViewProfile}
                onFollow={onFollow}
                onUnfollow={onUnfollow}
                userFollowStatuses={userFollowStatuses}
                isLoading={isLoading}
              />
              <Pagination
                type="search"
                currentPage={currentPage.search.page}
                totalPages={pagination.search.totalPages || 1}
                onPageChange={onPageChange}
              />
            </>
          ) : (
            <p className="text-[var(--text)] text-center py-4">
              No users match your search criteria.
            </p>
          )}
        </div>
      )}
      
      {/* Recommended Readers */}
      {filteredRecommendedUsers.length > 0 && (
        <div className="bookish-glass p-4 rounded-xl">
          <h2 className="text-lg font-['Lora'] text-[#456A76] mb-3">Recommended Readers</h2>
          <UserList
            users={filteredRecommendedUsers}
            onViewProfile={onViewProfile}
            onFollow={onFollow}
            onUnfollow={onUnfollow}
            userFollowStatuses={userFollowStatuses}
            isLoading={isLoading}
          />
          <Pagination
            type="recommended"
            currentPage={currentPage.recommended.page}
            totalPages={pagination.recommended.totalPages || 1}
            onPageChange={onPageChange}
          />
        </div>
      )}
      
      {/* No Recommendations */}
      {filteredRecommendedUsers.length === 0 && !isLoading && !searchQuery && (
        <div className="bookish-glass p-4 rounded-xl text-center">
          <p className="text-[var(--text)]">No new recommendations available.</p>
          <p className="text-sm text-[var(--secondary)] mt-1">
            Try searching for users or check back later for new suggestions.
          </p>
        </div>
      )}
    </div>
  );
};

export default DiscoverSection;