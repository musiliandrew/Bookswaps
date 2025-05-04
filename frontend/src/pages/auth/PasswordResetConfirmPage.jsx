import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import PasswordResetConfirmForm from '../../components/auth/PasswordResetConfirmForm';
import AuthLink from '../../components/auth/AuthLink';

function PasswordResetConfirmPage() {
  const navigate = useNavigate();
  const { token } = useParams();
  const { confirmPasswordReset, error, isLoading, success } = useAuth();

  const handleSubmit = async (data) => {
    await confirmPasswordReset({ ...data, token });
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
          Set New Password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your new password to complete the reset.
        </p>
        <PasswordResetConfirmForm
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

export default PasswordResetConfirmPage;