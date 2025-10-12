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
  const [userDetails, setUserDetails] = useState(null)
  const navigate = useNavigate()

  // 调试：打印 currentUser 内容
  useEffect(() => {
    console.log('🔍 currentUser 对象:', currentUser)
    if (currentUser) {
      console.log('📋 currentUser 所有属性:', Object.keys(currentUser))
      console.log('⏰ 注册时间字段:', currentUser.created_at || '未找到')
    }
  }, [currentUser])

  // 时间转换函数 - UTC 转北京时间
  const formatToBeijingTime = (utcTime) => {
    if (!utcTime) {
      return '未知时间'
    }
    
    try {
      const date = new Date(utcTime)
      
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        return '无效时间格式'
      }
      
      // 转换为北京时间 (UTC+8)
      const beijingTime = new Date(date.getTime() + 8 * 60 * 60 * 1000)
      // 格式化为 YYYY-MM-DD
      return beijingTime.toISOString().split('T')[0]
    } catch (error) {
      console.error('时间转换错误:', error)
      return '时间转换错误'
    }
  }

  // 获取注册时间的函数
  const getRegistrationDate = () => {
    // 首先尝试从 userDetails 获取
    if (userDetails?.created_at) {
      return formatToBeijingTime(userDetails.created_at)
    }
    
    // 然后尝试从 currentUser 获取
    if (currentUser?.created_at) {
      return formatToBeijingTime(currentUser.created_at)
    }
    
    // 如果都没有，尝试其他可能的字段名
    const possibleDateFields = ['registrationDate', 'createdAt', 'join_date', 'registered_at', 'created']
    for (const field of possibleDateFields) {
      if (currentUser?.[field]) {
        console.log(`✅ 找到注册时间字段: ${field}`, currentUser[field])
        return formatToBeijingTime(currentUser[field])
      }
    }
    
    // 如果还是找不到，显示提示信息
    return '注册时间暂不可用'
  }

  // 获取用户详细信息
  useEffect(() => {
    if (currentUser) {
      fetchUserDetails()
    }
  }, [currentUser])

  const fetchUserDetails = async () => {
    try {
      console.log('🔄 尝试获取用户详情...')
      // 尝试从 API 获取用户详细信息
      const response = await api.get(`/users/${currentUser.id}`)
      console.log('✅ 用户详情响应:', response.data)
      setUserDetails(response.data)
    } catch (error) {
      console.error('❌ 获取用户详情失败:', error)
      // 如果 API 不可用，使用当前用户信息
      setUserDetails(currentUser)
    }
  }

  useEffect(() => {
    if (currentUser && activeTab === 'comics') {
      fetchUserComics()
    }
  }, [currentUser, activeTab])

  const fetchUserComics = async () => {
    try {
      setLoading(true)
      // 模拟获取用户漫画数据
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
    navigate('/', { replace: true }) // 退出后重定向到首页
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

  // 获取显示的注册时间
  const displayRegistrationDate = getRegistrationDate()

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
          <p style={{ color: '#666' }}>注册时间: {displayRegistrationDate}</p>
        </div>
      </div>

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
                  onClick={handleLogout} // 使用新的退出处理函数
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
                  <p style={{ fontSize: '1.1rem' }}>{displayRegistrationDate}</p>
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