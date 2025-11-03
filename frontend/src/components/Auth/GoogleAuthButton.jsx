import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useRef } from 'react';

const GoogleAuthButton = ({ onSuccess, onError, text = "Continue with Google", className = "" }) => {
  const { googleAuth } = useAuth();
  const buttonRef = useRef(null);

  useEffect(() => {
    // Initialize Google Identity Services when component mounts
    if (window.google && window.google.accounts) {
      initializeGoogleAuth();
    } else {
      // Wait for Google script to load
      const checkGoogle = setInterval(() => {
        if (window.google && window.google.accounts) {
          clearInterval(checkGoogle);
          initializeGoogleAuth();
        }
      }, 100);

      // Cleanup interval after 10 seconds
      setTimeout(() => clearInterval(checkGoogle), 10000);
    }
  }, []);

  const initializeGoogleAuth = () => {
    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      console.log('Google Client ID:', clientId); // Debug log

      if (!clientId) {
        console.error('Google Client ID is missing from environment variables');
        return;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      console.log('Google OAuth initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Auth:', error);
    }
  };

  const handleCredentialResponse = async (response) => {
    try {
      if (!response.credential) {
        throw new Error('No credential received from Google');
      }

      // Call the googleAuth function from AuthContext
      const success = await googleAuth(response.credential);

      if (success && onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Google OAuth error:', error);
      if (onError) {
        onError(error);
      } else {
        toast.error('Google authentication failed');
      }
    }
  };

  const handleGoogleAuth = () => {
    try {
      if (!window.google || !window.google.accounts) {
        toast.error('Google services not loaded. Please refresh and try again.');
        return;
      }

      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
      if (!clientId) {
        toast.error('Google OAuth is not configured properly.');
        return;
      }

      // Re-initialize to ensure client_id is set
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Trigger Google One Tap
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          // If One Tap is not available, render the button
          if (buttonRef.current) {
            // Clear any existing content
            buttonRef.current.innerHTML = '';

            window.google.accounts.id.renderButton(buttonRef.current, {
              theme: 'outline',
              size: 'large',
              width: '100%',
              text: 'continue_with',
              shape: 'rectangular',
            });
          }
        }
      });
    } catch (error) {
      console.error('Google OAuth error:', error);
      if (onError) {
        onError(error);
      } else {
        toast.error('Google authentication failed');
      }
    }
  };

  return (
    <div ref={buttonRef}>
      <motion.button
        onClick={handleGoogleAuth}
        className={`
          w-full flex items-center justify-center gap-3 px-6 py-3
          border border-gray-300 rounded-lg bg-[var(--bg-card)] text-gray-700
          hover:bg-[var(--bg-primary)] hover:border-gray-400 transition-all duration-200
          font-medium shadow-sm hover:shadow-md
          ${className}
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
      {/* Google Icon SVG */}
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        className="flex-shrink-0"
      >
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
        <span>{text}</span>
      </motion.button>
    </div>
  );
};

export default GoogleAuthButton;
