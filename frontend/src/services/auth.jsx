import api from './api.jsx'

class AuthService {
  async login(email, password) {
    try {
      const response = await api.auth.login(email, password)
      
      if (response.token) {
        localStorage.setItem('authToken', response.token)  // 改为 authToken
        localStorage.setItem('user', JSON.stringify(response.user))  // 改为 user
      }
      
      return response
    } catch (error) {
      this.logout()
      throw error
    }
  }

  async register(username, email, password) {
    try {
      const response = await api.auth.register(username, email, password)
      
      if (response.token) {
        localStorage.setItem('authToken', response.token)  // 改为 authToken
        localStorage.setItem('user', JSON.stringify(response.user))  // 改为 user
      }
      
      return response
    } catch (error) {
      throw error
    }
  }

  logout() {
    localStorage.removeItem('authToken')  // 改为 authToken
    localStorage.removeItem('user')       // 改为 user
  }

  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user')  // 改为 user
      return userStr ? JSON.parse(userStr) : null
    } catch (error) {
      console.error('解析用户数据失败:', error)
      return null
    }
  }

  getToken() {
    return localStorage.getItem('authToken')  // 改为 authToken
  }

  isAuthenticated() {
    return !!this.getToken()
  }
}

export default new AuthService()