import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext.jsx'
import './Auth.css'

const Login = () => {
  const { login } = useContext(AuthContext)
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
      console.log('🔐 认证状态检查:')
      console.log('   Token:', token ? '存在' : '不存在')
      console.log('   User:', user)
      
      // 登录成功，跳转到 profile
      console.log('🚀 准备跳转到 /profile')
      navigate('/profile', { replace: true })
      console.log('🎯 navigate 函数已调用')
      
    } catch (err) {
      console.error('❌ 登录错误:', err)
      console.error('❌ 错误详情:', err.message)
      setError(err.message || '登录失败，请重试')
      
      // 检查是否因为网络错误导致
      const token = localStorage.getItem('authToken')
      console.log('❌ 错误时 token 状态:', token)
    } finally {
      setLoading(false)
    }
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
              {loading ? '登录中...' : '登录'}
            </button>
          </form>

          <p className="auth-switch">
            还没有账号？ <Link to="/register">立即注册</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login