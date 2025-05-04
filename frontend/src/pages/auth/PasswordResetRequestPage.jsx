import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import PasswordResetRequestForm from '../../components/auth/PasswordResetRequestForm';
import AuthLink from '../../components/auth/AuthLink';

function PasswordResetRequestPage() {
  const navigate = useNavigate();
  const { requestPasswordReset, error, isLoading, success } = useAuth();

  const handleSubmit = async (data) => {
    await requestPasswordReset(data);
  };

  useEffect(() => {
    if (success) {
      setTimeout(() => navigate('/login'), 3000);
    }
  }, [success, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bookish-border p-6">
        <h2 className="text-center text-3xl font-extrabold text-[var(--primary)]">
          Reset Your Password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email to receive a password reset link.
        </p>
        <PasswordResetRequestForm
          onSubmit={handleSubmit}
          error={error}
          isLoading={isLoading}
        />
        <div className="mt-4 text-center">
          <AuthLink to="/login" text="Back to Sign In" />
        </div>
      </div>
    </div>
  );
}

export default PasswordResetRequestPage;