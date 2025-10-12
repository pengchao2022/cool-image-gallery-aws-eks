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

  // 添加认证token - 注意：你的应用使用 authToken
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, config)
    
    // 检查响应状态
    if (!response.ok) {
      // 尝试解析错误信息
      let errorMessage = `请求失败: ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        // 如果响应不是JSON，使用状态文本
        errorMessage = response.statusText || errorMessage
      }
      throw new Error(errorMessage)
    }

    // 处理空响应
    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    } else {
      return await response.text()
    }
  } catch (error) {
    console.error('API请求错误:', error)
    
    // 如果是网络错误或CORS错误，提供更友好的错误信息
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('网络连接失败，请检查后端服务是否正常运行')
    }
    
    throw error
  }
}

// 上传文件请求
async function uploadRequest(endpoint, formData) {
  const url = `${API_BASE_URL}${endpoint}`
  // 注意：你的应用使用 authToken
  const token = localStorage.getItem('authToken')

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
        // 不要设置 Content-Type，让浏览器自动设置 multipart/form-data
      },
      body: formData,
    })

    if (!response.ok) {
      let errorMessage = `上传失败: ${response.status}`
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorMessage
      } catch {
        errorMessage = response.statusText || errorMessage
      }
      throw new Error(errorMessage)
    }

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return await response.json()
    } else {
      return await response.text()
    }
  } catch (error) {
    console.error('上传请求错误:', error)
    
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('网络连接失败，无法上传文件')
    }
    
    throw error
  }
}

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
    // 获取所有漫画
    getAll: () => request('/comics'),
    
    // 获取单个漫画
    getById: (id) => request(`/comics/${id}`),
    
    // 创建漫画（上传）- 单文件版本
    create: (comicData, imageFile) => {
      const formData = new FormData()
      formData.append('title', comicData.title)
      formData.append('description', comicData.description || '')
      if (imageFile) {
        formData.append('image', imageFile)
      }
      return uploadRequest('/comics', formData)
    },
    
    // 创建漫画（多文件版本）- 与后端路由匹配
    createMultiple: (comicData, files) => {
      const formData = new FormData()
      formData.append('title', comicData.title)
      formData.append('description', comicData.description || '')
      files.forEach((file) => {
        formData.append('images', file) // 字段名必须是 images
      })
      return uploadRequest('/comics', formData)
    },
    
    // 更新漫画
    update: (id, comicData) => 
      request(`/comics/${id}`, {
        method: 'PUT',
        body: comicData,
      }),
    
    // 删除漫画
    delete: (id) => 
      request(`/comics/${id}`, {
        method: 'DELETE',
      }),
    
    // 获取用户自己的漫画
    getMyComics: () => request('/comics/my-comics'),
    
    // 搜索漫画
    search: (query) => request(`/comics/search?q=${encodeURIComponent(query)}`),
  },

  // 用户相关
  users: {
    // 获取用户信息
    getProfile: (userId) => request(`/users/${userId}`),
    
    // 更新用户信息
    updateProfile: (userId, userData) => 
      request(`/users/${userId}`, {
        method: 'PUT',
        body: userData,
      }),
    
    // 获取当前登录用户信息
    getCurrentUser: () => request('/users/profile'),
    
    // 获取用户注册时间
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

  // 导出上传请求函数供直接使用
  uploadRequest: uploadRequest
}

// 添加调试信息
console.log('API Base URL:', API_BASE_URL)
console.log('Environment:', import.meta.env.MODE)

export default api