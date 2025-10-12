import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext.jsx'
import './Auth.css'

const Register = () => {
  const { register } = useContext(AuthContext)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 表单验证
    if (!formData.username.trim()) {
      setError('请输入用户名')
      setLoading(false)
      return
    }

    if (!formData.email.trim()) {
      setError('请输入邮箱地址')
      setLoading(false)
      return
    }

    if (!formData.password) {
      setError('请输入密码')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('密码长度至少6位')
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致')
      setLoading(false)
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('请输入有效的邮箱地址')
      setLoading(false)
      return
    }

    try {
      console.log('🔄 开始注册...')
      
      // 调用注册函数
      const result = await register(formData.username, formData.email, formData.password)
      console.log('✅ 注册成功:', result)

      // 简化：直接跳转，使用 setTimeout 确保在下一个事件循环中执行
      console.log('🚀 准备跳转到 /profile')
      setTimeout(() => {
        console.log('🎯 执行 navigate 到 /profile')
        navigate('/profile', { 
          replace: true,
          state: { from: 'register' }
        })
      }, 100)
      
    } catch (err) {
      console.error('❌ 注册错误:', err)
      setError(err.message || '注册失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 测试重定向按钮
  const testRedirect = () => {
    console.log('🧪 测试重定向到 /profile')
    navigate('/profile', { replace: true })
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <h2>注册账号</h2>
          <p className="auth-subtitle">加入漫画世界，开始您的创作之旅</p>
          
          {error && (
            <div className="auth-error">
              <span style={{marginRight: '8px'}}>⚠️</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username">用户名</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="请输入用户名"
                minLength="2"
                maxLength="20"
              />
            </div>

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
                placeholder="请输入有效的邮箱地址"
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
                placeholder="请输入密码（至少6位）"
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">确认密码</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
                placeholder="请再次输入密码"
                minLength="6"
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary auth-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  注册中...
                </>
              ) : '立即注册'}
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
            已有账号？ <Link to="/login">立即登录</Link>
          </p>
        </div>
      </div>

      <style>{`
        .loading-spinner {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 8px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default Register