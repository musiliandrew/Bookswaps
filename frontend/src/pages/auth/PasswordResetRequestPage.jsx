import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import PasswordResetRequestForm from '../../components/auth/PasswordResetRequestForm';
import AuthLink from '../../components/auth/AuthLink';

function PasswordResetRequestPage() {
  const navigate = useNavigate();
  const { requestPasswordReset, error, isLoading, success } = useAuth();

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

  const handleSubmit = async (data) => {
    await requestPasswordReset(data);
  };

  useEffect(() => {
    if (success) {
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [success, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8 relative">
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

      {/* Frosted-Glass Container */}
      <motion.div
        className="max-w-md w-full frosted-glass p-8"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.h2
          className="text-center text-2xl sm:text-3xl font-['Lora'] text-[var(--primary)] text-shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Reset Your Password
        </motion.h2>
        <motion.p
          className="mt-2 text-center text-sm text-[var(--text)] font-['Open_Sans']"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Enter your email to receive a password reset link.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <PasswordResetRequestForm
            onSubmit={handleSubmit}
            error={error}
            isLoading={isLoading}
            className="mt-6"
          />
        </motion.div>
        {success && (
          <motion.p
            className="text-[var(--primary)] text-sm text-center mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            Reset link sent! Check your email and redirecting to login...
          </motion.p>
        )}
        <motion.div
          className="mt-4 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <AuthLink
            to="/login"
            text="Back to Sign In"
            className="text-[var(--primary)] hover:text-[var(--accent)] transition-colors"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default PasswordResetRequestPage;