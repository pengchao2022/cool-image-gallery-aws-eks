import React, { createContext, useState, useEffect } from 'react';
import authService from '../services/auth';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = authService.getToken();
      if (token && authService.isAuthenticated()) {
        // 验证token并获取最新用户信息
        const user = await authService.refreshUserProfile();
        setCurrentUser(user);
      } else {
        // Token无效，清理
        authService.logout();
      }
    } catch (error) {
      console.error('认证初始化失败:', error);
      authService.logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authService.login(email, password);
      setCurrentUser(response.user);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const register = async (username, email, password) => {
    try {
      setError(null);
      const response = await authService.register(username, email, password);
      setCurrentUser(response.user);
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    setError(null);
  };

  const updateUserProfile = async (userData) => {
    try {
      const response = await api.users.updateProfile(currentUser.id, userData);
      const updatedUser = { ...currentUser, ...response.user };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      return response;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      error,
      login,
      register,
      logout,
      updateUserProfile,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};