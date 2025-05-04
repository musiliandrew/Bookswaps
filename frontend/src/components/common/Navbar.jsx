import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function Navbar() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-[var(--primary)] text-[var(--secondary)] p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold flex items-center">
          <img src="/frontend/src/assets/logo.png" alt="BookSwap Logo" className="w-6 h-6 mr-2" />
          BookSwap
        </Link>
        <div className="space-x-4">
          <Link to="/" className="hover:underline">Home</Link>
          <Link to="/about" className="hover:underline">About</Link>
          <Link to="/contact" className="hover:underline">Contact</Link>
          {isAuthenticated ? (
            <>
              <Link to="/me/profile" className="hover:underline">Profile</Link>
              <Link to="/users/search" className="hover:underline">Search Users</Link>
              <button
                onClick={handleLogout}
                className="hover:underline focus:outline-none"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:underline">Sign In</Link>
              <Link to="/signup" className="hover:underline">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;