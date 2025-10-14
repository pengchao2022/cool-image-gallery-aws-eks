// ComicDetail.jsx
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

const ComicDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [comic, setComic] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchComicDetail = async () => {
      try {
        const response = await fetch(`/api/comics/${id}`)
        const data = await response.json()
        if (data.success) {
          setComic(data.comic)
        }
      } catch (error) {
        console.error('获取漫画详情失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchComicDetail()
  }, [id])

  if (loading) return <div>加载中...</div>
  if (!comic) return <div>漫画不存在</div>

  return (
    <div className="comic-detail" style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate(-1)}
        style={{ marginBottom: '20px', padding: '10px 20px', cursor: 'pointer' }}
      >
        返回
      </button>
      <h1>{comic.title}</h1>
      {comic.image_urls && comic.image_urls[0] && (
        <img 
          src={comic.image_urls[0]} 
          alt={comic.title}
          style={{ width: '100%', maxWidth: '500px', margin: '20px 0' }}
        />
      )}
      <p><strong>作者:</strong> 用户{comic.user_id}</p>
      <p><strong>描述:</strong> {comic.description}</p>
      <p><strong>浏览:</strong> {comic.views}次</p>
      <p><strong>上传时间:</strong> {new Date(comic.created_at).toLocaleDateString()}</p>
    </div>
  )
}

export default ComicDetail