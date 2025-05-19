import { useState } from 'react';
import Button from '../common/Button';
import Input from '../common/Input';
import ErrorMessage from './ErrorMessage';

function LoginForm({ onSubmit, error, isLoading }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting credentials:', credentials); // Debug
    onSubmit(credentials);
  };

  const isDisabled = !credentials.username || !credentials.password;

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="space-y-4">
        <Input
          label="Username or Email"
          name="username"
          type="text"
          value={credentials.username}
          onChange={handleChange}
          placeholder="Enter your username"
          required
        />
        <div className="relative">
          <Input
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={credentials.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
          <button
            type="button"
            className="absolute right-3 top-9 text-[var(--primary)]"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>
      <ErrorMessage message={error} />
      <Button
        type="submit"
        text={isLoading ? 'Logging in...' : 'Login'}
        disabled={isDisabled || isLoading}
        className="w-full"
      />
    </form>
  );
}

export default LoginForm;