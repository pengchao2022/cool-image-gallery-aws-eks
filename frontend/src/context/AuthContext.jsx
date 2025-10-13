import React, { createContext, useState, useEffect } from 'react'
import authService from '../services/auth.jsx'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      const token = authService.getToken()
      const user = authService.getCurrentUser()
      
      console.log('🔐 AuthContext 初始化:', {
        hasToken: !!token,
        hasUser: !!user,
        token: token ? `存在 (${token.length} 字符)` : '不存在',
        user: user
      })
      
      if (user && token) {
        console.log('✅ 从 authService 恢复用户:', user)
        setCurrentUser(user)
      } else {
        console.log('❌ 没有有效的用户数据，清除可能存在的无效数据')
        // 清除可能存在的无效数据
        if (token && !user) {
          console.log('⚠️  有 token 但没有用户信息，清除数据')
          authService.logout()
        }
        setCurrentUser(null)
      }
    } catch (error) {
      console.error('❌ 认证初始化失败:', error)
      authService.logout()
      setCurrentUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setError(null)
      console.log('🔐 开始登录...')
      const response = await authService.login(email, password)
      console.log('✅ 登录成功，用户:', response.user)
      setCurrentUser(response.user)
      return response
    } catch (error) {
      console.error('❌ 登录失败:', error)
      setError(error.message)
      throw error
    }
  }

  const register = async (username, email, password) => {
    try {
      setError(null)
      console.log('🔐 开始注册...')
      const response = await authService.register(username, email, password)
      console.log('✅ 注册成功，用户:', response.user)
      setCurrentUser(response.user)
      return response
    } catch (error) {
      console.error('❌ 注册失败:', error)
      setError(error.message)
      throw error
    }
  }

  const logout = () => {
    console.log('🔐 用户登出')
    authService.logout()
    setCurrentUser(null)
    setError(null)
  }

  // 添加手动刷新用户状态的函数
  const refreshUser = () => {
    console.log('🔄 手动刷新用户状态')
    initializeAuth()
  }

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    refreshUser  // 添加这个函数
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}