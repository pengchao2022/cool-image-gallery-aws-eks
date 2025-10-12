import React, { useState, useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext.jsx'
import './Auth.css'

const Register = () => {
  const { register, currentUser } = useContext(AuthContext)
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

    console.log('🔄 1. 开始注册流程 - 表单验证')

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
      console.log('🔄 2. 表单验证通过，开始调用注册API')
      console.log('📝 注册数据:', { username: formData.username, email: formData.email })
      
      // 调用注册函数
      const result = await register(formData.username, formData.email, formData.password)
      console.log('✅ 3. 注册API调用成功，返回结果:', result)

      // 检查 localStorage 中的认证状态
      const token = localStorage.getItem('authToken')
      const user = localStorage.getItem('user')
      
      console.log('🔐 4. 注册后认证状态检查:')
      console.log('   Token:', token ? '存在' : '不存在')
      console.log('   User:', user ? '存在' : '不存在')
      console.log('   Token 值:', token)
      console.log('   User 值:', user)
      
      // 检查 currentUser 状态
      console.log('👤 5. AuthContext currentUser:', currentUser)

      // 注册成功后的处理 - 修复条件判断
      console.log('🔍 6. 检查注册结果条件:')
      console.log('   result.token:', result?.token)
      console.log('   result.user:', result?.user)
      console.log('   token && user:', token && user)

      // 修复：使用 token 和 user 存在作为成功条件，而不是 result.success
      if (result && result.token && result.user) {
        console.log('✅ 7. 条件1: result && result.token && result.user 为 true')
        
        if (token && user) {
          console.log('✅ 8. 条件2: token && user 为 true - 自动登录成功')
          console.log('🚀 9. 准备跳转到个人信息页面')
          navigate('/profile', { 
            replace: true, // 替换当前历史记录，避免回退到注册页
            state: { from: 'register' }
          })
          console.log('🎯 10. navigate 函数已调用 - 应该立即跳转')
        } else {
          console.log('⚠️ 8. 条件2: token && user 为 false - 需要手动登录')
          console.log('🚀 9. 准备跳转到登录页面')
          navigate('/login', { 
            state: { 
              message: '注册成功！请使用您的账号登录',
              prefillEmail: formData.email // 预填充邮箱
            }
          })
          console.log('🎯 10. navigate 函数已调用 - 跳转到登录页')
        }
      } else {
        console.log('⚠️ 7. 条件1: result && result.token && result.user 为 false')
        console.log('🚀 8. 准备跳转到登录页面')
        navigate('/login', { 
          state: { message: '注册成功！请登录' }
        })
        console.log('🎯 9. navigate 函数已调用 - 跳转到登录页')
      }
    } catch (err) {
      console.error('❌ 注册错误:', err)
      console.error('❌ 错误详情:', err.message)
      console.error('❌ 完整错误对象:', err)
      
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
      console.log('🏁 finally 块执行 - 设置 loading 为 false')
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
    
    console.log('🚀 测试跳转到 /profile')
    navigate('/profile', { replace: true })
    console.log('🎯 测试 navigate 函数已调用')
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