import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import PasswordResetRequestForm from '../../components/auth/PasswordResetRequestForm';
import AuthLink from '../../components/auth/AuthLink';

function PasswordResetRequestPage() {
  const navigate = useNavigate();
  const { requestPasswordReset, error, isLoading, success } = useAuth();
  const [formError, setFormError] = useState('');

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (data) => {
    if (!validateEmail(data.email)) {
      setFormError('Please enter a valid email address.');
      return;
    }
    try {
      await requestPasswordReset(data);
    } catch {
      setFormError('Failed to send reset link. Please try again.');
    }
  };

  useEffect(() => {
    if (success) {
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [success, navigate]);

  return (
    <div className="min-h-screen bg-[#F5E8C7] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-md w-full bookish-glass bookish-shadow p-10 rounded-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
      >
        <motion.h2
          className="text-center text-3xl font-['Playfair_Display'] text-[#FF6F61] mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Reset Your Password
        </motion.h2>
        <motion.p
          className="text-center text-sm text-[#333] font-['Poppins'] mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Enter your email to receive a password reset link.
        </motion.p>
        <AnimatePresence>
          {(error || formError) && (
            <motion.p
              className="text-[#D32F2F] text-sm text-center mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {formError || error}
            </motion.p>
          )}
        </AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <PasswordResetRequestForm
            onSubmit={handleSubmit}
            error={error || formError}
            isLoading={isLoading}
            className="mt-6"
          />
        </motion.div>
        <AnimatePresence>
          {success && (
            <motion.p
              className="text-[#4CAF50] text-sm text-center mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              Reset link sent! Check your email and redirecting to login...
            </motion.p>
          )}
        </AnimatePresence>
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <AuthLink
            to="/login"
            text="Back to Sign In"
            className="text-[#333] hover:text-[#FFA726] font-['Poppins'] transition-colors"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default PasswordResetRequestPage;