import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import Navbar from './components/common/Navbar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

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
            <Route path="/books" element={<div>Books Page (TBD)</div>} />
            <Route path="/swaps" element={<div>Swaps Page (TBD)</div>} />
            <Route path="/chat" element={<div>Chat Page (TBD)</div>} />
            <Route path="/discussions" element={<div>Discussions Page (TBD)</div>} />
            <Route path="/discussions/:id" element={<div>Discussion Detail (TBD)</div>} />
            <Route path="/profile" element={<div>Profile Page (TBD)</div>} />
            <Route path="/notifications" element={<div>Notifications Page (TBD)</div>} />
            <Route path="/terms" element={<div>Terms Page (TBD)</div>} />
            <Route path="/privacy" element={<div>Privacy Page (TBD)</div>} />
          </Routes>
        </main>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme="light"
      />
    </Router>
  );
}

export default App;