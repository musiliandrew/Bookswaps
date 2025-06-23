import { useState, useCallback, useEffect } from 'react';
import { useUsers } from './useUsers';
import { useDebounce } from './useDebounce';
import { toast } from 'react-toastify';

export const useUserInteractions = (currentUserId, options = {}) => {
  const {
    getUserProfile,
    followUser,
    unfollowUser,
    removeFollower,
    getFollowStatus,
    followers,
    following,
    publicProfile,
  } = useUsers();

  const [userFollowStatuses, setUserFollowStatuses] = useState({});
  const { onDataChange } = options;

  // Debounced follow status fetching
  const debouncedGetFollowStatus = useDebounce(async (userId, otherUserId) => {
    try {
      const status = await getFollowStatus(userId, otherUserId);
      setUserFollowStatuses((prev) => ({
        ...prev,
        [otherUserId]: status,
      }));
    } catch (error) {
      console.error('Error fetching follow status:', error);
    }
  }, 300);

  // Fetch follow statuses for all relevant users
  useEffect(() => {
    if (currentUserId && followers.length > 0 || following.length > 0) {
      const allUsers = [...followers, ...following];
      const userIds = allUsers
        .map((user) => user.user_id)
        .filter((userId) => userId && !userFollowStatuses[userId]);

      if (userIds.length > 0) {
        userIds.forEach((userId) => {
          debouncedGetFollowStatus(currentUserId, userId);
        });
      }
    }
  }, [currentUserId, followers, following, userFollowStatuses, debouncedGetFollowStatus]);

  // Handle follow action
  const handleFollow = useCallback(async (userId, source = 'Search') => {
    if (!userId || typeof userId !== 'string') {
      toast.error('Invalid user ID');
      return false;
    }

    try {
      const result = await followUser(userId, source);
      if (result) {
        // Update local follow status
        setUserFollowStatuses((prev) => ({
          ...prev,
          [userId]: { 
            is_following: true, 
            is_mutual: result.is_mutual || false 
          },
        }));

        // Refresh user profile data
        await getUserProfile(publicProfile?.user_id || userId);
        
        // Notify parent component to refresh data
        if (onDataChange) {
          onDataChange();
        }

        toast.success('Followed user!');
        return true;
      }
    } catch (error) {
      console.error('Error following user:', error);
      toast.error('Failed to follow user');
    }
    return false;
  }, [followUser, getUserProfile, publicProfile, onDataChange]);

  // Handle unfollow action
  const handleUnfollow = useCallback(async (userId) => {
    if (!userId) {
      toast.error('Invalid user ID');
      return false;
    }

    try {
      const result = await unfollowUser(userId);
      if (result) {
        // Update local follow status
        setUserFollowStatuses((prev) => ({
          ...prev,
          [userId]: { 
            is_following: false, 
            is_mutual: false 
          },
        }));

        // Refresh user profile data
        await getUserProfile(publicProfile?.user_id || userId);
        
        // Notify parent component to refresh data
        if (onDataChange) {
          onDataChange();
        }

        toast.success('Unfollowed user!');
        return true;
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
      toast.error('Failed to unfollow user');
    }
    return false;
  }, [unfollowUser, getUserProfile, publicProfile, onDataChange]);

  // Handle remove follower action
  const handleRemoveFollower = useCallback(async (userId) => {
    if (!userId) {
      toast.error('Invalid user ID');
      return false;
    }

    try {
      const result = await removeFollower(userId);
      if (result) {
        // Refresh follow status
        const status = await getFollowStatus(currentUserId, userId);
        setUserFollowStatuses((prev) => ({
          ...prev,
          [userId]: status || { is_following: false, is_mutual: false },
        }));

        // Notify parent component to refresh data
        if (onDataChange) {
          onDataChange();
        }

        toast.success('Follower removed!');
        return true;
      }
    } catch (error) {
      console.error('Error removing follower:', error);
      toast.error('Failed to remove follower');
    }
    return false;
  }, [removeFollower, getFollowStatus, currentUserId, onDataChange]);

  // View user profile
  const viewUserProfile = useCallback(async (userId) => {
    if (!userId) {
      console.error('Invalid user ID for profile view');
      return null;
    }

    try {
      const userProfile = await getUserProfile(userId);
      if (userProfile) {
        // Fetch follow status for this user
        await debouncedGetFollowStatus(currentUserId, userId);
        return userProfile;
      }
    } catch (error) {
      console.error('Error viewing user profile:', error);
      toast.error('Failed to load user profile');
    }
    return null;
  }, [getUserProfile, currentUserId, debouncedGetFollowStatus]);

  // Refresh follow status for a specific user
  const refreshFollowStatus = useCallback(async (userId) => {
    if (currentUserId && userId) {
      await debouncedGetFollowStatus(currentUserId, userId);
    }
  }, [currentUserId, debouncedGetFollowStatus]);

  return {
    userFollowStatuses,
    handleFollow,
    handleUnfollow,
    handleRemoveFollower,
    viewUserProfile,
    refreshFollowStatus,
  };
};