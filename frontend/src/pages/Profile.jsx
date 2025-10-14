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

  // 时间转换函数 - UTC 转北京时间
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

  // 获取注册时间 - 从 currentUser 中获取
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

  // 处理卡片点击 - 跳转到漫画详情页
  const handleCardClick = (comicId) => {
    console.log(`🖱️ 点击漫画卡片ID: ${comicId}`)
    navigate(`/comic/${comicId}`)
  }

  // 处理图片点击 - 跳转到漫画详情页
  const handleImageClick = (comicId, e) => {
    e.stopPropagation() // 防止事件冒泡
    console.log(`🖱️ 点击漫画图片ID: ${comicId}`)
    navigate(`/comic/${comicId}`)
  }

  // 修复：从后端 API 获取所有漫画，然后过滤出当前用户的漫画
  const fetchUserComics = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('🔄 开始获取用户漫画...')
      console.log('👤 当前用户ID:', currentUser.id)
      
      // 调用 API 获取所有漫画
      const response = await api.get('/comics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      console.log('📡 完整响应对象:', response)
      
      // 修复：直接使用 response 对象，因为 response 本身就是数据
      let responseData = response;
      
      // 如果 response 有 data 属性，使用 data
      if (response.data !== undefined) {
        responseData = response.data;
        console.log('📡 使用 response.data:', responseData)
      } else {
        console.log('📡 直接使用 response 对象:', responseData)
      }
      
      if (responseData) {
        console.log('✅ 成功获取到响应数据')
        
        // 检查不同的可能数据结构
        let allComics = []
        
        if (responseData.comics && Array.isArray(responseData.comics)) {
          // 结构: {success: true, comics: [...]}
          allComics = responseData.comics
          console.log('📚 从 comics 字段获取漫画数据:', allComics)
          
          // 调试：查看第一个漫画的完整结构
          if (allComics.length > 0) {
            console.log('🔍 第一个漫画的完整数据结构:', allComics[0])
            console.log('🔍 第一个漫画的所有字段:', Object.keys(allComics[0]))
          }
        } else if (responseData.data && Array.isArray(responseData.data)) {
          // 结构: {success: true, data: [...]}
          allComics = responseData.data
          console.log('📚 从 data 字段获取漫画数据:', allComics)
        } else if (Array.isArray(responseData)) {
          // 结构: 直接返回数组
          allComics = responseData
          console.log('📚 直接获取漫画数据:', allComics)
        } else {
          console.warn('⚠️ 未知的响应结构:', responseData)
          allComics = []
        }
        
        console.log('📖 所有漫画列表:', allComics)
        
        // 过滤出当前用户的漫画
        const myComics = allComics.filter(comic => {
          console.log(`🔍 检查漫画: ${comic.title}, 用户ID: ${comic.user_id}, 当前用户ID: ${currentUser.id}`)
          const isUserComic = (
            comic.user_id === currentUser.id || 
            comic.author_id === currentUser.id ||
            comic.author === currentUser.username
          )
          console.log(`✅ 是否属于当前用户: ${isUserComic}`)
          return isUserComic
        })
        
        console.log('🎯 过滤后的用户漫画:', myComics)
        setUserComics(myComics)
      } else {
        console.error('❌ 响应数据为空:', response)
        setError('获取漫画数据失败：响应数据为空')
        setUserComics([])
      }
    } catch (error) {
      console.error('❌ 获取用户漫画失败:', error)
      
      if (error.response) {
        console.error('📡 错误状态:', error.response.status)
        console.error('📄 错误数据:', error.response.data)
        console.error('🔗 请求URL:', error.response.config?.url)
      } else if (error.request) {
        console.error('📡 网络错误，无响应:', error.request)
      } else {
        console.error('📡 其他错误:', error.message)
      }
      
      setError('获取漫画数据失败，请检查网络连接')
      setUserComics([])
      
      // 如果是 401 未授权，可能是 token 过期，强制登出
      if (error.response && error.response.status === 401) {
        logout()
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  // 获取图片URL - 修复图片显示问题
  const getImageUrl = (comic) => {
    console.log(`🔍 漫画 "${comic.title}" 的所有字段:`, Object.keys(comic));
    console.log(`🔍 漫画 "${comic.title}" 的完整数据:`, comic);
    
    // 检查 image_urls 字段（复数形式）
    if (comic.image_urls) {
      console.log(`✅ 找到 image_urls 字段:`, comic.image_urls);
      
      // 如果 image_urls 是数组，取第一个图片
      if (Array.isArray(comic.image_urls) && comic.image_urls.length > 0) {
        const firstImageUrl = comic.image_urls[0];
        console.log(`🖼️ 使用数组中的第一个图片:`, firstImageUrl);
        
        // 如果URL是相对路径，添加基础URL
        if (firstImageUrl && firstImageUrl.startsWith('/')) {
          const fullUrl = `http://k8s-comicwebsite-3792dbd863-1173649943.us-east-1.elb.amazonaws.com${firstImageUrl}`;
          console.log(`🖼️ 完整图片URL:`, fullUrl);
          return fullUrl;
        }
        
        return firstImageUrl;
      } 
      // 如果 image_urls 是字符串，直接使用
      else if (typeof comic.image_urls === 'string') {
        const imageUrl = comic.image_urls;
        console.log(`🖼️ image_urls 是字符串:`, imageUrl);
        
        // 如果URL是相对路径，添加基础URL
        if (imageUrl.startsWith('/')) {
          const fullUrl = `http://k8s-comicwebsite-3792dbd863-1173649943.us-east-1.elb.amazonaws.com${imageUrl}`;
          console.log(`🖼️ 完整图片URL:`, fullUrl);
          return fullUrl;
        }
        
        return imageUrl;
      }
    }
    
    // 检查其他可能的图片URL字段
    const possibleImageFields = [
      'image_url', 'cover_url', 'coverImage', 'image', 
      'cover', 'thumbnail', 'picture', 'photo',
      'file_url', 'file_path', 'url', 'imageUrl',
      'coverImageUrl', 'thumbnail_url'
    ];
    
    for (const field of possibleImageFields) {
      if (comic[field]) {
        console.log(`✅ 找到图片字段 "${field}":`, comic[field]);
        const imageUrl = comic[field];
        
        // 如果URL是相对路径，添加基础URL
        if (imageUrl.startsWith('/')) {
          const fullUrl = `http://k8s-comicwebsite-3792dbd863-1173649943.us-east-1.elb.amazonaws.com${imageUrl}`;
          console.log(`🖼️ 完整图片URL:`, fullUrl);
          return fullUrl;
        }
        
        console.log(`🖼️ 图片URL:`, imageUrl);
        return imageUrl;
      }
    }
    
    console.warn(`⚠️ 漫画 "${comic.title}" 没有找到图片URL字段`);
    
    // 如果没有图片，使用默认的占位图
    return 'https://placehold.co/300x200/6c5ce7/white?text=No+Image&font=roboto';
  }

  // 处理图片加载错误
  const handleImageError = (e, comic) => {
    console.error(`❌ 图片加载失败: ${comic.title}`, e);
    e.target.src = 'https://placehold.co/300x200/d63031/white?text=Image+Error&font=roboto';
    e.target.alt = `无法加载图片: ${comic.title}`;
  }

  // 处理漫画删除
  const handleDeleteComic = async (comicId) => {
    if (!window.confirm('确定要删除这个漫画吗？此操作不可恢复。')) {
      return
    }

    try {
      console.log('🗑️ 开始删除漫画:', comicId)
      
      const response = await api.delete(`/comics/${comicId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      console.log('✅ 删除响应:', response)

      if (response && response.success) {
        // 从列表中移除已删除的漫画
        setUserComics(prev => prev.filter(comic => comic.id !== comicId))
        alert('漫画删除成功')
      } else {
        alert('删除失败，请重试')
      }
    } catch (error) {
      console.error('❌ 删除漫画失败:', error)
      if (error.response) {
        console.error('📡 删除错误状态:', error.response.status)
        console.error('📄 删除错误数据:', error.response.data)
        console.error('🔗 删除请求URL:', error.response.config?.url)
      }
      alert('删除失败，请检查网络连接')
    }
  }

  // 处理漫画编辑
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
                        cursor: 'pointer' // 添加指针光标
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
                          cursor: 'pointer' // 图片也添加指针光标
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
                              e.stopPropagation(); // 防止事件冒泡
                              handleEditComic(comic.id);
                            }}
                            style={{ flex: 1, padding: '8px 12px', fontSize: '0.8rem' }}
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="btn btn-outline"
                            onClick={(e) => {
                              e.stopPropagation(); // 防止事件冒泡
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