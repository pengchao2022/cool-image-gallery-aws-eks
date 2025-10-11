// src/services/auth.js
import api from './api';

class AuthService {
  async login(email, password) {
    try {
      const response = await api.auth.login(email, password);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      this.logout(); // 登录失败时清理
      throw error;
    }
  }

  async register(username, email, password) {
    try {
      const response = await api.auth.register(username, email, password);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('currentUser', JSON.stringify(response.user));
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  logout() {
    // 直接清理本地存储，不调用API（除非后端需要）
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  }

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('currentUser');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('解析用户数据失败:', error);
      return null;
    }
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}

export default new AuthService();