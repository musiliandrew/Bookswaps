import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import RegisterForm from '../../components/auth/RegisterForm';
import { useAuth } from '../../hooks/useAuth';

const RegisterPage = () => {
  const { register, error, isLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    city: '',
    genres: [],
    location_enabled: false,
    terms_agreed: false,
  });
  const [formErrors, setFormErrors] = useState({});

  const handleSubmit = async (formData, setFormErrors) => {
    if (!formData.terms_agreed) {
      setFormErrors({ terms_agreed: 'You must agree to the terms and conditions' });
      return;
    }

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        city: formData.city || null,
        genres: formData.genres,
        location_enabled: formData.location_enabled,
      });
      navigate('/dashboard');
    } catch (err) {
      setFormErrors({ general: err.message || 'Registration failed' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bookish-gradient py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute inset-0 floating-elements" />
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
            Create your account and start swapping books
          </motion.p>
        </motion.div>
        <RegisterForm
          formData={formData}
          setFormData={setFormData}
          formErrors={{ general: error, ...formErrors }}
          setFormErrors={setFormErrors}
          isLoading={isLoading}
          onSubmit={handleSubmit}
        />
      </motion.div>
    </div>
  );
};

export default RegisterPage;