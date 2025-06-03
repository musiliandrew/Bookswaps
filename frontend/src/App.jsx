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
import BookDetailsPage from './pages/books/BookDetailsPage';
import SwapFeedPage from './pages/swaps/SwapFeedPage';
import SwapDetailsPage from './pages/swaps/SwapDetailsPage';
import SwapHistoryPage from './pages/swaps/SwapHistoryPage';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import AddLocationPage from './pages/location/AddLocationPage';
import SocietiesPage from './pages/chats/SocietiesPage';
import SocietyPage from './pages/chats/SocietyPage';
import CreateSocietyPage from './pages/chats/CreateSocietyPage';
import ChatPage from './pages/chats/ChatPage'; 
import DiscussionsPage from './pages/Discussion/DiscussionsPage';
import CreateDiscussionPage from './pages/Discussion/CreateDiscussionPage';
import DiscussionDetailPage from './pages/Discussion/DiscussionDetailPage';
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
            <Route path="/books/:bookId" element={<BookDetailsPage />} />
            <Route path="/swaps" element={<SwapFeedPage />} />
            <Route path="/swaps/:swapId" element={<SwapDetailsPage />} />
            <Route path="/swaps/history" element={<SwapHistoryPage />} />
            <Route path="/chats/:userId" element={<ChatPage />} /> {/* Updated */}
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/locations/add" element={<AddLocationPage />} />
            <Route path="/discussions" element={<DiscussionsPage />} />
            <Route path="/discussions/:discussionId" element={<DiscussionDetailPage />} />
            <Route path="/discussions/new" element={<CreateDiscussionPage />} />
            <Route path="/societies" element={<SocietiesPage />} />
            <Route path="/societies/:societyId" element={<SocietyPage />} />
            <Route path="/societies/new" element={<CreateSocietyPage />} />
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