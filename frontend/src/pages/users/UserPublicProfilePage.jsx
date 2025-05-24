import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import UserProfileCard from '../../components/users/UserProfileCard';
import ErrorMessage from '../../components/auth/ErrorMessage';
import Button from '../../components/common/Button';
import AuthLink from '../../components/auth/AuthLink';

function UserPublicProfilePage() {
  const navigate = useNavigate();
  const { username } = useParams();
  const { getUserProfile, publicProfile, error, isLoading } = useAuth();

  // Dynamic background images
  const heroImages = [
    {
      src: '/src/assets/hero-bg.jpg',
      alt: 'Modern library with reference desk and bookshelves',
      objectPosition: '50% 50%',
    },
    {
      src: '/src/assets/reading-nook.jpg',
      alt: 'Cozy reading nook with person reading',
      objectPosition: '40% 50%',
    },
    {
      src: '/src/assets/warm-library.jpg',
      alt: 'Warm library reading room with clock',
      objectPosition: '50% 40%',
    },
  ];

  // Hero state
  const [currentImage, setCurrentImage] = useState(Math.floor(Math.random() * heroImages.length));

  // Rotate images every 7 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  useEffect(() => {
    if (!localStorage.getItem('access_token')) {
      navigate('/login');
    } else {
      getUserProfile(username);
    }
  }, [username, navigate, getUserProfile]);

  const handleMessage = () => {
    // Mock WebSocket chat initiation (replace with ws/chats/)
    console.log(`Initiating chat with ${username}`);
    navigate('/chats'); // Adjust to actual chat route
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <motion.p
          className="text-[var(--primary)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Loading...
        </motion.p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Dynamic Background */}
      <AnimatePresence>
        <motion.img
          key={heroImages[currentImage].src}
          src={heroImages[currentImage].src}
          alt={heroImages[currentImage].alt}
          className="absolute inset-0 w-full h-full object-cover hero-image"
          style={{ objectPosition: heroImages[currentImage].objectPosition }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-text bg-opacity-20" />

      {/* Main Content */}
      <motion.div
        className="max-w-2xl mx-auto w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2
          className="text-center text-2xl sm:text-3xl font-['Lora'] text-[var(--primary)] text-shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          User Profile
        </motion.h2>

        {/* Profile Card */}
        <motion.div
          className="mt-8 frosted-glass p-6"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {publicProfile ? (
            <>
              <UserProfileCard user={publicProfile} />
              <Button
                type="button"
                text="Message User"
                onClick={handleMessage}
                className="w-full bookish-button bookish-button--primary mt-4"
              />
            </>
          ) : (
            <ErrorMessage message={error || 'User not found'} />
          )}
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div
          className="mt-6 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Button
            type="button"
            text="Back to Search"
            onClick={() => navigate('/users/search')}
            className="w-full sm:w-auto bookish-button bookish-button--secondary"
          />
          <AuthLink
            to="/me/profile"
            text="Back to Your Profile"
            className="text-[var(--primary)] hover:text-[var(--accent)] transition-colors text-center"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default UserPublicProfilePage;