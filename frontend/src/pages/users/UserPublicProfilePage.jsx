import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import UserProfileCard from '../../components/users/UserProfileCard';
import FollowersModal from '../../components/users/FollowersModal';
import ErrorMessage from '../../components/auth/ErrorMessage';
import Button from '../../components/common/Button';
import AuthLink from '../../components/auth/AuthLink';

function UserPublicProfilePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { getUserProfile, publicProfile, error, isLoading, isAuthenticated, getList, followers, isLoadingList, errorList } = useAuth();
  const [globalError, setGlobalError] = useState('');
  const [modalState, setModalState] = useState({ isOpen: false, type: '' });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      getUserProfile(id).catch(() => setGlobalError('Failed to load profile.'));
    }
  }, [id, isAuthenticated, getUserProfile, navigate]);

  const handleMessage = () => {
    // Initiate WebSocket chat (replace with ws/chats/)
    console.log(`Initiating chat with user ${id}`);
    navigate(`/chats/${id}`); // Adjust to actual chat route
  };

  const handleShowFollowers = () => {
    setModalState({ isOpen: true, type: 'followers' });
  };

  const handleShowFollowing = () => {
    setModalState({ isOpen: true, type: 'following' });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, type: '' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F5E8C7] flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bookish-spinner mx-auto"></div>
          <p className="text-[#333] font-['Poppins'] mt-2">Loading...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5E8C7] py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-md mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
      >
        <motion.h2
          className="text-center text-3xl font-['Playfair_Display'] text-[#FF6F61] mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          User Profile
        </motion.h2>

        {/* Global Error */}
        <AnimatePresence>
          {(error || globalError) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ErrorMessage text={globalError || error || 'User not found'} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Card */}
        <motion.div
          className="mt-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {publicProfile ? (
            <>
              <UserProfileCard
                user={publicProfile}
                onShowFollowers={handleShowFollowers}
                onShowFollowing={handleShowFollowing}
                className="mb-6"
              />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
              >
                <Button
                  type="button"
                  onClick={handleMessage}
                  className="w-full py-3 bookish-button-primary bg-[#FF6F61] text-white"
                  text="View Details"
                />
              </motion.div>
            </>
          ) : (
            <ErrorMessage text="User not found." />
          )}
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div
          className="mt-8 flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 sm:mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <Button
            type="button"
            text="Back to Search"
            onClick={() => navigate('/users/search')}
            className="w-full sm:w-auto bookish-button-rounded bg-[#B0B0B0] text-white py-2"
          />
          <AuthLink
            to="/profile/me"
            text="Back to My Profile"
            className="text-[#333] hover:text-[#FFA726] font-['Poppins'] text-sm text-center w-full sm:w-auto"
          />
        </motion.div>
      </motion.div>

      {/* Followers Modal */}
      <FollowersModal
        open={modalState.isOpen}
        onClose={handleCloseModal}
        type={modalState.type}
        userId={id}
        getList={getList}
        list={followers}
        isLoading={isLoadingList}
        error={errorList}
      />
    </div>
  );
}

export default UserPublicProfilePage;