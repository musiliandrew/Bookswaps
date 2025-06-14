import { useEffect } from 'react';
import UserList from './UserList';
import Pagination from './Pagination';

const DiscoverSection = ({
  recommendedUsers,
  searchResults,
  searchQuery,
  pagination,
  currentPage,
  onPageChange,
  onViewProfile,
  onFollow,
  onUnfollow,
  userFollowStatuses,
  isLoading,
}) => {
  useEffect(() => {
    console.log('DiscoverSection recommendedUsers:', recommendedUsers); // Debug log
  }, [recommendedUsers]);

  return (
    <div className="space-y-4">
      {searchQuery && (
        <div className="bookish-glass p-4 rounded-xl">
          <h2 className="text-lg font-['Lora'] text-[#456A76] mb-3">Search Results</h2>
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
            currentPage={currentPage.search}
            totalPages={pagination.search.totalPages || 1}
            onPageChange={onPageChange}
          />
        </div>
      )}
      <div className="bookish-glass p-4 rounded-xl">
        <h2 className="text-lg font-['Lora'] text-[#456A76] mb-3">Recommended Readers</h2>
        <UserList
          users={recommendedUsers}
          onViewProfile={onViewProfile}
          onFollow={onFollow}
          onUnfollow={onUnfollow}
          userFollowStatuses={userFollowStatuses}
          isLoading={isLoading}
        />
        <Pagination
          type="recommended"
          currentPage={currentPage.recommended}
          totalPages={pagination.recommended.totalPages || 1}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};

export default DiscoverSection;