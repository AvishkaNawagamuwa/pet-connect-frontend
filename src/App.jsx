import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import authService from './services/authService';
import './styles/animations.css';

import Landing from './pages/landing/landing';
import Home from './pages/Home/Home';
import Dashboard from './pages/Dashboard';
import Adoption from './pages/Adoption/adoption';
import Post from './pages/post/post';
import CommunityWall from './pages/commwall/commwall';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ChatBox from './pages/chatbox';
import News from './pages/News';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on app start
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      setIsLoggedIn(authenticated);
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#d5a67e]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4d2e1d] mx-auto mb-4"></div>
          <p className="text-[#4d2e1d] font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page as first page */}
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Landing />} />

        {/* Auth pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Main app pages */}
        <Route path="/home" element={isLoggedIn ? <Home /> : <Navigate to="/login" />} />
        <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/adoption" element={isLoggedIn ? <Adoption /> : <Navigate to="/login" />} />
        <Route path="/post" element={isLoggedIn ? <Post /> : <Navigate to="/login" />} />
        <Route path="/commwall" element={isLoggedIn ? <CommunityWall /> : <Navigate to="/login" />} />
        <Route path="/chat" element={isLoggedIn ? <ChatBox /> : <Navigate to="/login" />} />
        <Route path="/news" element={isLoggedIn ? <News /> : <Navigate to="/login" />} />

        {/* Catch all route - redirect to landing */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
