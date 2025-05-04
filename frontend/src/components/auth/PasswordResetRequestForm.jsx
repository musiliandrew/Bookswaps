import { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import ErrorMessage from './ErrorMessage';

function PasswordResetRequestForm({ onSubmit, error, isLoading }) {
  const [email, setEmail] = useState('');

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ email });
  };

  const isDisabled = !email;

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="space-y-4">
        <Input
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
        />
      </div>
      <ErrorMessage message={error} />
      <Button
        type="submit"
        text={isLoading ? 'Sending...' : 'Send Reset Link'}
        disabled={isDisabled || isLoading}
        className="w-full"
      />
    </form>
  );
}

export default PasswordResetRequestForm;