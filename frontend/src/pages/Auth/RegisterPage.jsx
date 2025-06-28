import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import { API_ENDPOINTS } from '../../utils/constants';
import { toast } from 'react-toastify';
import Input from '../../components/Common/Input';
import Button from '../../components/Common/Button';
import ErrorMessage from '../../components/Common/ErrorMessage';
import GoogleAuthButton from '../../components/Auth/GoogleAuthButton';
import AuthLink from '../../components/Auth/AuthLink';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState({
    // Step 1: Basic info
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    // Step 2: Profile info
    birth_date: '',
    gender: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
    // Clear field error when user starts typing
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

      // Store tokens
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
      const response = await api.patch(API_ENDPOINTS.PROFILE_STEP, {
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

  const handleGoogleAuth = (userData) => {
    // Handle Google OAuth success
    console.log('Google auth success:', userData);
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
    <div className="min-h-screen flex items-center justify-center bookish-gradient py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 floating-elements" />

      {/* Floating decorative elements */}
      <motion.div
        className="absolute top-20 left-10 text-[var(--primary)] opacity-10"
        animate={{ y: [0, -15, 0], rotate: [0, 3, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      </motion.div>
      <motion.div
        className="absolute bottom-32 right-16 text-[var(--accent)] opacity-15"
        animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      >
        <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
        </svg>
      </motion.div>

      <motion.div
        className="max-w-lg w-full bookish-glass bookish-shadow rounded-2xl p-8 relative z-10"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      >
        {/* Header */}
        <motion.div
          className="text-center mb-6"
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
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            Join BookSwap
          </motion.h1>
          <motion.p
            className="text-[var(--text)] font-['Open_Sans'] text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Create your account in just 2 simple steps
          </motion.p>
        </motion.div>

        {/* Progress indicator */}
        <div className="flex items-center mb-8">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
            currentStep >= 1 ? 'bg-[var(--accent)] text-[var(--primary)]' : 'bg-gray-200 text-gray-500'
          }`}>
            1
          </div>
          <div className={`flex-1 h-1 mx-2 transition-all duration-300 ${
            currentStep >= 2 ? 'bg-[var(--accent)]' : 'bg-gray-200'
          }`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
            currentStep >= 2 ? 'bg-[var(--accent)] text-[var(--primary)]' : 'bg-gray-200 text-gray-500'
          }`}>
            2
          </div>
        </div>

        {/* Google OAuth Section - Show only on step 1 */}
        {currentStep === 1 && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <GoogleAuthButton
              onSuccess={handleGoogleAuth}
              text="Sign up with Google"
              className="mb-4"
            />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[var(--secondary)] text-[var(--text)]">Or continue with email</span>
              </div>
            </div>
          </motion.div>
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
              className="space-y-4"
            >
              <h3 className="text-lg font-['Lora'] text-[var(--primary)] mb-4">
                Create Your Account
              </h3>

              <Input
                label="Username"
                name="username"
                type="text"
                value={userData.username}
                onChange={handleInputChange}
                placeholder="Choose a unique username"
                error={fieldErrors.username}
                required
                className="bookish-input"
              />

              <Input
                label="Email"
                name="email"
                type="email"
                value={userData.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                error={fieldErrors.email}
                required
                className="bookish-input"
              />

              <Input
                label="Password"
                name="password"
                type="password"
                value={userData.password}
                onChange={handleInputChange}
                placeholder="Create a strong password"
                error={fieldErrors.password}
                required
                className="bookish-input"
              />

              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={userData.confirmPassword}
                onChange={handleInputChange}
                placeholder="Confirm your password"
                error={fieldErrors.confirmPassword}
                required
                className="bookish-input"
              />

              <ErrorMessage message={error} />

              <Button
                onClick={handleStep1Submit}
                text={isLoading ? 'Creating Account...' : 'Continue'}
                disabled={isLoading}
                className="w-full bookish-button-enhanced text-white font-medium py-3 rounded-lg"
              />

              <div className="text-center mt-4">
                <AuthLink to="/login" text="Already have an account? Sign in" />
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-4"
            >
              <h3 className="text-lg font-['Lora'] text-[var(--primary)] mb-4">
                Complete Your Profile
              </h3>

              <Input
                label="Birth Date"
                name="birth_date"
                type="date"
                value={userData.birth_date}
                onChange={handleInputChange}
                error={fieldErrors.birth_date}
                required
                className="bookish-input"
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--primary)] font-['Lora']">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={userData.gender}
                  onChange={handleInputChange}
                  className="w-full p-3 bookish-input rounded-lg font-['Open_Sans'] text-[var(--text)]"
                  required
                >
                  {genderOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {fieldErrors.gender && (
                  <p className="text-[var(--error)] text-sm font-['Open_Sans']">{fieldErrors.gender}</p>
                )}
              </div>

              <ErrorMessage message={error} />

              <div className="flex gap-3">
                <Button
                  onClick={() => setCurrentStep(1)}
                  text="Back"
                  className="flex-1 bg-gray-200 text-[var(--primary)] font-medium py-3 rounded-lg hover:bg-gray-300 transition-colors"
                />
                <Button
                  onClick={handleStep2Submit}
                  text={isLoading ? 'Completing...' : 'Complete Registration'}
                  disabled={isLoading}
                  className="flex-1 bookish-button-enhanced text-white font-medium py-3 rounded-lg"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default RegisterPage;