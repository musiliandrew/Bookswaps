import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../utils/api';
import { API_ENDPOINTS } from '../../utils/constants';
import { toast } from 'react-toastify';
import Input from '../Common/Input';
import Button from '../Common/Button';
import ErrorMessage from '../Common/ErrorMessage';

const MultiStepRegister = ({ onComplete, onClose }) => {
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
      
      toast.success('Profile completed successfully!');
      onComplete(response.data);
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        className="bg-white rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto bookish-glass"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-['Lora'] text-[var(--primary)]">
            Join BookSwaps
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--secondary)] hover:text-[var(--primary)] text-2xl"
          >
            ×
          </button>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center mb-8">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            currentStep >= 1 ? 'bg-[var(--accent)] text-[var(--primary)]' : 'bg-gray-200 text-gray-500'
          }`}>
            1
          </div>
          <div className={`flex-1 h-1 mx-2 ${
            currentStep >= 2 ? 'bg-[var(--accent)]' : 'bg-gray-200'
          }`} />
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
            currentStep >= 2 ? 'bg-[var(--accent)] text-[var(--primary)]' : 'bg-gray-200 text-gray-500'
          }`}>
            2
          </div>
        </div>

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
              />
              
              <ErrorMessage message={error} />
              
              <Button
                onClick={handleStep1Submit}
                text={isLoading ? 'Creating Account...' : 'Continue'}
                disabled={isLoading}
                className="w-full"
              />
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
              />
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[var(--primary)]">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={userData.gender}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-[var(--secondary)]/30 rounded-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                  required
                >
                  {genderOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {fieldErrors.gender && (
                  <p className="text-red-500 text-sm">{fieldErrors.gender}</p>
                )}
              </div>
              
              <ErrorMessage message={error} />
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setCurrentStep(1)}
                  text="Back"
                  variant="secondary"
                  className="flex-1"
                />
                <Button
                  onClick={handleStep2Submit}
                  text={isLoading ? 'Completing...' : 'Complete Registration'}
                  disabled={isLoading}
                  className="flex-1"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default MultiStepRegister;
