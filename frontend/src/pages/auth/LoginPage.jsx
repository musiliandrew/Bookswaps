import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoginForm from '../../components/auth/loginForm';
import AuthLink from '../../components/auth/AuthLink';

function LoginPage() {
  const navigate = useNavigate();
  const { login, error, isLoading } = useAuth();

  const handleLogin = async (credentials) => {
    const success = await login(credentials);
    if (success) {
      console.log('Navigating to /me/profile'); // Debug
      navigate('/me/profile', { replace: true }); // Prevent back navigation
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bookish-border p-6">
        <h2 className="text-center text-3xl font-extrabold text-[var(--primary)]">
          Join our book-loving community!
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Sign in to swap books and connect with readers.
        </p>
        <LoginForm onSubmit={handleLogin} error={error} isLoading={isLoading} />
        <div className="mt-4 text-center">
          <AuthLink to="/signup" text="Don’t have an account? Sign up" />
          <AuthLink to="/password/reset" text="Forgot Password?" />
        </div>
      </div>
    </div>
  );
}

export default LoginPage;