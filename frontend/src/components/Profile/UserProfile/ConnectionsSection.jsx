import { useState, useEffect } from 'react';
import UserList from './UserList';
import Pagination from '../../Common/Pagination';

const ConnectionsSection = ({
  followers,
  following,
  mutualFollowers,
  pagination,
  currentPage,
  onPageChange,
  onViewProfile,
  onFollow,
  onUnfollow,
  onRemoveFollower, // Added prop
  userFollowStatuses,
  isLoading,
  initialActiveList = 'followers', // New prop with default value
}) => {
  const [activeList, setActiveList] = useState(initialActiveList);

  // Update active list when initialActiveList prop changes
  useEffect(() => {
    setActiveList(initialActiveList);
  }, [initialActiveList]);

  const lists = [
    { id: 'followers', label: 'Followers', users: followers, type: 'followers' },
    { id: 'following', label: 'Following', users: following, type: 'following' },
    { id: 'mutual', label: 'Mutual', users: mutualFollowers, type: 'mutual' },
  ];

  return (
    <div className="bookish-glass p-4 rounded-xl">
      <nav className="flex gap-2 mb-4 border-b border-[var(--secondary)]/20">
        {lists.map((list) => (
          <button
            key={list.id}
            onClick={() => setActiveList(list.id)}
            className={`px-3 py-1.5 font-['Open_Sans'] text-sm ${
              activeList === list.id
                ? 'text-[var(--accent)] border-b-2 border-[var(--accent)]'
                : 'text-[#456A76] hover:text-[var(--accent)]'
            }`}
          >
            {list.label}
          </button>
        ))}
      </nav>
      {lists.map(
        (list) =>
          activeList === list.id && (
            <div key={list.id}>
              <h2 className="text-lg font-['Lora'] text-[#456A76] mb-3">{list.label}</h2>
              <UserList
                users={list.users}
                onViewProfile={onViewProfile}
                onFollow={onFollow}
                onUnfollow={onUnfollow}
                onRemoveFollower={onRemoveFollower} // Pass new prop
                userFollowStatuses={userFollowStatuses}
                isLoading={isLoading}
                listType={list.type} // Pass list type to UserList
              />
              <Pagination
                type={list.type}
                currentPage={currentPage[list.type]}
                totalPages={pagination[list.type].totalPages}
                onPageChange={onPageChange}
              />
            </div>
          ),
      )}
    </div>
  );
};

export default ConnectionsSection;