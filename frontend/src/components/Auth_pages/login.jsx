import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Validation
    if (!formData.username || !formData.password) {
      setError('All fields are required');
      setIsLoading(false);
      return;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    // Mock login process
    setTimeout(() => {
      // Mock credentials check (success if username includes "book" or email has @)
      if (formData.username.toLowerCase().includes('book') || formData.username.includes('@')) {
        // Success case
        setSuccessMessage('Welcome back!');
        // Redirect would happen here in a real implementation
        console.log('Login successful! Redirecting...');
        // In a real app: store tokens, redirect to homepage, etc.
      } else {
        // Error case
        setError('No active account found with the given credentials');
      }
      setIsLoading(false);
    }, 1500); // Simulate network delay
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex flex-col bg-beige-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <a href="/" className="text-2xl font-bold text-brown-800">BookSwap</a>
          </div>
          <nav className="hidden md:block">
            <ul className="flex space-x-6">
              <li><a href="/" className="text-brown-800 hover:text-teal-600">Home</a></li>
              <li><a href="/signup" className="text-brown-800 hover:text-teal-600">Sign Up</a></li>
              <li><a href="/login" className="text-teal-600 font-bold">Log In</a></li>
            </ul>
          </nav>
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-brown-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-4 py-12">
        <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center text-brown-800 mb-6">Log In to BookSwap</h1>
          
          {successMessage && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
              {successMessage}
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded" role="alert" aria-live="assertive">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-brown-800 mb-2">Email or Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-teal-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter your email or username"
                maxLength={150}
                aria-label="Username or Email"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-brown-800 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-teal-300 rounded focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter your password"
                  aria-label="Password"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-500"
                  onClick={togglePasswordVisibility}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-teal-500 transition duration-150 ease-in-out"
            >
              {isLoading ? (
                <div className="flex justify-center items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </div>
              ) : "Log In"}
            </button>
          </form>
          
          <div className="mt-4 text-center">
            <a href="/reset-password" className="text-teal-600 hover:text-teal-700">Forgot Password?</a>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-brown-800">
              Don't have an account? <a href="/signup" className="text-teal-600 hover:text-teal-700 font-medium">Sign Up</a>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white shadow-inner py-8">
        <div className="container mx-auto px-4">
          <div className="md:flex md:justify-between">
            <div className="mb-6 md:mb-0">
              <h2 className="text-lg font-bold text-brown-800 mb-4">BookSwap</h2>
              <p className="text-sm text-brown-600">Connect with book lovers, swap books, join discussions.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
              <div>
                <h3 className="text-sm font-semibold text-brown-800 mb-2">About</h3>
                <ul className="text-sm">
                  <li className="mb-2"><a href="/about" className="text-brown-600 hover:text-teal-600">About Us</a></li>
                  <li className="mb-2"><a href="/contact" className="text-brown-600 hover:text-teal-600">Contact</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-brown-800 mb-2">Legal</h3>
                <ul className="text-sm">
                  <li className="mb-2"><a href="/privacy" className="text-brown-600 hover:text-teal-600">Privacy Policy</a></li>
                  <li className="mb-2"><a href="/terms" className="text-brown-600 hover:text-teal-600">Terms of Service</a></li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-semibold text-brown-800 mb-2">Follow Us</h3>
                <div className="flex space-x-4 mt-2">
                  <a href="#" className="text-brown-600 hover:text-teal-600">
                    <span className="sr-only">Twitter</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                    </svg>
                  </a>
                  <a href="#" className="text-brown-600 hover:text-teal-600">
                    <span className="sr-only">Facebook</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                  <a href="#" className="text-brown-600 hover:text-teal-600">
                    <span className="sr-only">LinkedIn</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-8 border-t border-gray-200 pt-6">
            <p className="text-sm text-center text-brown-600">© 2025 BookSwap. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}