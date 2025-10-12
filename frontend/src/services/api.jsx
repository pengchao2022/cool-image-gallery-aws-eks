// src/services/api.jsx

// 使用 Vite 环境变量，如果没有设置则使用默认值
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// 通用请求函数
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  // 如果是POST、PUT请求且有body，转换为JSON
  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body)
  }

  // 添加认证token - 调试：检查所有可能的token存储位置
  let token = localStorage.getItem('authToken') || localStorage.getItem('token')
  console.log('🔑 使用的Token:', token ? '存在' : '不存在')
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
    console.log('🔑 Token内容:', token.substring(0, 20) + '...')
  } else {
    console.warn('⚠️ 未找到认证token')
  }

  try {
    console.log('📡 发送请求:', url, config.method)
    const response = await fetch(url, config)
    
    console.log('📡 响应状态:', response.status)
    
    // 检查响应状态
    if (!response.ok) {
      // 尝试解析错误信息
      let errorMessage = `请求失败: ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch {
        // 如果响应不是JSON，使用状态文本
        errorMessage = response.statusText || errorMessage
      }
      throw new Error(errorMessage)
    }

    // 处理空响应
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json()
      console.log('✅ 请求成功:', data)
      return data
    } else {
      const text = await response.text()
      console.log('✅ 请求成功:', text)
      return text
    }
  } catch (error) {
    console.error('❌ API请求错误:', error)
    throw error
  }
}

// 上传文件请求
async function uploadRequest(endpoint, formData) {
  const url = `${API_BASE_URL}${endpoint}`
  
  // 调试：检查token
  let token = localStorage.getItem('authToken') || localStorage.getItem('token')
  console.log('📤 上传请求 - Token:', token ? '存在' : '不存在')
  
  const headers = {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  try {
    console.log('📤 开始上传到:', url)
    const response = await fetch(url, {
      method: 'POST',
      headers: headers,
      body: formData,
    })

    console.log('📡 上传响应状态:', response.status)
    
    if (!response.ok) {
      let errorMessage = `上传失败: ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
        console.log('❌ 上传错误详情:', errorData)
      } catch {
        errorMessage = response.statusText || errorMessage
      }
      throw new Error(errorMessage)
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json()
      console.log('✅ 上传成功:', data)
      return data
    } else {
      const text = await response.text()
      console.log('✅ 上传成功:', text)
      return text
    }
  } catch (error) {
    console.error('❌ 上传请求错误:', error)
    throw error
  }
}

// 其余代码保持不变...
export const api = {
  // 认证相关
  auth: {
    login: (email, password) => 
      request('/auth/login', {
        method: 'POST',
        body: { email, password },
      }),
    
    register: (username, email, password) => 
      request('/auth/register', {
        method: 'POST',
        body: { username, email, password },
      }),
    
    getProfile: () => request('/auth/me'),
    
    logout: () => request('/auth/logout'),
  },

  // 漫画相关
  comics: {
    getAll: () => request('/comics'),
    
    getById: (id) => request(`/comics/${id}`),
    
    // 创建漫画（多文件版本）
    createMultiple: (comicData, files) => {
      const formData = new FormData()
      formData.append('title', comicData.title)
      formData.append('description', comicData.description || '')
      files.forEach((file) => {
        formData.append('images', file)
      })
      return uploadRequest('/comics', formData)
    },
    
    update: (id, comicData) => 
      request(`/comics/${id}`, {
        method: 'PUT',
        body: comicData,
      }),
    
    delete: (id) => 
      request(`/comics/${id}`, {
        method: 'DELETE',
      }),
    
    getMyComics: () => request('/comics/my-comics'),
    
    search: (query) => request(`/comics/search?q=${encodeURIComponent(query)}`),
  },

  // 用户相关
  users: {
    getProfile: (userId) => request(`/users/${userId}`),
    
    updateProfile: (userId, userData) => 
      request(`/users/${userId}`, {
        method: 'PUT',
        body: userData,
      }),
    
    getCurrentUser: () => request('/users/profile'),
    
    getRegistrationDate: (userId) => request(`/users/registration-date/${userId}`),
  },

  // 健康检查
  health: {
    check: () => request('/health'),
  },

  // 直接请求方法
  post: (endpoint, data, options = {}) => {
    if (data instanceof FormData) {
      return uploadRequest(endpoint, data)
    } else {
      return request(endpoint, {
        method: 'POST',
        body: data,
        ...options
      })
    }
  },

  get: (endpoint, options = {}) => {
    return request(endpoint, {
      method: 'GET',
      ...options
    })
  },

  put: (endpoint, data, options = {}) => {
    return request(endpoint, {
      method: 'PUT',
      body: data,
      ...options
    })
  },

  delete: (endpoint, options = {}) => {
    return request(endpoint, {
      method: 'DELETE',
      ...options
    })
  },

  uploadRequest: uploadRequest
}

console.log('API Base URL:', API_BASE_URL)
console.log('Environment:', import.meta.env.MODE)

export default api