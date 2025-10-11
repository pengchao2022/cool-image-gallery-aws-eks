import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Header from './components/common/Header';
import Home from './pages/Home';
import Browse from './pages/Browse';
import Profile from './pages/Profile';
import Upload from './pages/Upload';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

// 保护路由组件 - 需要登录才能访问
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

// 公开路由组件 - 已登录用户不能访问
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return !token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main>
            <Routes>
              {/* 首页 - 所有人都可以访问 */}
              <Route path="/" element={<Home />} />
              
              {/* 浏览页面 - 所有人都可以访问 */}
              <Route path="/browse" element={<Browse />} />
              
              {/* 登录/注册页面 - 只有未登录用户可以访问 */}
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              <Route path="/register" element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              } />
              
              {/* 需要登录的页面 */}
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/upload" element={
                <ProtectedRoute>
                  <Upload />
                </ProtectedRoute>
              } />
              
              {/* 404 页面 */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;