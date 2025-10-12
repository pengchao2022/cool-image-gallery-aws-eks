import React, { useContext, useState, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import api from '../services/api.jsx'
import '../App.css'

const Profile = () => {
  const { currentUser, logout } = useContext(AuthContext)
  const [activeTab, setActiveTab] = useState('info')
  const [userComics, setUserComics] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

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
          <p style={{ color: '#666' }}>注册用户</p>
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
                  onClick={logout}
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
                  <p style={{ fontSize: '1.1rem' }}>{currentUser.registrationDate || '2024-01-01'}</p>
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
                <div className="comic-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                  {userComics.map(comic => (
                    <div key={comic.id} className="comic-card">
                      <img 
                        src={comic.image_url} 
                        alt={comic.title} 
                        className="comic-image"
                      />
                      <div className="comic-info">
                        <div className="comic-title">{comic.title}</div>
                        <div className="comic-date" style={{ fontSize: '0.8rem', color: '#999' }}>
                          {new Date(comic.created_at).toLocaleDateString()}
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