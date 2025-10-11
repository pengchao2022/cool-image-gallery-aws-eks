import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import '../../App.css';

const Header = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header>
      <div className="container">
        <nav>
          <div className="logo">
            <i className="fas fa-book-open"></i>
            <Link to="/" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
              <span>漫画世界</span>
            </Link>
          </div>
          
          <ul className="nav-links">
            <li><Link to="/">首页</Link></li>
            <li><Link to="/browse">浏览漫画</Link></li>
            {currentUser && (
              <li><Link to="/upload">上传</Link></li>
            )}
          </ul>
          
          <div className="auth-buttons">
            {currentUser ? (
              <div className="user-info">
                <div 
                  className="user-avatar"
                  onClick={() => navigate('/profile')}
                  title="个人资料"
                >
                  {currentUser.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <button className="btn btn-outline" onClick={handleLogout}>
                  退出
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline">登录</Link>
                <Link to="/register" className="btn btn-primary">注册</Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;