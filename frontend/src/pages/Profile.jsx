import React, { useContext, useState, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import api from '../services/api.jsx'
import '../App.css'
import './Profile.css'  

const Profile = () => {
  const { currentUser, logout, token } = useContext(AuthContext)
  const [activeTab, setActiveTab] = useState('info')
  const [userComics, setUserComics] = useState([])
  const [loading, setLoading] = useState(false)
  const [registrationDate, setRegistrationDate] = useState('加载中...')
  const [apiError, setApiError] = useState('')
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
      console.log('🔑 当前用户:', currentUser)
      setApiError('')
      
      // 方法1: 使用你现有的 api 服务（推荐）
      try {
        console.log('🔄 尝试使用 api 服务...')
        const response = await api.get(`/users/registration-date/${currentUser.id}`)
        console.log('✅ api 服务响应:', response.data)
        
        if (response.data.success && response.data.created_at) {
          const beijingTime = formatToBeijingTime(response.data.created_at)
          setRegistrationDate(beijingTime)
          return
        }
      } catch (apiError) {
        console.log('❌ api 服务失败:', apiError)
        // 继续尝试其他方法
      }

      // 方法2: 尝试用户详情 API
      try {
        console.log('🔄 尝试用户详情API...')
        const response = await api.get(`/users/${currentUser.id}`)
        console.log('✅ 用户详情API响应:', response.data)
        
        if (response.data.success && response.data.user && response.data.user.created_at) {
          const beijingTime = formatToBeijingTime(response.data.user.created_at)
          setRegistrationDate(beijingTime)
          return
        }
      } catch (userApiError) {
        console.log('❌ 用户详情API失败:', userApiError)
      }

      // 方法3: 直接查询数据库（通过现有API）
      await tryDatabaseQuery()
      
    } catch (error) {
      console.error('❌ 所有方法都失败:', error)
      setApiError(`获取失败: ${error.message}`)
      setRegistrationDate('获取失败')
    }
  }

  const tryDatabaseQuery = async () => {
    try {
      console.log('🔄 尝试直接数据库查询...')
      
      // 使用你现有的认证API来获取用户信息
      const response = await api.get('/users/profile')
      console.log('✅ 用户profile响应:', response.data)
      
      // 检查返回的用户数据是否包含时间信息
      if (response.data.created_at) {
        const beijingTime = formatToBeijingTime(response.data.created_at)
        setRegistrationDate(beijingTime)
        return
      }
      
      // 如果还是没有时间信息，显示基于用户ID的估算
      setRegistrationDate(estimateRegistrationDate(currentUser.id))
      setApiError('使用估算时间（API未返回注册时间）')
      
    } catch (error) {
      console.error('❌ 数据库查询失败:', error)
      setRegistrationDate(estimateRegistrationDate(currentUser.id))
      setApiError('使用估算时间（API调用失败）')
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

  // 基于用户ID估算注册时间（临时方案）
  const estimateRegistrationDate = (userId) => {
    // 根据你之前查询的数据，用户ID 83 的注册时间是 2025-10-12
    // 我们基于这个来估算
    const baseDate = new Date('2025-10-12') // 用户83的注册时间
    const baseUserId = 83
    
    // 计算时间差（假设用户注册时间大致按ID顺序）
    const daysDiff = (userId - baseUserId) * 1 // 每天注册几个用户
    
    const estimatedDate = new Date(baseDate.getTime() + daysDiff * 24 * 60 * 60 * 1000)
    const beijingTime = new Date(estimatedDate.getTime() + 8 * 60 * 60 * 1000)
    return beijingTime.toISOString().split('T')[0] + ' (估算)'
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
          {apiError && (
            <p style={{ color: 'orange', fontSize: '0.8rem', marginTop: '5px' }}>
              提示: {apiError}
            </p>
          )}
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
                  {apiError && (
                    <p style={{ color: 'orange', fontSize: '0.8rem', marginTop: '5px' }}>
                      提示: {apiError}
                    </p>
                  )}
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