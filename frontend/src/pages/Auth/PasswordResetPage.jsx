import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import PasswordResetForm from '../../components/auth/PasswordResetForm';
import AuthLink from '../../components/auth/AuthLink';

const PasswordResetPage = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const { confirmPasswordReset, requestPasswordReset, error, isLoading, success } = useAuth();
  const [formError, setFormError] = useState('');

  const handleSubmit = async (data) => {
    try {
      if (token) {
        await confirmPasswordReset({ uid: 'uid-placeholder', token, new_password: data.new_password });
      } else {
        if (!/^\S+@\S+\.\S+$/.test(data.email)) {
          setFormError('Please enter a valid email address.');
          return;
        }
        await requestPasswordReset({ email: data.email });
      }
    } catch {
      setFormError('Failed to process request. Please try again or request a new link.');
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
          {token ? 'Set New Password' : 'Reset Your Password'}
        </motion.h2>
        <motion.p
          className="text-center text-sm text-[#333] font-['Poppins'] mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {token ? 'Enter your new password to complete the reset.' : 'Enter your email to receive a password reset link.'}
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
          <PasswordResetForm onSubmit={handleSubmit} error={error || formError} isLoading={isLoading} token={token} />
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
              {token ? 'Password reset successful!' : 'Reset link sent!'} Redirecting to login...
            </motion.p>
          )}
        </AnimatePresence>
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <AuthLink to="/login" text="Back to Sign In" className="text-[#333] hover:text-[#FFA726] font-['Poppins'] transition-colors" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PasswordResetPage;