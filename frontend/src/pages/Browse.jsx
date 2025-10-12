import React, { useContext, useState, useEffect } from 'react'
import { AuthContext } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import api from '../services/api.jsx'
import '../App.css'

const Browse = () => {
  const { currentUser } = useContext(AuthContext)
  const [comics, setComics] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchComics()
  }, [])

  const fetchComics = async () => {
    try {
      setLoading(true)
      // 模拟获取漫画数据
      setTimeout(() => {
        setComics([
          { id: 1, title: "奇幻冒险", author: "漫画家A", image_url: "https://picsum.photos/300/200?random=1" },
          { id: 2, title: "科幻未来", author: "漫画家B", image_url: "https://picsum.photos/300/200?random=2" },
          { id: 3, title: "校园生活", author: "漫画家C", image_url: "https://picsum.photos/300/200?random=3" },
          { id: 4, title: "武侠传奇", author: "漫画家D", image_url: "https://picsum.photos/300/200?random=4" },
          { id: 5, title: "悬疑推理", author: "漫画家E", image_url: "https://picsum.photos/300/200?random=5" },
          { id: 6, title: "浪漫爱情", author: "漫画家F", image_url: "https://picsum.photos/300/200?random=6" }
        ])
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('获取漫画列表失败:', error)
      setLoading(false)
    }
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
            {!currentUser && (
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/register')}
                style={{ marginTop: '20px' }}
              >
                立即注册
              </button>
            )}
          </div>
        ) : (
          <div className="comic-grid">
            {comics.map(comic => (
              <div key={comic.id} className="comic-card">
                <img 
                  src={comic.image_url} 
                  alt={comic.title} 
                  className="comic-image"
                />
                <div className="comic-info">
                  <div className="comic-title">{comic.title}</div>
                  <div className="comic-author">作者: {comic.author}</div>
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