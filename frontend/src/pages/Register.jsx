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
    // 清除错误信息当用户开始输入时
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // 增强表单验证
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

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('请输入有效的邮箱地址')
      setLoading(false)
      return
    }

    try {
      console.log('开始注册...', { username: formData.username, email: formData.email })
      
      // 调用注册函数
      const result = await register(formData.username, formData.email, formData.password)
      console.log('注册返回结果:', result)

      // 注册成功后的处理
      if (result && result.success) {
        // 检查是否有token（表示自动登录成功）
        const token = localStorage.getItem('authToken')
        const user = localStorage.getItem('user')
        
        console.log('注册成功，检查登录状态:', { token, user })
        
        if (token && user) {
          // 自动登录成功，跳转到个人信息页面
          console.log('自动登录成功，跳转到个人信息页面')
          navigate('/profile', { 
            replace: true, // 替换当前历史记录，避免回退到注册页
            state: { from: 'register' }
          })
        } else {
          // 需要手动登录，跳转到登录页面并显示成功消息
          console.log('需要手动登录，跳转到登录页面')
          navigate('/login', { 
            state: { 
              message: '注册成功！请使用您的账号登录',
              prefillEmail: formData.email // 预填充邮箱
            }
          })
        }
      } else {
        // 注册返回了成功但数据不完整
        navigate('/login', { 
          state: { message: '注册成功！请登录' }
        })
      }
    } catch (err) {
      console.error('注册错误:', err)
      // 更友好的错误提示
      const errorMessage = err.message || '注册失败，请重试'
      setError(errorMessage)
      
      // 如果是用户名或邮箱已存在，清空相关字段
      if (errorMessage.includes('用户') || errorMessage.includes('邮箱')) {
        setFormData(prev => ({
          ...prev,
          username: errorMessage.includes('用户') ? '' : prev.username,
          email: errorMessage.includes('邮箱') ? '' : prev.email,
          password: '',
          confirmPassword: ''
        }))
      }
    } finally {
      setLoading(false)
    }
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
                placeholder="请输入用户名（唯一标识）"
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
                  注册中...
                </>
              ) : '立即注册'}
            </button>
          </form>

          <p className="auth-switch">
            已有账号？ <Link to="/login">立即登录</Link>
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

export default Register