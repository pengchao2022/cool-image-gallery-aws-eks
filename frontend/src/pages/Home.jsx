import React, { useContext, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext.jsx'
import './Home.css'

const Home = () => {
  const { currentUser } = useContext(AuthContext)
  const [comics, setComics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 加载漫画数据
  useEffect(() => {
    const fetchComics = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch('/api/comics?limit=6')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.success) {
          console.log('✅ 成功加载漫画数据:', data.comics.length, '个漫画')
          setComics(data.comics)
        } else {
          throw new Error(data.message || '获取漫画数据失败')
        }
      } catch (err) {
        console.error('❌ 加载漫画失败:', err)
        setError('加载漫画数据失败，请刷新页面重试')
      } finally {
        setLoading(false)
      }
    }

    fetchComics()
  }, [])

  // 处理图片加载失败
  const handleImageError = (e, comic) => {
    console.log(`图片加载失败: ${comic.title}`)
    e.target.style.display = 'none'
    // 可以在这里设置一个默认的占位图片
    // e.target.src = '/default-comic-image.jpg'
  }

  // 处理图片加载成功
  const handleImageLoad = (e, comic) => {
    console.log(`图片加载成功: ${comic.title}`)
  }

  return (
    <div className="home-page">
      {/* 英雄区域 */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1>欢迎来到漫画世界</h1>
            <p>发现精彩的漫画作品，与创作者互动，或者分享您自己的创作</p>
            <div className="hero-buttons">
              {currentUser ? (
                <>
                  <Link to="/browse" className="btn btn-primary">
                    浏览漫画
                  </Link>
                  <Link to="/upload" className="btn btn-outline">
                    上传作品
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/browse" className="btn btn-primary">
                    开始浏览
                  </Link>
                  <Link to="/register" className="btn btn-outline">
                    立即注册
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 特性介绍 */}
      <section className="features-section">
        <div className="container">
          <h2>为什么选择漫画世界？</h2>
          <div className="features-grid">
            <div className="feature-card">
              <i className="fas fa-book-open"></i>
              <h3>海量漫画</h3>
              <p>浏览数千部精彩漫画作品，涵盖各种题材和风格</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-upload"></i>
              <h3>轻松上传</h3>
              <p>简单易用的上传功能，快速分享您的创作</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-users"></i>
              <h3>社区互动</h3>
              <p>与创作者和其他读者交流，发现更多精彩内容</p>
            </div>
          </div>
        </div>
      </section>

      {/* 热门漫画预览 */}
      <section className="preview-section">
        <div className="container">
          <h2>热门漫画</h2>
          <p>探索社区中最受欢迎的作品</p>
          
          {loading && (
            <div className="loading-state">
              <p>加载中...</p>
              <div className="loading-skeleton">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="skeleton-card">
                    <div className="skeleton-image"></div>
                    <div className="skeleton-info">
                      <div className="skeleton-title"></div>
                      <div className="skeleton-author"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="error-state">
              <p style={{color: '#e74c3c', marginBottom: '20px'}}>{error}</p>
              <button 
                className="btn btn-primary" 
                onClick={() => window.location.reload()}
              >
                重新加载
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="preview-grid">
                {comics.length > 0 ? (
                  comics.map((comic) => (
                    <div key={comic.id} className="preview-card">
                      <div className="preview-image">
                        {comic.image_urls && comic.image_urls[0] ? (
                          <img 
                            src={comic.image_urls[0]} 
                            alt={comic.title}
                            onError={(e) => handleImageError(e, comic)}
                            onLoad={(e) => handleImageLoad(e, comic)}
                          />
                        ) : (
                          <div className="no-image">暂无图片</div>
                        )}
                      </div>
                      <div className="preview-info">
                        <h4>{comic.title || '未命名作品'}</h4>
                        <p>作者: 用户{comic.user_id}</p>
                        {comic.views !== undefined && (
                          <small>浏览: {comic.views}次</small>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>暂无漫画作品，成为第一个上传者吧！</p>
                    <Link to="/upload" className="btn btn-primary">
                      上传作品
                    </Link>
                  </div>
                )}
              </div>
              
              {comics.length > 0 && (
                <div className="preview-actions">
                  <Link to="/browse" className="btn btn-primary">
                    查看所有漫画
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}

export default Home