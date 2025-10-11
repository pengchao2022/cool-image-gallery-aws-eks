import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import '../../App.css';

const Header = () => {
  const { currentUser, logout } = useContext(AuthContext);

  return (
    <header>
      <div className="container">
        <nav>
          <div className="logo">
            <i className="fas fa-book-open"></i>
            <span>漫画世界</span>
          </div>
          <ul className="nav-links">
            <li><a href="#" className="active">首页</a></li>
            <li><a href="#">发现</a></li>
            <li><a href="#">排行榜</a></li>
            <li><a href="#">分类</a></li>
          </ul>
          <div className="auth-buttons">
            {currentUser ? (
              <div className="user-info">
                <div className="user-avatar">
                  {currentUser.avatar}
                </div>
                <button className="btn btn-outline" onClick={logout}>
                  退出
                </button>
              </div>
            ) : (
              <>
                <button 
                  className="btn btn-outline" 
                  onClick={() => document.getElementById('loginModal').style.display = 'flex'}
                >
                  登录
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={() => document.getElementById('registerModal').style.display = 'flex'}
                >
                  注册
                </button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;