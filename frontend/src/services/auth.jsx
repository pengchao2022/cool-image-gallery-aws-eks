import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import Header from './components/common/Header.jsx'
import Home from './pages/Home.jsx'
import Browse from './pages/Browse.jsx'
import Profile from './pages/Profile.jsx'
import Upload from './pages/Upload.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import './App.css'

// 保护路由组件 - 修复版本
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken')  // 改为 authToken 以匹配 AuthService
  return token ? children : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
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
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App