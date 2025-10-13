import React, { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext.jsx'

const Header = () => {
  const { currentUser, refreshUser } = useContext(AuthContext)
  const navigate = useNavigate()

  console.log('🔍 Header当前用户:', currentUser)

  const handleAvatarClick = () => {
    console.log('👤 头像被点击了，开始验证...')
    
    // 详细检查认证状态
    const token = localStorage.getItem('authToken')
    const userStr = localStorage.getItem('user')
    let userFromStorage = null
    
    try {
      userFromStorage = userStr ? JSON.parse(userStr) : null
    } catch (e) {
      console.error('❌ 解析用户数据失败:', e)
    }
    
    console.log('详细认证检查:', {
      contextUser: currentUser ? `ID: ${currentUser.id}` : 'null',
      storageUser: userFromStorage ? `ID: ${userFromStorage.id}` : 'null',
      token: token ? `存在 (${token.length} 字符)` : '不存在'
    })
    
    // 决策逻辑
    if (currentUser && token) {
      console.log('✅ 情况1: Context 和 Token 都有效，跳转到个人资料')
      navigate('/profile')
    } else if (userFromStorage && token) {
      console.log('🔄 情况2: Context 丢失但存储中有数据，刷新状态后跳转')
      refreshUser()
      setTimeout(() => navigate('/profile'), 100) // 稍等片刻让状态更新
    } else if (token && !userFromStorage) {
      console.log('❌ 情况3: 有 Token 但无用户数据，数据损坏，清除并跳转登录')
      localStorage.removeItem('authToken')
      localStorage.removeItem('user')
      navigate('/login')
    } else {
      console.log('❌ 情况4: 完全未认证，跳转到登录')
      navigate('/login')
    }
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
                
                {/* 头像 - 点击可进入个人资料 */}
                <div 
                  className="user-avatar"
                  onClick={handleAvatarClick}
                  title={`点击查看 ${currentUser.username} 的个人信息`}
                  style={{ 
                    cursor: 'pointer',
                    background: 'var(--primary)',
                    color: 'white',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}
                >
                  {currentUser.username?.[0]?.toUpperCase() || 'U'}
                </div>
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