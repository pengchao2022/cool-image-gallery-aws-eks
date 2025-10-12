const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

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

  // 添加认证token
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  try {
    const response = await fetch(url, config)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || `请求失败: ${response.status}`)
    }

    return data
  } catch (error) {
    console.error('API请求错误:', error)
    throw error
  }
}

// 上传文件请求
async function uploadRequest(endpoint, formData) {
  const url = `${API_BASE_URL}${endpoint}`
  const token = localStorage.getItem('token')

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || '上传失败')
    }

    return data
  } catch (error) {
    console.error('上传请求错误:', error)
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
  },

  // 漫画相关
  comics: {
    getAll: () => request('/comics'),
    
    getById: (id) => request(`/comics/${id}`),
    
    create: (comicData, imageFile) => {
      const formData = new FormData()
      formData.append('title', comicData.title)
      formData.append('description', comicData.description || '')
      if (imageFile) {
        formData.append('image', imageFile)
      }
      return uploadRequest('/comics', formData)
    },
    
    getMyComics: () => request('/comics/my'),
    
    getUserComics: (userId) => request(`/comics/user/${userId}`),
  },

  // 用户相关
  users: {
    getProfile: (userId) => request(`/users/${userId}`),
    
    updateProfile: (userId, userData) => 
      request(`/users/${userId}`, {
        method: 'PUT',
        body: userData,
      }),
  },
}

export default api