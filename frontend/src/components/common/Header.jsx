import React, { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext.jsx'

const Header = () => {
  const { currentUser, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  console.log('🔍 Header当前用户:', currentUser)

  const handleAvatarClick = () => {
    console.log('👤 头像被点击了，跳转到个人资料')
    navigate('/profile')
  }

  const handleLogout = () => {
    console.log('🚪 执行退出登录')
    logout()
    navigate('/')
  }

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
            <li>
              <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                首页
              </Link>
            </li>
            <li>
              <Link to="/browse" style={{ textDecoration: 'none', color: 'inherit' }}>
                浏览漫画
              </Link>
            </li>
            {currentUser && (
              <li>
                <Link to="/upload" style={{ textDecoration: 'none', color: 'inherit' }}>
                  上传
                </Link>
              </li>
            )}
          </ul>
          
          <div className="auth-buttons">
            {currentUser ? (
              <div className="user-info">
                <Link to="/upload" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                  上传漫画
                </Link>
                
                {/* 头像 - 确保可点击 */}
                <div 
                  className="user-avatar"
                  onClick={handleAvatarClick}
                  title="点击查看个人信息"
                >
                  {currentUser.username?.[0]?.toUpperCase() || 'U'}
                </div>
                
                <button 
                  className="btn btn-outline" 
                  onClick={handleLogout}
                >
                  退出
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline" style={{ textDecoration: 'none' }}>
                  登录
                </Link>
                <Link to="/register" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                  注册
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Header