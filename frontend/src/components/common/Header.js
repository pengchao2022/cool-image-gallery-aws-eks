import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <h1>ComicHub</h1>
        </Link>
        
        <nav className="nav">
          <Link to="/browse" className="nav-link">Browse Comics</Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/upload" className="nav-link">Upload</Link>
              <Link to="/my-comics" className="nav-link">My Comics</Link>
              <div className="user-menu">
                <span>Welcome, {user?.username}</span>
                <Link to="/profile" className="nav-link">Profile</Link>
                <button onClick={handleLogout} className="logout-btn">
                  Logout
                </button>
              </div>
            </>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link register">Register</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;