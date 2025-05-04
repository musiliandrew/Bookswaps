import { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

function UserProfileCard({ user, onShowFollowers, onShowFollowing }) {
  const { getFollowStatus, followUser, unfollowUser, isAuthenticated, followStatus, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user.user_id) {
      getFollowStatus(user.user_id);
    }
  }, [user.user_id, isAuthenticated, getFollowStatus]);

  const handleFollowToggle = () => {
    if (!isAuthenticated) {
      return;
    }
    if (followStatus?.is_following) {
      unfollowUser(user.user_id);
    } else {
      followUser(user.user_id);
    }
  };

  return (
    <div className="bg-[var(--secondary)] p-6 rounded-md shadow bookish-border">
      <h3 className="text-xl font-semibold text-[var(--primary)]">
        {user.username}
      </h3>
      <p className="mt-2 text-sm text-gray-600">
        City: {user.city || 'Not set'}
      </p>
      <div className="mt-2">
        <label className="block text-sm font-medium text-[var(--primary)]">
          Favorite Genres
        </label>
        <div className="mt-1 flex flex-wrap gap-2">
          {user.genres?.length ? (
            user.genres.map((genre) => (
              <span
                key={genre}
                className="bg-[var(--primary)] text-[var(--secondary)] px-2 py-1 rounded-full text-xs"
              >
                {genre}
              </span>
            ))
          ) : (
            <p className="text-sm text-gray-600">No genres selected</p>
          )}
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-600">
        Location Features: {user.chat_preferences?.location_enabled ? 'Enabled' : 'Disabled'}
      </p>
      <div className="mt-4 flex space-x-4">
        <button
          onClick={() => onShowFollowers(user.user_id)}
          className="text-[var(--primary)] hover:underline"
        >
          Followers: {user.followers_count || 0}
        </button>
        <button
          onClick={() => onShowFollowing(user.user_id)}
          className="text-[var(--primary)] hover:underline"
        >
          Following: {user.following_count || 0}
        </button>
      </div>
      {isAuthenticated && (
        <Button
          type="button"
          text={followStatus?.is_following ? 'Unfollow' : 'Follow'}
          onClick={handleFollowToggle}
          disabled={isLoading}
          className={`mt-4 w-full ${followStatus?.is_following ? 'bg-red-600 hover:bg-red-700' : 'bg-[var(--primary)] hover:bg-opacity-90'}`}
        />
      )}
    </div>
  );
}

export default UserProfileCard;