import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const AuthGuard = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/profile/me', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) return <div className="bookish-glass p-4 text-center">Loading...</div>;

  return !isAuthenticated ? children : null;
};

export default AuthGuard;