import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'

// Pages
import Login from './components/Auth_pages/login.jsx'
import Signup from './components/Auth_pages/signup.jsx'
import Home from './components/home.jsx'
import SwapPage from './components/swap/swap_page.jsx'
import DiscussionPage from './components/discussion/discussionPage.jsx'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path='/swap' element={<SwapPage />} />
          <Route path='/discussions' element={<DiscussionPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
