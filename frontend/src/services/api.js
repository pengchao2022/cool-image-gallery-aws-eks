import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const comicService = {
  getAllComics: (page = 1, limit = 12) => 
    api.get(`/comics?page=${page}&limit=${limit}`),
  
  getComic: (id) => 
    api.get(`/comics/${id}`),
  
  getUserComics: (page = 1, limit = 12) => 
    api.get(`/comics/my-comics?page=${page}&limit=${limit}`),
  
  uploadComic: (formData) => 
    api.post('/comics', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  deleteComic: (id) => 
    api.delete(`/comics/${id}`),
};

export default api;