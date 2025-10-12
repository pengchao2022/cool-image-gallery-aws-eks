import React, { useContext, useState, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import api from '../services/api.jsx'
import '../App.css'
import './Profile.css'  

const Profile = () => {
  const { currentUser, logout } = useContext(AuthContext)
  const [activeTab, setActiveTab] = useState('info')
  const [userComics, setUserComics] = useState([])
  const [loading, setLoading] = useState(false)
  const [registrationDate, setRegistrationDate] = useState('加载中...')
  const navigate = useNavigate()

  // 获取用户注册时间
  useEffect(() => {
    if (currentUser) {
      fetchRegistrationDate()
    }
  }, [currentUser])

  const fetchRegistrationDate = async () => {
    try {
      console.log('🔄 获取用户注册时间...用户ID:', currentUser.id)
      
      // 直接调用后端API获取注册时间
      const response = await fetch(`/api/user/registration-date/${currentUser.id}`)
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ 注册时间响应:', data)
        
        if (data.created_at) {
          const beijingTime = formatToBeijingTime(data.created_at)
          setRegistrationDate(beijingTime)
          return
        }
      }
      
      // 如果专用API不存在，尝试通用用户信息API
      await tryAlternativeAPI()
      
    } catch (error) {
      console.error('❌ 获取注册时间失败:', error)
      setRegistrationDate('获取失败')
    }
  }

  const tryAlternativeAPI = async () => {
    try {
      const response = await fetch(`/api/users/${currentUser.id}`)
      
      if (response.ok) {
        const userData = await response.json()
        console.log('✅ 用户完整数据:', userData)
        
        // 查找注册时间字段
        if (userData.created_at) {
          const beijingTime = formatToBeijingTime(userData.created_at)
          setRegistrationDate(beijingTime)
        } else {
          setRegistrationDate('时间字段不存在')
        }
      } else {
        setRegistrationDate('API不可用')
      }
    } catch (error) {
      console.error('❌ 备选API也失败:', error)
      setRegistrationDate('网络错误')
    }
  }

  // 时间转换函数
  const formatToBeijingTime = (utcTime) => {
    if (!utcTime) return '未知时间'
    
    try {
      const date = new Date(utcTime)
      
      if (isNaN(date.getTime())) {
        return '无效时间格式'
      }
      
      // 转换为北京时间 (UTC+8)
      const beijingTime = new Date(date.getTime() + 8 * 60 * 60 * 1000)
      return beijingTime.toISOString().split('T')[0]
    } catch (error) {
      console.error('时间转换错误:', error)
      return '时间转换错误'
    }
  }

  // 其他代码保持不变...
  useEffect(() => {
    if (currentUser && activeTab === 'comics') {
      fetchUserComics()
    }
  }, [currentUser, activeTab])

  const fetchUserComics = async () => {
    try {
      setLoading(true)
      setTimeout(() => {
        setUserComics([
          { id: 1, title: "我的第一部漫画", image_url: "https://picsum.photos/300/200?random=10", created_at: new Date().toISOString() },
          { id: 2, title: "奇幻冒险", image_url: "https://picsum.photos/300/200?random=11", created_at: new Date().toISOString() }
        ])
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('获取用户漫画失败:', error)
      setLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/', { replace: true })
  }

  if (!currentUser) {
    return (
      <div className="container" style={{ padding: '50px 0', textAlign: 'center' }}>
        <h2>请先登录</h2>
        <p>您需要登录才能查看个人信息</p>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/')}
        >
          返回首页
        </button>
      </div>
    )
  }

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <div className="profile-header" style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '40px',
        padding: '30px',
        background: 'white',
        borderRadius: '15px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
      }}>
        <div className="user-avatar-large" style={{
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '2.5rem',
          fontWeight: 'bold',
          marginRight: '30px'
        }}>
          {currentUser.username?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <h1 style={{ marginBottom: '10px', color: 'var(--dark)' }}>{currentUser.username}</h1>
          <p style={{ color: '#666', marginBottom: '5px' }}>邮箱: {currentUser.email}</p>
          <p style={{ color: '#666' }}>注册时间: {registrationDate}</p>
        </div>
      </div>

      {/* 其余代码保持不变 */}
      <div className="profile-content" style={{
        display: 'grid',
        gridTemplateColumns: '250px 1fr',
        gap: '30px'
      }}>
        {/* 侧边栏导航 */}
        <div className="profile-sidebar" style={{
          background: 'white',
          borderRadius: '10px',
          padding: '20px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
          height: 'fit-content'
        }}>
          <nav>
            <ul style={{ listStyle: 'none' }}>
              <li style={{ marginBottom: '10px' }}>
                <button
                  onClick={() => setActiveTab('info')}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    textAlign: 'left',
                    background: activeTab === 'info' ? 'var(--primary)' : 'transparent',
                    color: activeTab === 'info' ? 'white' : 'var(--dark)',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  <i className="fas fa-user" style={{ marginRight: '10px' }}></i>
                  个人信息
                </button>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <button
                  onClick={() => setActiveTab('comics')}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    textAlign: 'left',
                    background: activeTab === 'comics' ? 'var(--primary)' : 'transparent',
                    color: activeTab === 'comics' ? 'white' : 'var(--dark)',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  <i className="fas fa-book" style={{ marginRight: '10px' }}></i>
                  我的漫画
                </button>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    textAlign: 'left',
                    background: 'transparent',
                    color: 'var(--danger)',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                >
                  <i className="fas fa-sign-out-alt" style={{ marginRight: '10px' }}></i>
                  退出登录
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* 主要内容区域 */}
        <div className="profile-main" style={{
          background: 'white',
          borderRadius: '10px',
          padding: '30px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
        }}>
          {activeTab === 'info' && (
            <div className="info-tab">
              <h2 style={{ marginBottom: '20px', color: 'var(--primary)' }}>个人信息</h2>
              <div className="info-grid" style={{
                display: 'grid',
                gap: '20px'
              }}>
                <div className="info-item">
                  <label style={{ fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '5px' }}>用户名</label>
                  <p style={{ fontSize: '1.1rem' }}>{currentUser.username}</p>
                </div>
                <div className="info-item">
                  <label style={{ fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '5px' }}>邮箱地址</label>
                  <p style={{ fontSize: '1.1rem' }}>{currentUser.email}</p>
                </div>
                <div className="info-item">
                  <label style={{ fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '5px' }}>用户ID</label>
                  <p style={{ fontSize: '1.1rem' }}>{currentUser.id || 'N/A'}</p>
                </div>
                <div className="info-item">
                  <label style={{ fontWeight: 'bold', color: '#666', display: 'block', marginBottom: '5px' }}>注册时间</label>
                  <p style={{ fontSize: '1.1rem' }}>{registrationDate}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'comics' && (
            <div className="comics-tab">
              <h2 style={{ marginBottom: '20px', color: 'var(--primary)' }}>我的漫画</h2>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>加载中...</p>
                </div>
              ) : userComics.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  <i className="fas fa-book" style={{ fontSize: '3rem', marginBottom: '20px' }}></i>
                  <h3>您还没有上传任何漫画作品</h3>
                  <p>点击右上角的"上传漫画"开始创作吧！</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/upload')}
                    style={{ marginTop: '20px' }}
                  >
                    去上传
                  </button>
                </div>
              ) : (
                <div className="comic-grid" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '20px'
                }}>
                  {userComics.map(comic => (
                    <div key={comic.id} className="comic-card" style={{
                      border: '1px solid #eee',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      transition: 'transform 0.3s'
                    }}>
                      <img 
                        src={comic.image_url} 
                        alt={comic.title} 
                        style={{
                          width: '100%',
                          height: '150px',
                          objectFit: 'cover'
                        }}
                      />
                      <div className="comic-info" style={{ padding: '15px' }}>
                        <div className="comic-title" style={{ 
                          fontWeight: 'bold', 
                          marginBottom: '5px' 
                        }}>
                          {comic.title}
                        </div>
                        <div className="comic-date" style={{ fontSize: '0.8rem', color: '#999' }}>
                          {formatToBeijingTime(comic.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile