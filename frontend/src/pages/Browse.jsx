import React, { useContext, useState, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import api from '../services/api.jsx'
import '../App.css'

const Browse = () => {
  const { currentUser } = useContext(AuthContext)
  const [comics, setComics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchComics()
  }, [])

  const fetchComics = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 调用真实的 API 获取漫画数据
      const response = await fetch('/api/comics')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setComics(data.comics)
        console.log('✅ 成功加载漫画数据:', data.comics.length, '个漫画')
      } else {
        throw new Error(data.message || '获取漫画数据失败')
      }
    } catch (error) {
      console.error('❌ 获取漫画列表失败:', error)
      setError('加载漫画失败，请刷新页面重试')
    } finally {
      setLoading(false)
    }
  }

  // 处理图片加载失败
  const handleImageError = (e, comic) => {
    console.log(`❌ 图片加载失败: ${comic.title}`, e.target.src)
    e.target.style.display = 'none'
    // 可以在这里设置一个默认的占位图片
  }

  // 处理图片加载成功
  const handleImageLoad = (e, comic) => {
    console.log(`✅ 图片加载成功: ${comic.title}`)
  }

  return (
    <div>
      {/* 英雄区域 */}
      <section className="hero">
        <div className="container">
          <h1>浏览漫画作品</h1>
          <p>发现社区中的精彩创作，支持您喜欢的漫画家</p>
          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {currentUser && (
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/upload')}
              >
                上传我的作品
              </button>
            )}
            <button className="btn btn-outline" onClick={fetchComics}>
              刷新作品
            </button>
          </div>
        </div>
      </section>

      {/* 漫画展示区域 */}
      <section className="container" style={{ padding: '40px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>所有漫画作品</h2>
          <span style={{ color: '#666' }}>共 {comics.length} 部作品</span>
        </div>
        
        {error && (
          <div style={{ textAlign: 'center', padding: '30px', color: '#e74c3c' }}>
            <i className="fas fa-exclamation-triangle" style={{ fontSize: '2rem', marginBottom: '15px' }}></i>
            <p>{error}</p>
            <button className="btn btn-primary" onClick={fetchComics} style={{ marginTop: '15px' }}>
              重试
            </button>
          </div>
        )}
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--primary)' }}></i>
            <p style={{ marginTop: '20px' }}>加载中...</p>
          </div>
        ) : comics.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
            <i className="fas fa-book" style={{ fontSize: '3rem', marginBottom: '20px' }}></i>
            <h3>暂无漫画作品</h3>
            <p>成为第一个上传漫画的用户吧！</p>
            {!currentUser ? (
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/register')}
                style={{ marginTop: '20px' }}
              >
                立即注册
              </button>
            ) : (
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/upload')}
                style={{ marginTop: '20px' }}
              >
                上传作品
              </button>
            )}
          </div>
        ) : (
          <div className="comic-grid">
            {comics.map(comic => (
              <div key={comic.id} className="comic-card">
                <img 
                  src={comic.image_urls && comic.image_urls[0]} 
                  alt={comic.title} 
                  className="comic-image"
                  onError={(e) => handleImageError(e, comic)}
                  onLoad={(e) => handleImageLoad(e, comic)}
                />
                <div className="comic-info">
                  <div className="comic-title">{comic.title}</div>
                  <div className="comic-author">作者: 用户{comic.user_id}</div>
                  {comic.views !== undefined && (
                    <div className="comic-views">浏览: {comic.views}次</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

export default Browse