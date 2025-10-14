import React, { useContext, useState, useEffect, useRef } from 'react'
import { AuthContext } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import api from '../services/api.jsx'
import '../App.css'
import './Profile.css'  

const Profile = () => {
  const { currentUser, logout, updateUser } = useContext(AuthContext)
  const [activeTab, setActiveTab] = useState('info')
  const [userComics, setUserComics] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showAvatarMenu, setShowAvatarMenu] = useState(false)
  const [avatarLoading, setAvatarLoading] = useState(false)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  // 添加调试日志
  console.log('🔄 Profile组件渲染，showAvatarMenu:', showAvatarMenu, 'currentUser:', currentUser);

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

  // 点击菜单外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAvatarMenu && !event.target.closest('.avatar-container')) {
        setShowAvatarMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showAvatarMenu])

  // 触发文件选择
  const handleUploadClick = () => {
    fileInputRef.current?.click()
    setShowAvatarMenu(false)
  }

  // 处理头像上传 - 修复响应处理问题
  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件 (JPG, PNG, GIF, WebP)')
      return
    }

    // 验证文件大小（限制为2MB）
    if (file.size > 2 * 1024 * 1024) {
      setError('图片大小不能超过2MB')
      return
    }

    // 检查用户ID是否存在 - 关键修复
    if (!currentUser?.id) {
      console.error('❌ 用户ID未定义:', currentUser);
      setError('用户信息不完整，请重新登录')
      return
    }

    try {
      setAvatarLoading(true)
      setError('')

      console.log('📤 开始上传头像文件:', {
        name: file.name,
        type: file.type,
        size: file.size,
        userId: currentUser.id
      });

      const formData = new FormData()
      formData.append('avatar', file)

      // 使用 fetch 而不是 api.put 来避免 axios 的自动处理问题
      const token = localStorage.getItem('token');
      
      console.log('🚀 发送上传请求...');
      const response = await fetch('/api/users/avatar', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
          // 不要设置 Content-Type，让浏览器自动设置 multipart boundary
        },
        body: formData
      });

      console.log('📥 收到响应，状态:', response.status);
      
      // 解析响应数据
      const result = await response.json();
      console.log('📊 响应数据:', result);

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      // 关键修复：检查响应结构
      if (result && result.success) {
        console.log('✅ 头像上传成功:', result.avatarUrl);
        
        // 更新用户信息
        const updatedUser = { 
          ...currentUser, 
          avatar: result.avatarUrl 
        };
        updateUser(updatedUser);
        
        // 更新本地存储的用户信息（如果有）
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          userData.avatar = result.avatarUrl;
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        alert('头像更新成功！');
      } else {
        // 如果后端返回了数据但没有 success: true
        const errorMsg = result.message || '头像上传失败：服务器返回错误';
        console.error('❌ 服务器返回错误:', result);
        setError(errorMsg);
      }
    } catch (error) {
      console.error('❌ 头像上传失败:', error);
      
      // 更详细的错误处理
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        setError('网络连接失败，请检查网络设置');
      } else if (error.response) {
        // 如果是 axios 错误（如果仍然使用 api.put）
        const status = error.response.status;
        if (status === 502) {
          setError('服务器暂时不可用，请稍后重试 (502 Bad Gateway)');
        } else if (status === 413) {
          setError('文件太大，请选择小于2MB的图片');
        } else if (status === 415) {
          setError('不支持的图片格式');
        } else if (status === 500) {
          setError('服务器内部错误，请稍后重试');
        } else {
          setError(`上传失败: ${error.response.data?.message || '未知错误'}`);
        }
      } else {
        // 其他错误
        setError(`上传失败: ${error.message || '请重试'}`);
      }
    } finally {
      setAvatarLoading(false);
      // 清空文件输入
      event.target.value = '';
    }
  }

  // 移除头像 - 添加用户ID检查
  const handleRemoveAvatar = async () => {
    // 检查用户ID是否存在
    if (!currentUser?.id) {
      setError('用户信息不完整，请重新登录');
      return;
    }

    try {
      setAvatarLoading(true);
      
      // 使用 fetch 而不是 api.delete
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/avatar', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const result = await response.json();
      console.log('🗑️ 移除头像响应:', result);

      if (!response.ok) {
        throw new Error(result.message || `HTTP error! status: ${response.status}`);
      }

      if (result && result.success) {
        // 更新用户信息，移除头像
        const updatedUser = { ...currentUser };
        delete updatedUser.avatar;
        updateUser(updatedUser);
        
        // 更新本地存储
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          delete userData.avatar;
          localStorage.setItem('user', JSON.stringify(userData));
        }
        
        setShowAvatarMenu(false);
        alert('头像已移除');
      } else {
        setError(result.message || '移除头像失败');
      }
    } catch (error) {
      console.error('移除头像失败:', error);
      setError(error.message || '移除头像失败，请重试');
    } finally {
      setAvatarLoading(false);
    }
  }

  useEffect(() => {
    if (currentUser && activeTab === 'comics') {
      fetchUserComics();
    }
  }, [currentUser, activeTab]);

  const handleCardClick = (comicId) => {
    navigate(`/comic/${comicId}`);
  }

  const handleImageClick = (comicId, e) => {
    e.stopPropagation();
    navigate(`/comic/${comicId}`);
  }

  const fetchUserComics = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await api.get('/comics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      let responseData = response;
      
      if (response.data !== undefined) {
        responseData = response.data;
      }
      
      if (responseData) {
        let allComics = [];
        
        if (responseData.comics && Array.isArray(responseData.comics)) {
          allComics = responseData.comics;
        } else if (responseData.data && Array.isArray(responseData.data)) {
          allComics = responseData.data;
        } else if (Array.isArray(responseData)) {
          allComics = responseData;
        } else {
          allComics = [];
        }
        
        const myComics = allComics.filter(comic => (
          comic.user_id === currentUser.id || 
          comic.author_id === currentUser.id ||
          comic.author === currentUser.username
        ));
        
        setUserComics(myComics);
      } else {
        setError('获取漫画数据失败：响应数据为空');
        setUserComics([]);
      }
    } catch (error) {
      if (error.response) {
        if (error.response.status === 401) {
          logout();
          navigate('/login');
        }
      } else if (error.request) {
        setError('获取漫画数据失败，请检查网络连接');
      } else {
        setError('获取漫画数据失败');
      }
      setUserComics([]);
    } finally {
      setLoading(false);
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
      return;
    }

    try {
      const response = await api.delete(`/comics/${comicId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response && response.success) {
        setUserComics(prev => prev.filter(comic => comic.id !== comicId));
        alert('漫画删除成功');
      } else {
        alert('删除失败，请重试');
      }
    } catch (error) {
      alert('删除失败，请检查网络连接');
    }
  }

  const handleEditComic = (comicId) => {
    navigate(`/edit-comic/${comicId}`);
  }

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
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
    );
  }

  const registrationDate = getRegistrationDate();

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
        {/* 头像容器 - 添加点击功能 */}
        <div className="avatar-container" style={{ position: 'relative', marginRight: '30px' }}>
          <div 
            className="user-avatar-large"
            onClick={(e) => {
              console.log('🎯 头像被点击了！内联事件');
              e.stopPropagation();
              e.preventDefault();
              setShowAvatarMenu(prev => {
                const newState = !prev;
                console.log('🎯 设置新状态:', newState);
                return newState;
              });
            }}
            style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              backgroundColor: currentUser.avatar ? 'transparent' : 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '2.5rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              border: currentUser.avatar ? '3px solid var(--primary)' : 'none',
              overflow: 'hidden',
              position: 'relative',
              zIndex: 10,
              transition: 'all 0.3s ease',
              transform: showAvatarMenu ? 'scale(1.05)' : 'scale(1)',
              boxShadow: showAvatarMenu ? '0 4px 12px rgba(0,0,0,0.2)' : 'none'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              if (!showAvatarMenu) {
                e.target.style.transform = 'scale(1)';
                e.target.style.boxShadow = 'none';
              }
            }}
          >
            {currentUser.avatar ? (
              <img 
                src={currentUser.avatar} 
                alt="用户头像" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            ) : null}
            {!currentUser.avatar && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%'
              }}>
                {currentUser.username?.[0]?.toUpperCase() || 'U'}
              </div>
            )}
            
            {/* 加载指示器 */}
            {avatarLoading && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%'
              }}>
                <i className="fas fa-spinner fa-spin" style={{ color: 'white', fontSize: '1.5rem' }}></i>
              </div>
            )}
          </div>

          {/* 头像菜单 - 添加调试信息 */}
          {(() => {
            console.log('🔄 检查菜单渲染，showAvatarMenu:', showAvatarMenu);
            return showAvatarMenu && (
              <div style={{
                position: 'absolute',
                top: '110%',
                left: 0,
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                padding: '8px 0',
                minWidth: '150px',
                zIndex: 1000,
                border: '1px solid #eee',
                animation: 'fadeIn 0.2s ease'
              }}>
                <button
                  onClick={(e) => {
                    console.log('📤 点击上传头像');
                    e.stopPropagation();
                    handleUploadClick();
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    textAlign: 'left',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    color: '#333',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  <i className="fas fa-upload"></i>
                  上传头像
                </button>
                
                {currentUser.avatar && (
                  <button
                    onClick={(e) => {
                      console.log('🗑️ 点击移除头像');
                      e.stopPropagation();
                      handleRemoveAvatar();
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 16px',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      color: 'var(--danger)',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f9fa'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                  >
                    <i className="fas fa-trash"></i>
                    移除头像
                  </button>
                )}
              </div>
            );
          })()}

          {/* 隐藏的文件输入 */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarUpload}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </div>

        <div>
          <h1 style={{ marginBottom: '10px', color: 'var(--dark)' }}>{currentUser.username}</h1>
          <p style={{ color: '#666', marginBottom: '5px' }}>邮箱: {currentUser.email}</p>
          <p style={{ color: '#666' }}>注册时间: {registrationDate}</p>
          {/* 显示用户ID用于调试 */}
          <p style={{ color: '#999', fontSize: '0.8rem' }}>用户ID: {currentUser.id || '未定义'}</p>
        </div>
      </div>

      {/* 错误提示和加载状态 */}
      {error && (
        <div style={{ 
          background: '#ffe6e6', 
          color: '#d63031', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeIn 0.3s ease'
        }}>
          <i className="fas fa-exclamation-triangle"></i>
          <span>{error}</span>
          <button 
            onClick={() => setError('')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#d63031', 
              cursor: 'pointer',
              marginLeft: 'auto'
            }}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {avatarLoading && (
        <div style={{ 
          background: '#e3f2fd', 
          color: '#1976d2', 
          padding: '15px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeIn 0.3s ease'
        }}>
          <i className="fas fa-spinner fa-spin"></i>
          <span>正在上传头像，请稍候...</span>
        </div>
      )}

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
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== 'info') {
                      e.target.style.backgroundColor = '#f8f9fa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== 'info') {
                      e.target.style.backgroundColor = 'transparent';
                    }
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
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (activeTab !== 'comics') {
                      e.target.style.backgroundColor = '#f8f9fa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== 'comics') {
                      e.target.style.backgroundColor = 'transparent';
                    }
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
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#ffe6e6'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
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
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-5px)';
                        e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 3px 10px rgba(0,0,0,0.1)';
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
  );
}

export default Profile;