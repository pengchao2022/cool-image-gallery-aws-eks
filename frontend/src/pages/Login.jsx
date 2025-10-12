import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext.jsx'
import './Auth.css'

const Login = () => {
  const { login, currentUser } = useContext(AuthContext)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('🔄 开始登录流程...')
      console.log('📧 邮箱:', formData.email)
      
      // 调用登录函数
      const result = await login(formData.email, formData.password)
      console.log('✅ 登录API调用成功，返回结果:', result)

      // 检查 localStorage 中的认证状态
      const token = localStorage.getItem('authToken')
      const user = localStorage.getItem('user')
      console.log('🔐 登录后认证状态检查:')
      console.log('   Token:', token)
      console.log('   User:', user)
      
      // 检查 currentUser 状态
      console.log('👤 AuthContext currentUser:', currentUser)
      
      // 登录成功，跳转到 profile
      console.log('🚀 准备跳转到 /profile')
      navigate('/profile', { 
        replace: true,
        state: { from: 'login' }
      })
      console.log('🎯 navigate 函数已调用')
      
    } catch (err) {
      console.error('❌ 登录错误:', err)
      console.error('❌ 错误详情:', err.message)
      console.error('❌ 完整错误对象:', err)
      
      // 检查是否因为网络错误导致
      const token = localStorage.getItem('authToken')
      console.log('❌ 错误时 token 状态:', token)
      
      setError(err.message || '登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 测试重定向按钮
  const testRedirect = () => {
    console.log('🧪 测试重定向...')
    console.log('当前 localStorage:')
    console.log('  authToken:', localStorage.getItem('authToken'))
    console.log('  user:', localStorage.getItem('user'))
    console.log('AuthContext currentUser:', currentUser)
    
    navigate('/profile', { replace: true })
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2>登录账号</h2>
          <p className="auth-subtitle">欢迎回到漫画世界</p>
          
          {error && (
            <div className="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">邮箱地址</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="请输入您的邮箱"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">密码</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="请输入您的密码"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner" style={{
                    display: 'inline-block',
                    width: '16px',
                    height: '16px',
                    border: '2px solid transparent',
                    borderTop: '2px solid currentColor',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    marginRight: '8px'
                  }}></span>
                  登录中...
                </>
              ) : '登录'}
            </button>
          </form>

          {/* 测试重定向按钮 */}
          <button 
            type="button" 
            onClick={testRedirect}
            className="btn btn-secondary"
            style={{
              marginTop: '15px',
              background: '#666',
              width: '100%',
              padding: '12px',
              fontSize: '14px'
            }}
          >
            🧪 测试重定向到 Profile
          </button>

          <p className="auth-switch">
            还没有账号？ <Link to="/register">立即注册</Link>
          </p>
        </div>
      </div>

      {/* 添加旋转动画 */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default Login