import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import GoogleAuthButton from '../../components/Auth/GoogleAuthButton';
import appLogo from '../../assets/icons/AppLogo.svg';

const LoginPage = () => {
  const { login, error: authError, isLoading } = useAuth();
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({ ...credentials, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!credentials.username) errors.username = 'Username is required';
    if (!credentials.password) errors.password = 'Password is required';
    if (credentials.password && credentials.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const success = await login(credentials);
      if (success) {
        navigate('/profile/me', { replace: true });
      }
    }
  };

  const handleGoogleAuth = () => {
    navigate('/profile/me', { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Left Side - Branding (Hidden on mobile) */}
      <div
        className="hidden md:flex md:w-1/2 lg:w-3/5 flex-col justify-center items-center p-12 relative overflow-hidden"
        style={{ backgroundColor: 'var(--primary-500)' }}
      >
        <div className="relative z-10 max-w-lg">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <img src={appLogo} alt="BookSwaps" className="w-12 h-12" />
              <h1
                className="text-3xl font-bold"
                style={{ color: 'var(--text-inverse)' }}
              >
                BookSwaps
              </h1>
            </div>

            <h2
              className="text-4xl lg:text-5xl font-bold mb-6"
              style={{ color: 'var(--text-inverse)' }}
            >
              Welcome Back to Your Literary Community
            </h2>

            <p
              className="text-lg mb-8"
              style={{ color: 'rgba(255, 255, 255, 0.9)' }}
            >
              Connect with fellow readers, swap your favorite books, and discover your next great read.
            </p>

            {/* Features */}
            <div className="space-y-4">
              {[
                'Access your personal library',
                'Join vibrant book discussions',
                'Swap books with readers nearby',
                'Track your reading progress'
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'var(--text-inverse)' }}>
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span style={{ color: 'var(--text-inverse)' }}>{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div
          className="absolute top-20 right-20 opacity-10"
          style={{ color: 'var(--text-inverse)' }}
        >
          <BookOpenIcon className="w-64 h-64" />
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Mobile Logo */}
          <div className="md:hidden flex items-center gap-3 mb-8">
            <img src={appLogo} alt="BookSwaps" className="w-10 h-10" />
            <h1
              className="text-2xl font-bold"
              style={{ color: 'var(--primary-700)' }}
            >
              BookSwaps
            </h1>
          </div>

          {/* Form Card */}
          <div className="card p-8">
            <div className="mb-8">
              <h2
                className="text-3xl font-bold mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Sign In
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Welcome back! Please enter your details.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Username/Email Input */}
              <div className="form-group">
                <label className="label" htmlFor="username">
                  Username or Email
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={credentials.username}
                  onChange={handleChange}
                  className={`input ${fieldErrors.username ? 'input-error' : ''}`}
                  placeholder="Enter your username or email"
                  autoComplete="username"
                  required
                />
                {fieldErrors.username && (
                  <p className="error-text">{fieldErrors.username}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="form-group">
                <label className="label" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={handleChange}
                    className={`input ${fieldErrors.password ? 'input-error' : ''}`}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    style={{ color: 'var(--text-tertiary)' }}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="error-text">{fieldErrors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="checkbox" />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Remember me
                  </span>
                </label>
                <Link
                  to="/password-reset"
                  className="text-sm font-medium"
                  style={{ color: 'var(--primary-600)' }}
                >
                  Forgot password?
                </Link>
              </div>

              {/* Error Message */}
              {authError && (
                <div
                  className="p-3 rounded-lg text-sm"
                  style={{
                    backgroundColor: 'var(--error-50)',
                    color: 'var(--error-600)',
                    border: '1px solid var(--error-200)'
                  }}
                >
                  {authError}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || !credentials.username || !credentials.password}
                className="btn btn-primary btn-lg btn-block"
              >
                {isLoading ? (
                  <>
                    <div className="spinner" style={{ borderTopColor: 'var(--text-inverse)' }} />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRightIcon className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full" style={{ borderTop: '1px solid var(--border-medium)' }} />
              </div>
              <div className="relative flex justify-center text-sm">
                <span
                  className="px-2"
                  style={{
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-tertiary)'
                  }}
                >
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google OAuth */}
            <GoogleAuthButton
              onSuccess={handleGoogleAuth}
              text="Sign in with Google"
            />

            {/* Sign Up Link */}
            <p className="mt-6 text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium"
                style={{ color: 'var(--primary-600)' }}
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
