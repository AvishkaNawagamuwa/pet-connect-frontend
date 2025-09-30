import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, UserCircle2 } from 'lucide-react';
import logo from '../assets/logo.png';
import authService from '../services/authService';

export default function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, [location]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <nav
      style={{
        boxShadow: "rgba(0, 0, 0, 0.4) 0px 2px 4px, rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset",
      }}
      className="bg-[#f4e8dc] text-[#4a372f] shadow-lg py-3 px-6 flex justify-between items-center fixed top-0 left-0 w-full z-50 backdrop-blur-sm">
      <Link to="/landing">
        <img src={logo} alt="Pet Connect Logo" className="h-16 w-auto hover:scale-105 transition-transform duration-200" />
      </Link>

      <div className="flex items-center space-x-8">
        {/* Main Navigation Links */}
        <div className="flex space-x-8 text-lg font-medium">
          <Link
            to="/home"
            className={`transition-colors duration-200 hover:text-[#bb6939] ${isActive('/home') ? 'text-[#bb6939] font-semibold' : 'text-[#4a372f]'
              }`}
          >
            🏠 Home
          </Link>
          <Link
            to="/commwall"
            className={`transition-colors duration-200 hover:text-[#bb6939] ${isActive('/commwall') ? 'text-[#bb6939] font-semibold' : 'text-[#4a372f]'
              }`}
          >
            👥 Community
          </Link>
          <Link
            to="/news"
            className={`transition-colors duration-200 hover:text-[#bb6939] ${isActive('/news') ? 'text-[#bb6939] font-semibold' : 'text-[#4a372f]'
              }`}
          >
            📰 News
          </Link>
          <Link
            to="/chat"
            className={`transition-colors duration-200 hover:text-[#bb6939] ${isActive('/chat') ? 'text-[#bb6939] font-semibold' : 'text-[#4a372f]'
              }`}
          >
            🤖 AI Chat
          </Link>
          <Link
            to="/adoption"
            className={`transition-colors duration-200 hover:text-[#bb6939] ${isActive('/adoption') ? 'text-[#bb6939] font-semibold' : 'text-[#4a372f]'
              }`}
          >
            🐾 Adoption
          </Link>
        </div>

        {/* User Authentication Section */}
        {user ? (
          <div className="relative user-menu-container">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 bg-gradient-to-r from-[#d5a67e] to-[#c19660] text-white px-4 py-2 rounded-lg hover:from-[#c19660] hover:to-[#8b4513] transition-all duration-200 shadow-md hover-lift"
            >
              <UserCircle2 size={20} />
              <span className="font-medium">Welcome, {user.name}!</span>
              <svg className={`w-4 h-4 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-[#d5a67e] py-2 animate-fadeIn">
                <div className="px-4 py-2 border-b border-[#d5a67e]">
                  <p className="text-sm font-medium text-[#4a372f]">{user.name}</p>
                  <p className="text-xs text-[#8b4513]">{user.email}</p>
                </div>

                <Link
                  to="/dashboard"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center space-x-3 px-4 py-2 text-[#4a372f] hover:bg-[#f5e6d3] transition-colors duration-200"
                >
                  <Settings size={16} />
                  <span>📊 Dashboard</span>
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-[#4a372f] hover:bg-[#f5e6d3] transition-colors duration-200"
                >
                  <LogOut size={16} />
                  <span>👋 Logout</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="flex items-center space-x-2 text-[#4a372f] hover:text-[#bb6939] font-medium transition-colors duration-200"
            >
              <User size={16} />
              <span>Login</span>
            </Link>
            <Link
              to="/signup"
              className="bg-gradient-to-r from-[#d5a67e] to-[#c19660] hover:from-[#c19660] hover:to-[#8b4513] text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover-lift"
            >
              ✨ Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
