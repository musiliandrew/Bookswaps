import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AuthGuard = ({ children }) => {
  const { auth, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && auth.isAuthenticated) {
      navigate('/profile', { replace: true });
    }
  }, [auth.isAuthenticated, isLoading, navigate]);

  if (isLoading) return <div className="bookish-glass p-4 text-center">Loading...</div>;

  return !auth.isAuthenticated ? children : null;
};

export default AuthGuard;