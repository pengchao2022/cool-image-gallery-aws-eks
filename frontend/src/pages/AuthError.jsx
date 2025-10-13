import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const AuthError = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  // 从路由状态获取错误信息
  const error = location.state?.error || '认证出现问题'
  const from = location.state?.from || 'unknown'
  const hasUserData = location.state?.hasUserData || false

  const handleReLogin = () => {
    // 清除所有数据后跳转到登录页
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const handleGoHome = () => {
    navigate('/')
  }

  const handleRetry = () => {
    // 刷新页面重试
    window.location.reload()
  }

  return (
    <div className="auth-error-page" style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="error-container" style={{
        textAlign: 'center',
        maxWidth: '500px',
        padding: '40px',
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{ fontSize: '64px', color: '#ffa726', marginBottom: '20px' }}>
          🔐
        </div>
        
        <h1 style={{ color: '#333', marginBottom: '16px' }}>
          认证状态异常
        </h1>
        
        <p style={{ color: '#666', marginBottom: '8px', fontSize: '16px' }}>
          {hasUserData 
            ? '检测到您的登录状态异常，但用户信息仍然存在' 
            : '您的登录状态已失效'}
        </p>
        
        <div style={{
          background: '#e3f2fd',
          border: '1px solid #bbdefb',
          borderRadius: '8px',
          padding: '16px',
          margin: '20px 0',
          textAlign: 'left'
        }}>
          <strong>可能的原因:</strong>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>登录会话已过期</li>
            <li>浏览器缓存被清除</li>
            <li>服务器认证配置更新</li>
            <li>网络请求中断导致状态不一致</li>
          </ul>
        </div>

        <div style={{
          background: '#f3e5f5',
          border: '1px solid #e1bee7',
          borderRadius: '8px',
          padding: '12px',
          margin: '15px 0',
          fontSize: '14px'
        }}>
          <strong>来源:</strong> {from}
          <br />
          <strong>错误:</strong> {error}
        </div>
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '30px', flexWrap: 'wrap' }}>
          <button 
            onClick={handleReLogin}
            className="btn btn-primary"
            style={{ minWidth: '140px' }}
          >
            重新登录
          </button>
          
          <button 
            onClick={handleRetry}
            className="btn btn-outline"
            style={{ minWidth: '140px' }}
          >
            刷新重试
          </button>
          
          <button 
            onClick={handleGoHome}
            className="btn btn-outline"
            style={{ minWidth: '140px' }}
          >
            返回首页
          </button>
        </div>

        {/* 调试信息 */}
        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: '#f5f5f5',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#666',
          textAlign: 'left'
        }}>
          <strong>调试信息:</strong>
          <div>用户数据: {localStorage.getItem('user') ? '存在' : '不存在'}</div>
          <div>Token: {localStorage.getItem('authToken') ? '存在' : '不存在'}</div>
          <div>来源页面: {from}</div>
        </div>
      </div>
    </div>
  )
}

export default AuthError