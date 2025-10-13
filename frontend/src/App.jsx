import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import Header from './components/common/Header.jsx'
import Footer from './components/common/Footer.jsx'  // 导入 Footer 组件
import Home from './pages/Home.jsx'
import Browse from './pages/Browse.jsx'
import Profile from './pages/Profile.jsx'
import Upload from './pages/Upload.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import AuthError from './pages/AuthError.jsx'  // 导入新的认证错误页面
import './App.css'

// 修复的 ProtectedRoute 组件
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    console.log('🛡️ ProtectedRoute 检查: token =', token)
    setIsAuthenticated(!!token)
  }, [])

  if (isAuthenticated === null) {
    return <div>Loading...</div>
  }

  console.log('🛡️ ProtectedRoute 结果:', isAuthenticated ? '允许访问' : '重定向到登录')
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Header />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* 公开路由 */}
              <Route path="/" element={<Home />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* 错误页面路由 - 公开访问 */}
              <Route path="/auth-error" element={<AuthError />} />
              <Route path="/upload-error" element={<UploadError />} />
              
              {/* 受保护的路由 */}
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/upload" 
                element={
                  <ProtectedRoute>
                    <Upload />
                  </ProtectedRoute>
                } 
              />
              
              {/* 404 路由 */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />  {/* 使用 Footer 组件 */}
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App