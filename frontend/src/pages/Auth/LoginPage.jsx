import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoginForm from '../../components/Auth/LoginForm';
import AuthLink from '../../components/Auth/AuthLink';
import GoogleAuthButton from '../../components/Auth/GoogleAuthButton';

const LoginPage = () => {
  const { login, error: authError, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (loginCredentials) => {
    const success = await login(loginCredentials);
    if (success) {
      navigate('/library', { replace: true });
    }
  };

  const handleGoogleAuth = () => {
    // Handle Google OAuth success - navigate to main app
    navigate('/library', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bookish-gradient py-4 px-2 sm:px-4 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 floating-elements" />
      <motion.div
        className="absolute top-10 left-10 text-[var(--primary)] opacity-20 hidden sm:block"
        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1z"/>
        </svg>
      </motion.div>
      <motion.div
        className="absolute bottom-10 right-10 text-[var(--accent)] opacity-20 hidden sm:block"
        animate={{ y: [0, 15, 0], rotate: [0, -3, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        </svg>
      </motion.div>
      <motion.div
        className="w-full max-w-sm bookish-glass bookish-shadow rounded-xl p-4 sm:p-6 relative z-10"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      >
        <motion.div
          className="text-center mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex flex-row items-center justify-center mb-2">
            <motion.img
              src="/book.svg"
              alt="BookSwaps Logo"
              className="w-8 h-8 sm:w-7 sm:h-7 mr-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            />
            <motion.h2
              className="text-2xl sm:text-2xl font-bold font-['Lora'] app-name"
              style={{ color: '#456A76' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              BookSwaps
            </motion.h2>
          </div>
          <motion.h1
            className="text-xl font-bold font-['Lora'] text-gradient mb-1"
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            Welcome Back
          </motion.h1>
          <motion.p
            className="text-[var(--text)] font-['Open_Sans'] text-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Sign in to continue your literary journey
          </motion.p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <LoginForm onSubmit={handleLogin} error={authError} isLoading={authLoading} compact />
        </motion.div>

        {/* Google OAuth Section */}
        <motion.div
          className="mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          <div className="mt-2">
            <GoogleAuthButton
              onSuccess={handleGoogleAuth}
              text="Sign in with Google"
              small
            />
          </div>
        </motion.div>

        <motion.div
          className="mt-4 text-center space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <div>
            <AuthLink to="/register" text="Don't have an account? Join BookSwap" />
          </div>
          <div>
            <AuthLink to="/password-reset" text="Forgot your password?" />
          </div>
        </motion.div>
      </motion.div>
      {/* Responsive styles */}
      <style>
        {`
          @media (max-width: 640px) {
            .bookish-glass, .bookish-shadow {
              border-radius: 0.75rem !important;
            }
            .bookish-glass {
              padding: 1rem !important;
            }
            /* Keep app name prominent on mobile */
            .app-name {
              font-size: 1.5rem !important;
            }
            /* Make other text smaller but not the app name */
            .text-2xl:not(.app-name), .text-3xl:not(.app-name) {
              font-size: 1.25rem !important;
            }
            .text-xl {
              font-size: 1rem !important;
            }
            .text-gradient {
              font-size: 1rem !important;
            }
            .max-w-sm {
              max-width: 95vw !important;
            }
            .p-4, .p-6 {
              padding: 0.75rem !important;
            }
            .mb-4, .mb-8 {
              margin-bottom: 0.75rem !important;
            }
            .mt-4, .mt-6, .mt-8 {
              margin-top: 0.75rem !important;
            }
            .space-y-6 {
              --tw-space-y-reverse: 0;
              margin-top: 0 !important;
              margin-bottom: 0 !important;
            }
          }
        `}
      </style>
    </div>
  );
};

export default LoginPage;