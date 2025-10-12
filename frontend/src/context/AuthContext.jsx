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
      const user = authService.getCurrentUser()
      const token = authService.getToken()
      
      if (user && token) {
        setCurrentUser(user)
      }
    } catch (error) {
      console.error('认证初始化失败:', error)
      authService.logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setError(null)
      const response = await authService.login(email, password)
      setCurrentUser(response.user)
      return response
    } catch (error) {
      setError(error.message)
      throw error
    }
  }

  const register = async (username, email, password) => {
    try {
      setError(null)
      const response = await authService.register(username, email, password)
      setCurrentUser(response.user)
      return response
    } catch (error) {
      setError(error.message)
      throw error
    }
  }

  const logout = () => {
    authService.logout()
    setCurrentUser(null)
    setError(null)
  }

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      error,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}