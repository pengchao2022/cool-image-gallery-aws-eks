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
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const formatToBeijingTime = (utcTime) => {
    if (!utcTime) return '未知时间'
    
    try {
      const date = new Date(utcTime)
      
      if (isNaN(date.getTime())) {
        return '无效时间格式'
      }
      
      const beijingTime = new Date(date.getTime() + 8 * 60 * 60 * 1000)
      return beijingTime.toISOString().split('T')[0]
    } catch (error) {
      return '时间转换错误'
    }
  }

  const getRegistrationDate = () => {
    if (currentUser?.created_at) {
      return formatToBeijingTime(currentUser.created_at)
    }
    return '暂不可用'
  }

  useEffect(() => {
    if (currentUser && activeTab === 'comics') {
      fetchUserComics()
    }
  }, [currentUser, activeTab])

  const handleCardClick = (comicId) => {
    navigate(`/comic/${comicId}`)
  }

  const handleImageClick = (comicId, e) => {
    e.stopPropagation()
    navigate(`/comic/${comicId}`)
  }

  const fetchUserComics = async () => {
    try {
      setLoading(true)
      setError('')
      
      const response = await api.get('/comics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      let responseData = response;
      
      if (response.data !== undefined) {
        responseData = response.data;
      }
      
      if (responseData) {
        let allComics = []
        
        if (responseData.comics && Array.isArray(responseData.comics)) {
          allComics = responseData.comics
        } else if (responseData.data && Array.isArray(responseData.data)) {
          allComics = responseData.data
        } else if (Array.isArray(responseData)) {
          allComics = responseData
        } else {
          allComics = []
        }
        
        const myComics = allComics.filter(comic => (
          comic.user_id === currentUser.id || 
          comic.author_id === currentUser.id ||
          comic.author === currentUser.username
        ))
        
        setUserComics(myComics)
      } else {
        setError('获取漫画数据失败：响应数据为空')
        setUserComics([])
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          logout()
          navigate('/login')
        }
      } else if (error.request) {
        setError('获取漫画数据失败，请检查网络连接')
      } else {
        setError('获取漫画数据失败')
      }
      setUserComics([])
    } finally {
      setLoading(false)
    }
  }

  const getImageUrl = (comic) => {
    if (comic.image_urls) {
      if (Array.isArray(comic.image_urls) && comic.image_urls.length > 0) {
        const firstImageUrl = comic.image_urls[0];
        
        if (firstImageUrl && firstImageUrl.startsWith('/')) {
          return `http://k8s-comicwebsite-3792dbd863-1173649943.us-east-1.elb.amazonaws.com${firstImageUrl}`;
        }
        
        return firstImageUrl;
      } else if (typeof comic.image_urls === 'string') {
        const imageUrl = comic.image_urls;
        
        if (imageUrl.startsWith('/')) {
          return `http://k8s-comicwebsite-3792dbd863-1173649943.us-east-1.elb.amazonaws.com${imageUrl}`;
        }
        
        return imageUrl;
      }
    }
    
    const possibleImageFields = [
      'image_url', 'cover_url', 'coverImage', 'image', 
      'cover', 'thumbnail', 'picture', 'photo',
      'file_url', 'file_path', 'url', 'imageUrl',
      'coverImageUrl', 'thumbnail_url'
    ];
    
    for (const field of possibleImageFields) {
      if (comic[field]) {
        const imageUrl = comic[field];
        
        if (imageUrl.startsWith('/')) {
          return `http://k8s-comicwebsite-3792dbd863-1173649943.us-east-1.elb.amazonaws.com${imageUrl}`;
        }
        
        return imageUrl;
      }
    }
    
    return 'https://placehold.co/300x200/6c5ce7/white?text=No+Image&font=roboto';
  }

  const handleImageError = (e, comic) => {
    e.target.src = 'https://placehold.co/300x200/d63031/white?text=Image+Error&font=roboto';
    e.target.alt = `无法加载图片: ${comic.title}`;
  }

  const handleDeleteComic = async (comicId) => {
    if (!window.confirm('确定要删除这个漫画吗？此操作不可恢复。')) {
      return
    }

    try {
      const response = await api.delete(`/comics/${comicId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (response && response.success) {
        setUserComics(prev => prev.filter(comic => comic.id !== comicId))
        alert('漫画删除成功')
      } else {
        alert('删除失败，请重试')
      }
    } catch (error) {
      alert('删除失败，请检查网络连接')
    }
  }

  const handleEditComic = (comicId) => {
    navigate(`/edit-comic/${comicId}`)
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

  const registrationDate = getRegistrationDate()

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

      <div className="profile-content" style={{
        display: 'grid',
        gridTemplateColumns: '250px 1fr',
        gap: '30px'
      }}>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: 'var(--primary)', margin: 0 }}>我的漫画 ({userComics.length})</h2>
                <button 
                  className="btn btn-primary"
                  onClick={() => navigate('/upload')}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <i className="fas fa-plus"></i>
                  上传新漫画
                </button>
              </div>
              
              {error && (
                <div style={{ 
                  background: '#ffe6e6', 
                  color: '#d63031', 
                  padding: '15px', 
                  borderRadius: '8px', 
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <i className="fas fa-exclamation-triangle"></i>
                  <span>{error}</span>
                </div>
              )}
              
              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--primary)', marginBottom: '15px' }}></i>
                  <p>加载中...</p>
                </div>
              ) : userComics.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                  <i className="fas fa-book" style={{ fontSize: '3rem', marginBottom: '20px', color: '#bdc3c7' }}></i>
                  <h3>您还没有上传任何漫画作品</h3>
                  <p>点击"上传新漫画"按钮开始创作吧！</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/upload')}
                    style={{ marginTop: '20px' }}
                  >
                    <i className="fas fa-plus" style={{ marginRight: '8px' }}></i>
                    上传漫画
                  </button>
                </div>
              ) : (
                <div className="comic-grid" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: '25px'
                }}>
                  {userComics.map(comic => (
                    <div 
                      key={comic.id} 
                      className="comic-card" 
                      onClick={() => handleCardClick(comic.id)}
                      style={{
                        border: '1px solid #eee',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        background: 'white',
                        boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
                        cursor: 'pointer'
                      }}
                    >
                      <img 
                        src={getImageUrl(comic)}
                        alt={comic.title} 
                        onClick={(e) => handleImageClick(comic.id, e)}
                        style={{
                          width: '100%',
                          height: '180px',
                          objectFit: 'cover',
                          cursor: 'pointer'
                        }}
                        onError={(e) => handleImageError(e, comic)}
                      />
                      <div className="comic-info" style={{ padding: '15px' }}>
                        <div className="comic-title" style={{ 
                          fontWeight: 'bold', 
                          marginBottom: '8px',
                          fontSize: '1rem',
                          lineHeight: '1.3',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          lineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {comic.title}
                        </div>
                        <div className="comic-date" style={{ fontSize: '0.8rem', color: '#999', marginBottom: '15px' }}>
                          {formatToBeijingTime(comic.created_at)}
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button 
                            className="btn btn-outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditComic(comic.id);
                            }}
                            style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem' }}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="btn btn-outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteComic(comic.id);
                            }}
                            style={{ 
                              flex: 1, 
                              padding: '8px 12px', 
                              fontSize: '0.8rem',
                              color: 'var(--danger)',
                              borderColor: 'var(--danger)'
                            }}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
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