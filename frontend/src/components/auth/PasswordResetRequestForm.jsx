import { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '../common/Button';
import Input from '../common/Input';
import ErrorMessage from './ErrorMessage';

function PasswordResetRequestForm({ onSubmit, error, isLoading, className = '' }) {
  const [email, setEmail] = useState('');

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting email:', email);
    onSubmit({ email });
  };

  const isDisabled = !email;

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={`space-y-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
      >
        <Input
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
          className="bookish-border"
          labelClassName="font-['Lora'] text-[var(--primary)]"
        />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <ErrorMessage message={error} />
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        <Button
          type="submit"
          text={isLoading ? 'Sending...' : 'Send Reset Link'}
          disabled={isDisabled || isLoading}
          className="w-full bookish-button bookish-button--primary"
        />
      </motion.div>
    </motion.form>
  );
}

export default PasswordResetRequestForm;