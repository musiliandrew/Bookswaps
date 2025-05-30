import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import PasswordResetRequestPage from './pages/auth/PasswordResetRequestPage';
import PasswordResetConfirmPage from './pages/auth/PasswordResetConfirmPage';
import UserProfilePage from './pages/profile/UserProfilePage';
import SearchUsersPage from './pages/users/SearchUsersPage';
import UserPublicProfilePage from './pages/users/UserPublicProfilePage';
import BookFeedPage from './pages/books/BookFeedPage';
import SwapFeedPage from './pages/swaps/SwapFeedPage';
import StaticPage from './components/static/StaticPage';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<RegisterPage />} />
            <Route path="/password-reset" element={<PasswordResetRequestPage />} />
            <Route path="/password-reset/confirm" element={<PasswordResetConfirmPage />} />
            <Route path="/profile/me" element={<UserProfilePage />} />
            <Route path="/profile/:id" element={<UserPublicProfilePage />} />
            <Route path="/users/search" element={<SearchUsersPage />} />
            <Route path="/books" element={<BookFeedPage />} />
            <Route path="/swaps" element={<SwapFeedPage />} />
            <Route path="/chats/:userId" element={<div>Chat Page (TBD)</div>} />
            <Route path="/notifications" element={<div>Notifications Page (TBD)</div>} />
            <Route path="/terms" element={<StaticPage title="Terms of Service" contentKey="terms" />} />
            <Route path="/privacy" element={<StaticPage title="Privacy Policy" contentKey="privacy" />} />
            <Route path="/contact" element={<StaticPage title="Contact Us" contentKey="contact" />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme="light"
        toastClassName="bookish-toast"
      />
    </Router>
  );
}

export default App;