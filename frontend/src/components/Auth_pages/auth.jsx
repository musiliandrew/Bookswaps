
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';

import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loginMutation = useMutation(
    async (data) => {
      const response = await axios.post('http://localhost:8000/api/users/login/', data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        // Store tokens (e.g., localStorage for simplicity)
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        navigate('/');
      },
      onError: (err) => {
        setError(err.response?.data?.detail || 'Login failed');
      },
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Please fill in all fields');
      return;
    }
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="min-h-screen bg-beige-100 flex flex-col">
      <header className="flex justify-between items-center p-4 bg-white shadow">
        <Link to="/" className="text-2xl font-bold text-brown-800">BookSwap</Link>
        <nav>
          <Link to="/" className="mr-4 text-teal-600 hover:underline">Home</Link>
          <Link to="/signup" className="mr-4 text-teal-600 hover:underline">Sign Up</Link>
          <span className="text-teal-800 font-bold">Log In</span>
        </nav>
      </header>
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
          <h1 className="text-2xl font-bold text-brown-800 text-center mb-6">Log In to BookSwap</h1>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-brown-800 mb-1">Email or Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-2 border border-teal-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-600"
                placeholder="Email or Username"
                aria-label="Email or Username"
              />
            </div>
            <div className="mb-4 relative">
              <label htmlFor="password" className="block text-brown-800 mb-1">Password</label>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-2 border border-teal-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-600"
                placeholder="Password"
                aria-label="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-9 text-teal-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
              </button>
            </div>
            {error && (
              <p className="text-red-600 text-sm mb-4" id="error-message">{error}</p>
            )}
            <button
              type="submit"
              disabled={loginMutation.isLoading}
              className="w-full bg-teal-600 text-white p-2 rounded hover:bg-teal-700 disabled:bg-teal-400"
            >
              {loginMutation.isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Logging In...
                </span>
              ) : (
                'Log In'
              )}
            </button>
          </form>
          <div className="mt-4 text-center">
            <Link to="/reset-password" className="text-teal-600 hover:underline">Forgot Password?</Link>
            <p className="mt-2">
              Don’t have an account?{' '}
              <Link to="/signup" className="text-teal-600 hover:underline">Sign Up</Link>
            </p>
          </div>
        </div>
      </main>
      <footer className="bg-white p-4 text-center text-brown-800">
        <div className="mb-2">
          <a href="/about" className="mx-2 text-teal-600 hover:underline">About</a>
          <a href="/contact" className="mx-2 text-teal-600 hover:underline">Contact</a>
          <a href="/privacy" className="mx-2 text-teal-600 hover:underline">Privacy Policy</a>
          <a href="/terms" className="mx-2 text-teal-600 hover:underline">Terms of Service</a>
        </div>
        <div className="flex justify-center space-x-4">
          <a href="https://twitter.com/bookswap" aria-label="Twitter"><svg className="h-5 w-5 text-teal-600" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" /></svg></a>
          <a href="https://facebook.com/bookswap" aria-label="Facebook"><svg className="h-5 w-5 text-teal-600" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg></a>
          <a href="https://linkedin.com/company/bookswap" aria-label="LinkedIn"><svg className="h-5 w-5 text-teal-600" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" /></svg></a>
        </div>
        <p className="mt-2">© 2025 BookSwap. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Login;
