import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import PasswordResetPage from './pages/Auth/PasswordResetPage';
import HomePage from './pages/Home/HomePage';
import LibraryPage from './pages/Main/LibraryPage';
import ProfilePage from './pages/Main/ProfilePage';
import SocialsPage from './pages/Main/SocialsPage';
import NotificationsPage from './pages/Main/NotificationsPage';

function App() {
  const { isAuthenticated, isLoading } = useAuth();
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Loading state with proper JSX structure
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <span className="text-lg font-medium text-gray-700">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar with fixed positioning - only show when authenticated */}
      {isAuthenticated && (
        <div className="fixed top-0 left-0 right-0 z-50 shadow-sm">
          <Navbar isSmallScreen={isSmallScreen} />
        </div>
      )}

      {/* Main content with padding to account for navbar */}
      <main className={`flex-grow ${isAuthenticated ? 'pt-16' : ''}`}>
        <Routes>
          {/* Public Routes (Unauthenticated Users) */}
          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to="/profile/me" replace />
              ) : (
                <HomePage />
              )
            }
          />
          <Route
            path="/login"
            element={
              !isAuthenticated ? (
                <LoginPage />
              ) : (
                <Navigate to="/profile/me" replace />
              )
            }
          />
          <Route
            path="/register"
            element={
              !isAuthenticated ? (
                <RegisterPage />
              ) : (
                <Navigate to="/profile/me" replace />
              )
            }
          />
          <Route
            path="/password-reset/:token?"
            element={
              !isAuthenticated ? (
                <PasswordResetPage />
              ) : (
                <Navigate to="/profile/me" replace />
              )
            }
          />

          {/* Protected Routes (Authenticated Users) */}
          <Route
            path="/profile/me"
            element={
              isAuthenticated ? (
                <ProfilePage />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/library"
            element={
              isAuthenticated ? (
                <LibraryPage />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/socials"
            element={
              isAuthenticated ? (
                <SocialsPage />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/notifications"
            element={
              isAuthenticated ? (
                <NotificationsPage />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Catch-all route */}
          <Route
            path="*"
            element={
              <Navigate 
                to={isAuthenticated ? "/profile/me" : "/"} 
                replace 
              />
            }
          />
        </Routes>
      </main>

      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastClassName="bookish-toast"
        bodyClassName="bookish-toast-body"
        progressClassName="bookish-toast-progress"
      />
    </div>
  );
}

export default App;