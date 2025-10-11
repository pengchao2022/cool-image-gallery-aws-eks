// src/services/auth.js
import api from './api';

class AuthService {
  async login(email, password) {
    try {
      const response = await api.auth.login(email, password);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        // 存储用户信息
        if (response.user) {
          localStorage.setItem('currentUser', JSON.stringify(response.user));
        }
      }
      
      return response;
    } catch (error) {
      // 清理无效的token
      if (error.message.includes('401') || error.message.includes('Token')) {
        this.logout();
      }
      throw error;
    }
  }

  async register(username, email, password) {
    try {
      const response = await api.auth.register(username, email, password);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        if (response.user) {
          localStorage.setItem('currentUser', JSON.stringify(response.user));
        }
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  async logout() {
    try {
      // 调用后端logout（如果有的话）
      await api.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // 无论如何都清理本地存储
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
    }
  }

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('currentUser');
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      this.logout();
    }
    return null;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;
    
    // 简单的token验证（在实际应用中可能需要解析JWT检查过期时间）
    try {
      // 如果是JWT token，可以解析检查过期时间
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      // 如果不是JWT或者解析失败，只检查是否存在
      return !!token;
    }
  }

  async refreshUserProfile() {
    try {
      const response = await api.auth.getProfile();
      if (response.user) {
        localStorage.setItem('currentUser', JSON.stringify(response.user));
        return response.user;
      }
    } catch (error) {
      console.error('刷新用户信息失败:', error);
      throw error;
    }
  }
}

export default new AuthService();