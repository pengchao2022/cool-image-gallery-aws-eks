import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import '../../App.css';

const Header = () => {
  const { currentUser, login, register, logout } = useContext(AuthContext);
  const [activeModal, setActiveModal] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    
    const email = e.target.loginEmail.value;
    const password = e.target.loginPassword.value;
    
    try {
      await login(email, password);
      setActiveModal(null);
      e.target.reset();
    } catch (error) {
      setAuthError(error.message || '登录失败');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    
    const username = e.target.registerUsername.value;
    const email = e.target.registerEmail.value;
    const password = e.target.registerPassword.value;
    const confirmPassword = e.target.confirmPassword.value;
    
    if (password !== confirmPassword) {
      setAuthError('两次输入的密码不一致！');
      setAuthLoading(false);
      return;
    }
    
    try {
      await register(username, email, password);
      setActiveModal(null);
      e.target.reset();
    } catch (error) {
      setAuthError(error.message || '注册失败');
    } finally {
      setAuthLoading(false);
    }
  };

  const closeModal = () => {
    setActiveModal(null);
    setAuthError('');
    setAuthLoading(false);
  };

  return (
    <>
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
              <li><Link to="/" className="active">首页</Link></li>
              <li><a href="#">发现</a></li>
              <li><a href="#">排行榜</a></li>
              <li><a href="#">分类</a></li>
            </ul>
            <div className="auth-buttons">
              {currentUser ? (
                <div className="user-info">
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/upload')}
                  >
                    上传漫画
                  </button>
                  <div 
                    className="user-avatar"
                    onClick={() => navigate('/profile')}
                    style={{ cursor: 'pointer' }}
                    title="点击查看个人信息"
                  >
                    {currentUser.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <button className="btn btn-outline" onClick={logout}>
                    退出
                  </button>
                </div>
              ) : (
                <>
                  <button 
                    className="btn btn-outline" 
                    onClick={() => setActiveModal('login')}
                    disabled={authLoading}
                  >
                    登录
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setActiveModal('register')}
                    disabled={authLoading}
                  >
                    注册
                  </button>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* 登录模态框 */}
      {activeModal === 'login' && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">登录账号</h3>
              <button className="close-modal" onClick={closeModal}>&times;</button>
            </div>
            {authError && (
              <div style={{ 
                background: 'var(--danger)', 
                color: 'white', 
                padding: '10px', 
                borderRadius: '4px',
                marginBottom: '15px'
              }}>
                {authError}
              </div>
            )}
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="loginEmail">邮箱</label>
                <input 
                  type="email" 
                  id="loginEmail" 
                  className="form-control" 
                  placeholder="请输入邮箱" 
                  required 
                  disabled={authLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="loginPassword">密码</label>
                <input 
                  type="password" 
                  id="loginPassword" 
                  className="form-control" 
                  placeholder="请输入密码" 
                  required 
                  disabled={authLoading}
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%' }}
                disabled={authLoading}
              >
                {authLoading ? '登录中...' : '登录'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '20px' }}>
              还没有账号？<a href="#" onClick={() => setActiveModal('register')}>立即注册</a>
            </p>
          </div>
        </div>
      )}

      {/* 注册模态框 */}
      {activeModal === 'register' && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">注册账号</h3>
              <button className="close-modal" onClick={closeModal}>&times;</button>
            </div>
            {authError && (
              <div style={{ 
                background: 'var(--danger)', 
                color: 'white', 
                padding: '10px', 
                borderRadius: '4px',
                marginBottom: '15px'
              }}>
                {authError}
              </div>
            )}
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label htmlFor="registerUsername">用户名</label>
                <input 
                  type="text" 
                  id="registerUsername" 
                  className="form-control" 
                  placeholder="请输入用户名" 
                  required 
                  disabled={authLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="registerEmail">邮箱</label>
                <input 
                  type="email" 
                  id="registerEmail" 
                  className="form-control" 
                  placeholder="请输入邮箱" 
                  required 
                  disabled={authLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="registerPassword">密码</label>
                <input 
                  type="password" 
                  id="registerPassword" 
                  className="form-control" 
                  placeholder="请输入密码" 
                  required 
                  disabled={authLoading}
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">确认密码</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  className="form-control" 
                  placeholder="请再次输入密码" 
                  required 
                  disabled={authLoading}
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%' }}
                disabled={authLoading}
              >
                {authLoading ? '注册中...' : '注册'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '20px' }}>
              已有账号？<a href="#" onClick={() => setActiveModal('login')}>立即登录</a>
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;