import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import UserProfileCard from '../../components/users/UserProfileCard';
import ErrorMessage from '../../components/auth/ErrorMessage';
import Button from '../../components/common/Button';
import AuthLink from '../../components/auth/AuthLink';

function UserPublicProfilePage() {
  const navigate = useNavigate();
  const { username } = useParams();
  const { getUserProfile, publicProfile, error, isLoading } = useAuth();

  useEffect(() => {
    if (!localStorage.getItem('access_token')) {
      navigate('/login');
    } else {
      getUserProfile(username);
    }
  }, [username, navigate, getUserProfile]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <p className="text-[var(--primary)]">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto w-full">
        <h2 className="text-center text-3xl font-extrabold text-[var(--primary)]">
          User Profile
        </h2>
        <div className="mt-8">
          {publicProfile ? (
            <UserProfileCard user={publicProfile} />
          ) : (
            <ErrorMessage message={error || 'User not found'} />
          )}
        </div>
        <div className="mt-6 flex justify-center">
          <Button
            type="button"
            text="Back to Search"
            onClick={() => navigate('/users/search')}
            className="w-full max-w-xs"
          />
        </div>
        <div className="mt-4 text-center">
          <AuthLink to="/me/profile" text="Back to Your Profile" />
        </div>
      </div>
    </div>
  );
}

export default UserPublicProfilePage;