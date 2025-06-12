import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar'; // this is for main navigation (authenticated users)
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

  // Show loading screen while checking authentication status
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Only show main Navbar for authenticated users */}
      {isAuthenticated && <Navbar isSmallScreen={isSmallScreen} />}
      
      <main className="flex-grow">
        <Routes>
          {/* Root route - HomePage for unauthenticated, Profile for authenticated */}
          <Route 
            path="/" 
            element={isAuthenticated ? <Navigate to="/profile/me" /> : <HomePage />} 
          />
          
          {/* Auth routes - only accessible when not authenticated */}
          <Route 
            path="/login" 
            element={!isAuthenticated ? <LoginPage /> : <Navigate to="/profile/me" />} 
          />
          <Route 
            path="/register" 
            element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/profile/me" />} 
          />
          <Route 
            path="/password-reset/:token?" 
            element={!isAuthenticated ? <PasswordResetPage /> : <Navigate to="/profile/me" />} 
          />
          
          {/* Protected Main routes - only accessible when authenticated */}
          <Route 
            path="/library" 
            element={isAuthenticated ? <LibraryPage /> : <Navigate to="/" />} 
          />
          <Route 
            path="/profile/me" 
            element={isAuthenticated ? <ProfilePage /> : <Navigate to="/" />} 
          />
          <Route 
            path="/socials" 
            element={isAuthenticated ? <SocialsPage /> : <Navigate to="/" />} 
          />
          <Route 
            path="/notifications" 
            element={isAuthenticated ? <NotificationsPage /> : <Navigate to="/" />} 
          />
          
          {/* Catch all route */}
          <Route 
            path="*" 
            element={<Navigate to={isAuthenticated ? "/profile/me" : "/"} />} 
          />
        </Routes>
      </main>
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme="light"
        toastClassName="bookish-toast"
      />
    </div>
  );
}

export default App;