import React, { createContext, useState, useEffect } from 'react'

export const AuthContext = createContext()

// 内联认证服务 - 避免外部依赖问题
const createAuthService = () => ({
  async login(email, password) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || '登录失败')
      }
      
      if (data.token && data.user) {
        this.setAuth(data.token, data.user)
        return data
      }
      
      throw new Error('服务器响应格式错误')
    } catch (error) {
      this.logout()
      throw error
    }
  },

  async register(username, email, password) {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || '注册失败')
      }
      
      if (data.token && data.user) {
        this.setAuth(data.token, data.user)
        return data
      }
      
      throw new Error('服务器响应格式错误')
    } catch (error) {
      throw error
    }
  },

  setAuth(token, user) {
    try {
      localStorage.setItem('authToken', token)
      localStorage.setItem('user', JSON.stringify(user))
      console.log('✅ 认证数据已保存')
    } catch (error) {
      console.error('❌ 保存认证数据失败:', error)
      throw new Error('无法保存登录信息')
    }
  },

  logout() {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    console.log('✅ 认证数据已清除')
  },

  getToken() {
    return localStorage.getItem('authToken')
  },

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user')
      if (!userStr) return null
      
      const user = JSON.parse(userStr)
      // 验证用户对象的基本结构
      if (user && typeof user === 'object' && user.id && user.username) {
        return user
      }
      
      console.warn('⚠️ 用户数据格式无效')
      this.logout()
      return null
    } catch (error) {
      console.error('❌ 解析用户数据失败:', error)
      this.logout()
      return null
    }
  },

  isAuthenticated() {
    return !!(this.getToken() && this.getCurrentUser())
  }
})

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // 创建认证服务实例
  const authService = createAuthService()

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = () => {
    try {
      const token = authService.getToken()
      const user = authService.getCurrentUser()
      
      console.log('🔐 AuthContext 初始化检查:', {
        hasToken: !!token,
        hasUser: !!user,
        tokenLength: token ? token.length : 0,
        userId: user?.id
      })
      
      if (user && token) {
        console.log('✅ 认证有效，设置当前用户:', { id: user.id, username: user.username })
        setCurrentUser(user)
      } else {
        console.log('❌ 认证数据不完整或无效')
        // 自动清理无效数据
        if (token && !user) {
          console.log('🔄 自动清理无效的认证数据')
          authService.logout()
        }
        setCurrentUser(null)
      }
    } catch (error) {
      console.error('❌ 认证初始化失败:', error)
      // 确保在错误情况下清理数据
      authService.logout()
      setCurrentUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setError(null)
      setLoading(true)
      console.log('🔐 开始登录...', { email })
      
      const response = await authService.login(email, password)
      console.log('✅ 登录成功:', { userId: response.user.id, username: response.user.username })
      
      setCurrentUser(response.user)
      return response
    } catch (error) {
      console.error('❌ 登录失败:', error.message)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (username, email, password) => {
    try {
      setError(null)
      setLoading(true)
      console.log('🔐 开始注册...', { username, email })
      
      const response = await authService.register(username, email, password)
      console.log('✅ 注册成功:', { userId: response.user.id, username: response.user.username })
      
      setCurrentUser(response.user)
      return response
    } catch (error) {
      console.error('❌ 注册失败:', error.message)
      setError(error.message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    console.log('🔐 用户登出')
    authService.logout()
    setCurrentUser(null)
    setError(null)
  }

  const refreshUser = () => {
    console.log('🔄 手动刷新用户状态')
    const user = authService.getCurrentUser()
    const token = authService.getToken()
    
    console.log('刷新检查:', {
      hasUser: !!user,
      hasToken: !!token,
      userId: user?.id
    })
    
    if (user && token) {
      setCurrentUser(user)
    } else {
      setCurrentUser(null)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const value = {
    // 状态
    currentUser,
    loading,
    error,
    
    // 操作方法
    login,
    register,
    logout,
    refreshUser,
    clearError,
    
    // 计算属性
    isAuthenticated: !!currentUser && authService.isAuthenticated()
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}