import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Menu, X } from 'lucide-react';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import PasswordResetRequestPage from './pages/auth/PasswordResetRequestPage';
import PasswordResetConfirmPage from './pages/auth/PasswordResetConfirmPage';
import UserProfilePage from './pages/profile/UserProfilePage';
import SearchUsersPage from './pages/users/SearchUsersPage';
import UserPublicProfilePage from './pages/users/UserPublicProfilePage';
// Placeholder pages (to be implemented)
const BookFeedPage = () => <div>Book Feed Page</div>;
const BookDetailPage = () => <div>Book Detail Page</div>;
const UserLibraryPage = () => <div>User Library Page</div>;
const SwapFeedPage = () => <div>Swap Feed Page</div>;
const CreateSwapPage = () => <div>Create Swap Page</div>;
const ChatListPage = () => <div>Chat List Page</div>;
const ChatThreadPage = () => <div>Chat Thread Page</div>;
const DiscussionFeedPage = () => <div>Discussion Feed Page</div>;
const DiscussionDetailPage = () => <div>Discussion Detail Page</div>;
const CreateDiscussionPage = () => <div>Create Discussion Page</div>;
const SocietyListPage = () => <div>Society List Page</div>;
const SocietyDetailPage = () => <div>Society Detail Page</div>;
const NotificationsPage = () => <div>Notifications Page</div>;

function Navbar() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <>
      <nav className="bg-primary text-secondary p-4 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img
            src="/book.svg"
            alt="BookSwap Logo"
            className="h-8 w-8 hover:scale-105 transition-transform duration-200"
          />
          <span className="text-2xl font-['Lora'] text-shadow">BookSwap</span>
        </Link>
        <div className="hidden md:flex space-x-4">
          <Link to="/" className="hover:text-accent transition-colors">Home</Link>
          <Link to="/books" className="hover:text-accent transition-colors">Books</Link>
          <Link to="/swaps" className="hover:text-accent transition-colors">Swaps</Link>
          <Link to="/chats" className="hover:text-accent transition-colors">Chats</Link>
          <Link to="/discussions" className="hover:text-accent transition-colors">Discussions</Link>
          <Link to="/me/profile" className="hover:text-accent transition-colors">Profile</Link>
          <Link to="/notifications" className="hover:text-accent transition-colors">Notifications</Link>
        </div>
        <button className="md:hidden text-secondary" onClick={toggleSidebar}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-secondary text-text transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 md:hidden z-50`}
      >
        <div className="p-4">
          <button onClick={toggleSidebar} className="mb-4">
            <X size={24} className="text-primary" />
          </button>
          <nav className="flex flex-col space-y-2">
            <Link to="/" onClick={toggleSidebar} className="hover:text-primary transition-colors">Home</Link>
            <Link to="/books" onClick={toggleSidebar} className="hover:text-primary transition-colors">Books</Link>
            <Link to="/swaps" onClick={toggleSidebar} className="hover:text-primary transition-colors">Swaps</Link>
            <Link to="/chats" onClick={toggleSidebar} className="hover:text-primary transition-colors">Chats</Link>
            <Link to="/discussions" onClick={toggleSidebar} className="hover:text-primary transition-colors">Discussions</Link>
            <Link to="/me/profile" onClick={toggleSidebar} className="hover:text-primary transition-colors">Profile</Link>
            <Link to="/notifications" onClick={toggleSidebar} className="hover:text-primary transition-colors">Notifications</Link>
          </nav>
        </div>
      </div>
    </>
  );
}

function Footer() {
  return (
    <footer className="bg-secondary text-text p-4 text-center">
      <p className="font-['Caveat'] text-lg">
        &copy; {new Date().getFullYear()} BookSwap. All rights reserved.
      </p>
      <div className="mt-2 space-x-4">
        <Link to="/about" className="hover:text-primary transition-colors">About</Link>
        <Link to="/contact" className="hover:text-primary transition-colors">Contact</Link>
      </div>
    </footer>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<RegisterPage />} />
            <Route path="/password/reset" element={<PasswordResetRequestPage />} />
            <Route path="/password/reset/confirm/:token" element={<PasswordResetConfirmPage />} />
            <Route path="/me/profile" element={<UserProfilePage />} />
            <Route path="/users/search" element={<SearchUsersPage />} />
            <Route path="/users/:username" element={<UserPublicProfilePage />} />
            <Route path="/books" element={<BookFeedPage />} />
            <Route path="/books/:book_id" element={<BookDetailPage />} />
            <Route path="/me/library" element={<UserLibraryPage />} />
            <Route path="/swaps" element={<SwapFeedPage />} />
            <Route path="/swaps/create" element={<CreateSwapPage />} />
            <Route path="/chats" element={<ChatListPage />} />
            <Route path="/chats/:chat_id" element={<ChatThreadPage />} />
            <Route path="/discussions" element={<DiscussionFeedPage />} />
            <Route path="/discussions/:discussion_id" element={<DiscussionDetailPage />} />
            <Route path="/discussions/create" element={<CreateDiscussionPage />} />
            <Route path="/societies" element={<SocietyListPage />} />
            <Route path="/societies/:society_id" element={<SocietyDetailPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Routes>
        </main>
        <Footer />
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          closeOnClick
          pauseOnHover
          theme="light"
          toastClassName="bookish-border"
        />
      </div>
    </Router>
  );
}

export default App;