import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import LoginForm from '../../components/auth/LoginForm';
import AuthLink from '../../components/auth/AuthLink';

function LoginPage() {
  const navigate = useNavigate();
  const { login, error, isLoading } = useAuth();
  const [formError, setFormError] = useState('');

  const handleLogin = async (credentials) => {
    if (!credentials.username || !credentials.password) {
      setFormError('Please fill in all fields');
      return;
    }
    const success = await login(credentials);
    if (success) {
      console.log('Navigating to /');
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--sage)] py-12 px-4 sm:px-6 lg:px-8">
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
          Log In to BookSwap
        </motion.h2>
        <motion.p
          className="mt-2 text-center text-sm text-[var(--text)] font-['Open_Sans']"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Sign in to connect with book lovers.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <LoginForm
            onSubmit={handleLogin}
            error={formError || error}
            isLoading={isLoading}
            className="mt-6"
          />
        </motion.div>
        <motion.div
          className="mt-4 text-center space-y-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <AuthLink
            to="/signup"
            text="Don’t have an account? Sign Up"
            className="text-[var(--primary)] hover:text-[var(--accent)] transition-colors"
          />
          <AuthLink
            to="/password/reset"
            text="Forgot Password?"
            className="text-[var(--primary)] hover:text-[var(--accent)] transition-colors"
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

export default LoginPage;