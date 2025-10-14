import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const ComicDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [comic, setComic] = useState(null)
  const [allComics, setAllComics] = useState([]) // 存储所有漫画用于切换
  const [currentImageIndex, setCurrentImageIndex] = useState(0) // 当前图片索引
  const [loading, setLoading] = useState(true)

  // 获取所有漫画数据用于切换
  useEffect(() => {
    const fetchAllComics = async () => {
      try {
        const response = await fetch('/api/comics')
        const data = await response.json()
        if (data.success) {
          setAllComics(data.comics)
          
          // 找到当前漫画在列表中的位置
          const currentIndex = data.comics.findIndex(c => c.id === parseInt(id))
          if (currentIndex !== -1) {
            setCurrentImageIndex(currentIndex)
          }
        }
      } catch (error) {
        console.error('获取漫画列表失败:', error)
      }
    }

    fetchAllComics()
  }, [id])

  // 获取当前漫画详情
  useEffect(() => {
    const fetchComicDetail = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/comics/${id}`)
        const data = await response.json()
        if (data.success) {
          setComic(data.comic)
        } else {
          console.error('获取漫画详情失败:', data.message)
        }
      } catch (error) {
        console.error('获取漫画详情失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchComicDetail()
  }, [id])

  // 切换到下一张图片
  const nextImage = () => {
    if (allComics.length > 0) {
      const nextIndex = (currentImageIndex + 1) % allComics.length
      setCurrentImageIndex(nextIndex)
      const nextComic = allComics[nextIndex]
      navigate(`/comic/${nextComic.id}`, { replace: true })
    }
  }

  // 切换到上一张图片
  const prevImage = () => {
    if (allComics.length > 0) {
      const prevIndex = (currentImageIndex - 1 + allComics.length) % allComics.length
      setCurrentImageIndex(prevIndex)
      const prevComic = allComics[prevIndex]
      navigate(`/comic/${prevComic.id}`, { replace: true })
    }
  }

  // 处理键盘事件
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        nextImage()
      } else if (e.key === 'ArrowLeft') {
        prevImage()
      } else if (e.key === 'Escape') {
        navigate(-1)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [allComics, currentImageIndex])

  // 处理图片点击 - 点击右侧切换到下一张，点击左侧切换到上一张
  const handleImageClick = (e) => {
    const imageRect = e.target.getBoundingClientRect()
    const clickX = e.clientX - imageRect.left
    const imageWidth = imageRect.width
    
    // 点击右侧2/3区域切换到下一张，左侧1/3区域切换到上一张
    if (clickX > imageWidth * 2 / 3) {
      nextImage()
    } else if (clickX < imageWidth / 3) {
      prevImage()
    }
    // 中间1/3区域不执行操作，或者可以添加其他功能
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '50px 20px' }}>
      <div style={{
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #6c5ce7',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 20px'
      }}></div>
      <p>加载中...</p>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )

  if (!comic) return (
    <div style={{ textAlign: 'center', padding: '50px 20px' }}>
      <h2 style={{ color: '#e74c3c', marginBottom: '20px' }}>漫画不存在</h2>
      <button 
        onClick={() => navigate('/')}
        style={{
          padding: '10px 20px',
          backgroundColor: '#6c5ce7',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        返回首页
      </button>
    </div>
  )

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      {/* 导航栏 */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        padding: '15px 0',
        borderBottom: '2px solid #f0f0f0'
      }}>
        <button 
          style={{
            padding: '10px 20px',
            border: '2px solid #ddd',
            background: '#f8f9fa',
            color: '#666',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
          onClick={() => navigate(-1)}
        >
          ← 返回
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h1 style={{ margin: 0, color: '#333' }}>{comic.title}</h1>
          <span style={{
            background: '#6c5ce7',
            color: 'white',
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            {currentImageIndex + 1} / {allComics.length}
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            style={{
              padding: '10px 20px',
              border: '2px solid #6c5ce7',
              background: 'white',
              color: '#6c5ce7',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
            onClick={prevImage}
            disabled={allComics.length <= 1}
          >
            上一张
          </button>
          <button 
            style={{
              padding: '10px 20px',
              border: '2px solid #6c5ce7',
              background: 'white',
              color: '#6c5ce7',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
            onClick={nextImage}
            disabled={allComics.length <= 1}
          >
            下一张
          </button>
        </div>
      </div>

      {/* 图片展示区域 */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        {comic.image_urls && comic.image_urls[0] ? (
          <div style={{ position: 'relative', display: 'inline-block', maxWidth: '100%' }}>
            <img 
              src={comic.image_urls[0]} 
              alt={comic.title}
              onClick={handleImageClick}
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                borderRadius: '12px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                cursor: 'pointer'
              }}
            />
          </div>
        ) : (
          <div style={{
            padding: '50px',
            background: '#f8f9fa',
            borderRadius: '12px',
            color: '#666'
          }}>
            暂无图片
          </div>
        )}
      </div>

      {/* 漫画信息 */}
      <div style={{
        background: '#f8f9fa',
        padding: '25px',
        borderRadius: '12px',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '15px'
        }}>
          <div style={{ padding: '10px 0', borderBottom: '1px solid #e9ecef' }}>
            <strong>作者:</strong> 用户{comic.user_id}
          </div>
          <div style={{ padding: '10px 0', borderBottom: '1px solid #e9ecef' }}>
            <strong>描述:</strong> {comic.description || '暂无描述'}
          </div>
          <div style={{ padding: '10px 0', borderBottom: '1px solid #e9ecef' }}>
            <strong>浏览:</strong> {comic.views || 0}次
          </div>
          <div style={{ padding: '10px 0', borderBottom: '1px solid #e9ecef' }}>
            <strong>上传时间:</strong> {new Date(comic.created_at).toLocaleDateString()}
          </div>
          {comic.tags && (
            <div style={{ padding: '10px 0', borderBottom: '1px solid #e9ecef' }}>
              <strong>标签:</strong> {comic.tags}
            </div>
          )}
        </div>
      </div>

      {/* 键盘操作提示 */}
      <div style={{ textAlign: 'center', color: '#666', fontSize: '14px', marginTop: '20px' }}>
        <p>💡 使用键盘左右箭头键切换图片，ESC键返回</p>
      </div>
    </div>
  )
}

export default ComicDetail