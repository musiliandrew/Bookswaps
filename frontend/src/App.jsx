import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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


function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<RegisterPage />} />
            <Route path="/password/reset" element={<PasswordResetRequestPage />} />
            <Route path="/password/reset/confirm/:token" element={<PasswordResetConfirmPage />} />
            <Route path="/me/profile" element={<UserProfilePage />} />
            <Route path="/users/search" element={<SearchUsersPage />} />
            <Route path="/users/:username" element={<UserPublicProfilePage />} />
            {/* Add other routes later */}
          </Routes>
        </main>
        <Footer />
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover />
      </div>
    </Router>
  );
}

export default App;