import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {isAuthenticated && <Navbar isSmallScreen={isSmallScreen} />}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={isAuthenticated ? <HomePage /> : <Navigate to="/login" />} />
            <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
            <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />
            <Route path="/password-reset/:token?" element={!isAuthenticated ? <PasswordResetPage /> : <Navigate to="/" />} />
            <Route path="/library" element={isAuthenticated ? <LibraryPage /> : <Navigate to="/login" />} />
            <Route path="/profile/me" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} />
            <Route path="/socials" element={isAuthenticated ? <SocialsPage /> : <Navigate to="/login" />} />
            <Route path="/notifications" element={isAuthenticated ? <NotificationsPage /> : <Navigate to="/login" />} />
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
    </Router>
  );
}

export default App;