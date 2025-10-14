import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import './ComicDetail.css' // 可以创建这个CSS文件来美化页面

const ComicDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
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
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>加载中...</p>
    </div>
  )

  if (!comic) return (
    <div className="error-container">
      <h2>漫画不存在</h2>
      <button onClick={() => navigate('/')}>返回首页</button>
    </div>
  )

  return (
    <div className="comic-detail">
      {/* 导航栏 */}
      <div className="comic-nav">
        <button 
          className="nav-button back-button"
          onClick={() => navigate(-1)}
        >
          ← 返回
        </button>
        
        <div className="comic-info-header">
          <h1>{comic.title}</h1>
          <span className="comic-counter">
            {currentImageIndex + 1} / {allComics.length}
          </span>
        </div>
        
        <div className="nav-buttons">
          <button 
            className="nav-button prev-button"
            onClick={prevImage}
            disabled={allComics.length <= 1}
          >
            上一张
          </button>
          <button 
            className="nav-button next-button"
            onClick={nextImage}
            disabled={allComics.length <= 1}
          >
            下一张
          </button>
        </div>
      </div>

      {/* 图片展示区域 */}
      <div className="image-container">
        {comic.image_urls && comic.image_urls[0] ? (
          <div className="image-wrapper">
            <img 
              src={comic.image_urls[0]} 
              alt={comic.title}
              onClick={handleImageClick}
              className="comic-image"
            />
            
            {/* 点击提示 */}
            <div className="click-hints">
              <div className="hint-left">点击左侧区域 ← 上一张</div>
              <div className="hint-right">点击右侧区域 → 下一张</div>
            </div>
          </div>
        ) : (
          <div className="no-image">暂无图片</div>
        )}
      </div>

      {/* 漫画信息 */}
      <div className="comic-info">
        <div className="info-grid">
          <div className="info-item">
            <strong>作者:</strong> 用户{comic.user_id}
          </div>
          <div className="info-item">
            <strong>描述:</strong> {comic.description || '暂无描述'}
          </div>
          <div className="info-item">
            <strong>浏览:</strong> {comic.views || 0}次
          </div>
          <div className="info-item">
            <strong>上传时间:</strong> {new Date(comic.created_at).toLocaleDateString()}
          </div>
          {comic.tags && (
            <div className="info-item">
              <strong>标签:</strong> {comic.tags}
            </div>
          )}
        </div>
      </div>

      {/* 键盘操作提示 */}
      <div className="keyboard-hints">
        <p>💡 使用键盘左右箭头键切换图片，ESC键返回</p>
      </div>
    </div>
  )
}

export default ComicDetail