import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import UserSearchForm from '../../components/users/UserSearchForm';
import UserCard from '../../components/users/UserCard';
import AuthLink from '../../components/auth/AuthLink';

function SearchUsersPage() {
  const navigate = useNavigate();
  const { searchUsers, searchResults, error, isLoading } = useAuth();
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('access_token')) {
      navigate('/login');
    }
  }, [navigate]);

  const handleSubmit = async (data) => {
    await searchUsers(data);
    setHasSearched(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto w-full">
        <h2 className="text-center text-3xl font-extrabold text-[var(--primary)]">
          Find Book Lovers
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Search for users by username or favorite genres.
        </p>
        <div className="mt-8 bookish-border p-6">
          <UserSearchForm
            onSubmit={handleSubmit}
            error={error}
            isLoading={isLoading}
          />
        </div>
        <div className="mt-8 space-y-4">
          {hasSearched && !isLoading && (
            <>
              {searchResults?.length ? (
                <div className="space-y-4">
                  {searchResults.map((user) => (
                    <UserCard key={user.username} user={user} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-600">No users found.</p>
              )}
            </>
          )}
        </div>
        <div className="mt-4 text-center">
          <AuthLink to="/me/profile" text="Back to Profile" />
        </div>
      </div>
    </div>
  );
}

export default SearchUsersPage;