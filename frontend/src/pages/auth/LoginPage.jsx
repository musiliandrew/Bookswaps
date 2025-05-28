import { useState } from 'react';
import { motion } from 'framer-motion';
import LoginForm from '../../components/auth/LoginForm';
import AuthLink from '../../components/auth/AuthLink';

const LoginPage = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (loginCredentials) => {
    setIsLoading(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      if (loginCredentials.username === 'demo' && loginCredentials.password === 'password') {
        console.log('Login successful!');
        setError('');
      } else {
        setError('Invalid username or password. Try demo/password');
      }
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bookish-gradient py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 floating-elements" />
      
      {/* Floating book icons */}
      <motion.div
        className="absolute top-20 left-20 text-[var(--primary)] opacity-20"
        animate={{ 
          y: [0, -20, 0],
          rotate: [0, 5, 0]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      >
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1z"/>
        </svg>
      </motion.div>

      <motion.div
        className="absolute bottom-20 right-20 text-[var(--accent)] opacity-20"
        animate={{ 
          y: [0, 15, 0],
          rotate: [0, -3, 0]
        }}
        transition={{ 
          duration: 5, 
          repeat: Infinity, 
          ease: "easeInOut",
          delay: 1
        }}
      >
        <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        </svg>
      </motion.div>

      <motion.div
        className="max-w-md w-full bookish-glass bookish-shadow rounded-2xl p-8 relative z-10"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex flex-row items-center justify-center mb-4">
            <motion.img
              src="/book.svg"
              alt="BookSwaps Logo"
              className="w-8 h-8 mr-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.5 }}
            />
            <motion.h2
              className="text-3xl font-bold font-['Lora']"
              style={{ color: '#456A76' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              BookSwaps
            </motion.h2>
          </div>
          <motion.h1
            className="text-2xl font-bold font-['Lora'] text-gradient mb-2"
            animate={{ 
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "easeInOut" 
            }}
          >
            Welcome Back
          </motion.h1>
          <motion.p
            className="text-[var(--text)] font-['Open_Sans'] text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Sign in to continue your literary journey
          </motion.p>
        </motion.div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <LoginForm
            onSubmit={handleLogin}
            error={error}
            isLoading={isLoading}
          />
        </motion.div>

        {/* Links */}
        <motion.div
          className="mt-8 text-center space-y-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <AuthLink
            to="/signup"
            text="Don't have an account? Join BookSwap"
          />
          <AuthLink
            to="/password/reset"
            text="Forgot your password?"
          />
        </motion.div>

        {/* Demo credentials hint */}
        <motion.div
          className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <p className="text-xs text-blue-800 text-center font-['Open_Sans']">
            <strong>Demo:</strong> username: demo, password: password
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;