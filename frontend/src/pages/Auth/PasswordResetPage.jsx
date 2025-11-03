import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EnvelopeIcon,
  LockClosedIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import appLogo from '../../assets/icons/AppLogo.svg';

const PasswordResetPage = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const { confirmPasswordReset, requestPasswordReset, error: authError, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (!email.trim()) {
      setFieldErrors({ email: 'Email is required' });
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setFieldErrors({ email: 'Please enter a valid email address' });
      return;
    }

    try {
      await requestPasswordReset(email);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to send reset email. Please try again.');
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    const errors = {};
    if (!newPassword) {
      errors.newPassword = 'Password is required';
    } else if (newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }

    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    try {
      await confirmPasswordReset({ uid: 'uid-placeholder', token, new_password: newPassword });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to reset password. Please request a new reset link.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Left Side - Branding (Hidden on mobile) */}
      <div
        className="hidden md:flex md:w-1/2 lg:w-3/5 flex-col justify-center items-center p-12 relative overflow-hidden"
        style={{ backgroundColor: 'var(--primary-500)' }}
      >
        <div className="relative z-10 max-w-lg text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <img src={appLogo} alt="BookSwaps" className="w-12 h-12" />
              <h1
                className="text-3xl font-bold"
                style={{ color: 'var(--text-inverse)' }}
              >
                BookSwaps
              </h1>
            </div>

            <LockClosedIcon
              className="w-32 h-32 mx-auto mb-8"
              style={{ color: 'rgba(255, 255, 255, 0.8)' }}
            />

            <h2
              className="text-4xl lg:text-5xl font-bold mb-6"
              style={{ color: 'var(--text-inverse)' }}
            >
              {token ? 'Create New Password' : 'Forgot Your Password?'}
            </h2>

            <p
              className="text-lg"
              style={{ color: 'rgba(255, 255, 255, 0.9)' }}
            >
              {token
                ? 'You\'re almost there! Enter your new password below.'
                : 'No worries! We\'ll send you reset instructions.'
              }
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Reset Form */}
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
                {token ? 'Set New Password' : 'Reset Password'}
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                {token
                  ? 'Enter your new password below'
                  : 'Enter your email to receive a reset link'
                }
              </p>
            </div>

            {/* Success Message */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-4 rounded-lg mb-6 flex items-center gap-3"
                  style={{
                    backgroundColor: 'var(--success-50)',
                    color: 'var(--success-700)',
                    border: '1px solid var(--success-200)'
                  }}
                >
                  <CheckCircleIcon className="w-6 h-6 flex-shrink-0" />
                  <div>
                    <p className="font-medium">
                      {token ? 'Password reset successful!' : 'Reset link sent!'}
                    </p>
                    <p className="text-sm">Redirecting to login...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Request Reset Form */}
            {!token && (
              <form onSubmit={handleRequestReset} className="space-y-5">
                <div className="form-group">
                  <label className="label" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) {
                          setFieldErrors({ ...fieldErrors, email: '' });
                        }
                      }}
                      className={`input ${fieldErrors.email ? 'input-error' : ''}`}
                      placeholder="your.email@example.com"
                      autoComplete="email"
                      required
                    />
                    <EnvelopeIcon
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
                      style={{ color: 'var(--text-tertiary)' }}
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="error-text">{fieldErrors.email}</p>
                  )}
                </div>

                {/* Error Message */}
                {(error || authError) && (
                  <div
                    className="p-3 rounded-lg text-sm"
                    style={{
                      backgroundColor: 'var(--error-50)',
                      color: 'var(--error-600)',
                      border: '1px solid var(--error-200)'
                    }}
                  >
                    {error || authError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || success}
                  className="btn btn-primary btn-lg btn-block"
                >
                  {isLoading ? (
                    <>
                      <div className="spinner" style={{ borderTopColor: 'var(--text-inverse)' }} />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <EnvelopeIcon className="w-5 h-5" />
                      <span>Send Reset Link</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Confirm Reset Form */}
            {token && (
              <form onSubmit={handleConfirmReset} className="space-y-5">
                <div className="form-group">
                  <label className="label" htmlFor="newPassword">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (fieldErrors.newPassword) {
                          setFieldErrors({ ...fieldErrors, newPassword: '' });
                        }
                      }}
                      className={`input ${fieldErrors.newPassword ? 'input-error' : ''}`}
                      placeholder="Enter new password (min 8 characters)"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {showPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {fieldErrors.newPassword && (
                    <p className="error-text">{fieldErrors.newPassword}</p>
                  )}
                </div>

                <div className="form-group">
                  <label className="label" htmlFor="confirmPassword">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (fieldErrors.confirmPassword) {
                          setFieldErrors({ ...fieldErrors, confirmPassword: '' });
                        }
                      }}
                      className={`input ${fieldErrors.confirmPassword ? 'input-error' : ''}`}
                      placeholder="Confirm new password"
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: 'var(--text-tertiary)' }}
                    >
                      {showConfirmPassword ? (
                        <EyeSlashIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {fieldErrors.confirmPassword && (
                    <p className="error-text">{fieldErrors.confirmPassword}</p>
                  )}
                </div>

                {/* Error Message */}
                {(error || authError) && (
                  <div
                    className="p-3 rounded-lg text-sm"
                    style={{
                      backgroundColor: 'var(--error-50)',
                      color: 'var(--error-600)',
                      border: '1px solid var(--error-200)'
                    }}
                  >
                    {error || authError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || success}
                  className="btn btn-primary btn-lg btn-block"
                >
                  {isLoading ? (
                    <>
                      <div className="spinner" style={{ borderTopColor: 'var(--text-inverse)' }} />
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <>
                      <LockClosedIcon className="w-5 h-5" />
                      <span>Reset Password</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm font-medium"
                style={{ color: 'var(--primary-600)' }}
              >
                <ArrowLeftIcon className="w-4 h-4" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PasswordResetPage;
