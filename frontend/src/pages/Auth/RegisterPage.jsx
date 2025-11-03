import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import { API_ENDPOINTS } from '../../utils/constants';
import { toast } from 'react-toastify';
import GoogleAuthButton from '../../components/Auth/GoogleAuthButton';
import appLogo from '../../assets/icons/AppLogo.svg';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [userData, setUserData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    birth_date: '',
    gender: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateStep1 = () => {
    const errors = {};

    if (!userData.username.trim()) {
      errors.username = 'Username is required';
    } else if (userData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }

    if (!userData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!userData.password) {
      errors.password = 'Password is required';
    } else if (userData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (userData.password !== userData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};

    if (!userData.birth_date) {
      errors.birth_date = 'Birth date is required';
    } else {
      const birthDate = new Date(userData.birth_date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13) {
        errors.birth_date = 'You must be at least 13 years old';
      }
    }

    if (!userData.gender) {
      errors.gender = 'Please select your gender';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStep1Submit = async () => {
    if (!validateStep1()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post(API_ENDPOINTS.SIMPLE_REGISTER, {
        username: userData.username,
        email: userData.email,
        password: userData.password,
      });

      localStorage.setItem('access_token', response.data.token);
      localStorage.setItem('refresh_token', response.data.refresh);
      api.defaults.headers.Authorization = `Bearer ${response.data.token}`;

      toast.success('Account created! Let\'s complete your profile.');
      setCurrentStep(2);
    } catch (err) {
      const errorMessage = err.response?.data?.detail ||
                          err.response?.data?.error ||
                          'Registration failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Submit = async () => {
    if (!validateStep2()) return;

    setIsLoading(true);
    setError(null);

    try {
      await api.patch(API_ENDPOINTS.PROFILE_STEP, {
        birth_date: userData.birth_date,
        gender: userData.gender,
      });

      toast.success('Welcome to BookSwaps! Your profile is ready.');
      navigate('/profile/me', { replace: true });
    } catch (err) {
      const errorMessage = err.response?.data?.detail ||
                          err.response?.data?.error ||
                          'Profile update failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    toast.success('Welcome to BookSwaps! 🎉');
    navigate('/profile/me', { replace: true });
  };

  const genderOptions = [
    { value: '', label: 'Select Gender' },
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Non-binary', label: 'Non-binary' },
    { value: 'Prefer not to say', label: 'Prefer not to say' },
    { value: 'Other', label: 'Other' },
  ];

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Left Side - Branding (Hidden on mobile) */}
      <div
        className="hidden md:flex md:w-1/2 lg:w-3/5 flex-col justify-center items-center p-12 relative overflow-hidden"
        style={{ backgroundColor: 'var(--accent-500)' }}
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
              Join Our Growing Community of Book Lovers
            </h2>

            <p
              className="text-lg mb-8"
              style={{ color: 'rgba(255, 255, 255, 0.9)' }}
            >
              Start swapping books, making friends, and discovering your next favorite read today.
            </p>

            {/* Benefits */}
            <div className="space-y-4">
              {[
                'Build your personal digital library',
                'Connect with readers worldwide',
                'Join book clubs and discussions',
                'Swap books with local readers'
              ].map((benefit, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <CheckCircleIcon
                    className="w-6 h-6 flex-shrink-0"
                    style={{ color: 'var(--text-inverse)' }}
                  />
                  <span style={{ color: 'var(--text-inverse)' }}>{benefit}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Decorative Element */}
        <div
          className="absolute top-20 right-20 opacity-10"
          style={{ color: 'var(--text-inverse)' }}
        >
          <UserGroupIcon className="w-64 h-64" />
        </div>
      </div>

      {/* Right Side - Registration Form */}
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
            {/* Header */}
            <div className="mb-6">
              <h2
                className="text-3xl font-bold mb-2"
                style={{ color: 'var(--text-primary)' }}
              >
                Create Account
              </h2>
              <p style={{ color: 'var(--text-secondary)' }}>
                Sign up in just 2 simple steps
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center mb-8">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all"
                style={{
                  backgroundColor: currentStep >= 1 ? 'var(--primary-500)' : 'var(--neutral-200)',
                  color: currentStep >= 1 ? 'var(--text-inverse)' : 'var(--text-tertiary)'
                }}
              >
                1
              </div>
              <div
                className="flex-1 h-1 mx-3 rounded transition-all"
                style={{
                  backgroundColor: currentStep >= 2 ? 'var(--primary-500)' : 'var(--neutral-200)'
                }}
              />
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all"
                style={{
                  backgroundColor: currentStep >= 2 ? 'var(--primary-500)' : 'var(--neutral-200)',
                  color: currentStep >= 2 ? 'var(--text-inverse)' : 'var(--text-tertiary)'
                }}
              >
                2
              </div>
            </div>

            {/* Google OAuth - Step 1 Only */}
            {currentStep === 1 && (
              <div className="mb-6">
                <GoogleAuthButton
                  onSuccess={handleGoogleAuth}
                  text="Sign up with Google"
                />
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
                      Or continue with email
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Step Content */}
            <AnimatePresence mode="wait">
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-5"
                >
                  {/* Username */}
                  <div className="form-group">
                    <label className="label" htmlFor="username">
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      value={userData.username}
                      onChange={handleInputChange}
                      className={`input ${fieldErrors.username ? 'input-error' : ''}`}
                      placeholder="Choose a unique username"
                      autoComplete="username"
                      required
                    />
                    {fieldErrors.username && (
                      <p className="error-text">{fieldErrors.username}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="form-group">
                    <label className="label" htmlFor="email">
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={userData.email}
                      onChange={handleInputChange}
                      className={`input ${fieldErrors.email ? 'input-error' : ''}`}
                      placeholder="your.email@example.com"
                      autoComplete="email"
                      required
                    />
                    {fieldErrors.email && (
                      <p className="error-text">{fieldErrors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="form-group">
                    <label className="label" htmlFor="password">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={userData.password}
                        onChange={handleInputChange}
                        className={`input ${fieldErrors.password ? 'input-error' : ''}`}
                        placeholder="Create a strong password (min 8 characters)"
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
                    {fieldErrors.password && (
                      <p className="error-text">{fieldErrors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="form-group">
                    <label className="label" htmlFor="confirmPassword">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={userData.confirmPassword}
                        onChange={handleInputChange}
                        className={`input ${fieldErrors.confirmPassword ? 'input-error' : ''}`}
                        placeholder="Confirm your password"
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
                  {error && (
                    <div
                      className="p-3 rounded-lg text-sm"
                      style={{
                        backgroundColor: 'var(--error-50)',
                        color: 'var(--error-600)',
                        border: '1px solid var(--error-200)'
                      }}
                    >
                      {error}
                    </div>
                  )}

                  {/* Continue Button */}
                  <button
                    onClick={handleStep1Submit}
                    disabled={isLoading}
                    className="btn btn-primary btn-lg btn-block"
                  >
                    {isLoading ? (
                      <>
                        <div className="spinner" style={{ borderTopColor: 'var(--text-inverse)' }} />
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Continue</span>
                        <ArrowRightIcon className="w-5 h-5" />
                      </>
                    )}
                  </button>

                  {/* Sign In Link */}
                  <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="font-medium"
                      style={{ color: 'var(--primary-600)' }}
                    >
                      Sign in
                    </Link>
                  </p>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-5"
                >
                  <div className="mb-4">
                    <h3
                      className="text-lg font-semibold mb-2"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Complete Your Profile
                    </h3>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Just a few more details to personalize your experience
                    </p>
                  </div>

                  {/* Birth Date */}
                  <div className="form-group">
                    <label className="label" htmlFor="birth_date">
                      Birth Date
                    </label>
                    <input
                      id="birth_date"
                      name="birth_date"
                      type="date"
                      value={userData.birth_date}
                      onChange={handleInputChange}
                      className={`input ${fieldErrors.birth_date ? 'input-error' : ''}`}
                      required
                    />
                    {fieldErrors.birth_date && (
                      <p className="error-text">{fieldErrors.birth_date}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="form-group">
                    <label className="label" htmlFor="gender">
                      Gender
                    </label>
                    <select
                      id="gender"
                      name="gender"
                      value={userData.gender}
                      onChange={handleInputChange}
                      className={`input select ${fieldErrors.gender ? 'input-error' : ''}`}
                      required
                    >
                      {genderOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.gender && (
                      <p className="error-text">{fieldErrors.gender}</p>
                    )}
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div
                      className="p-3 rounded-lg text-sm"
                      style={{
                        backgroundColor: 'var(--error-50)',
                        color: 'var(--error-600)',
                        border: '1px solid var(--error-200)'
                      }}
                    >
                      {error}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => setCurrentStep(1)}
                      className="btn btn-secondary flex-1"
                    >
                      <ArrowLeftIcon className="w-5 h-5" />
                      <span>Back</span>
                    </button>
                    <button
                      onClick={handleStep2Submit}
                      disabled={isLoading}
                      className="btn btn-primary flex-1"
                    >
                      {isLoading ? (
                        <>
                          <div className="spinner" style={{ borderTopColor: 'var(--text-inverse)' }} />
                          <span>Completing...</span>
                        </>
                      ) : (
                        <>
                          <span>Complete</span>
                          <CheckCircleIcon className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;
