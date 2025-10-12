import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext.jsx'
import api from '../services/api.jsx'
import '../App.css'

const Upload = () => {
  const { currentUser } = useContext(AuthContext)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null
  })
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({ ...prev, file }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title || !formData.file) {
      alert('请填写标题并选择文件')
      return
    }

    setUploading(true)
    try {
      // 模拟上传过程
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('上传成功！')
      setFormData({ title: '', description: '', file: null })
      navigate('/browse')
    } catch (error) {
      console.error('上传失败:', error)
      alert('上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <div style={{ 
        background: 'white', 
        padding: '40px', 
        borderRadius: '15px', 
        boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1>上传漫画</h1>
          <p style={{ color: '#666' }}>分享您的创作给社区</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="comicTitle">漫画标题 *</label>
            <input
              type="text"
              id="comicTitle"
              className="form-control"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="请输入漫画标题"
              required
              disabled={uploading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="comicDescription">漫画描述</label>
            <textarea
              id="comicDescription"
              className="form-control"
              rows="4"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="请输入漫画描述（可选）"
              disabled={uploading}
            ></textarea>
          </div>

          <div className="form-group">
            <label>上传图片 *</label>
            <div 
              className="upload-area"
              onClick={() => !uploading && document.getElementById('comicFile').click()}
              style={{ opacity: uploading ? 0.6 : 1 }}
            >
              {formData.file ? (
                <>
                  <i className="fas fa-file-image"></i>
                  <p className="upload-text">已选择: {formData.file.name}</p>
                  <p className="upload-hint">点击更换文件</p>
                </>
              ) : (
                <>
                  <i className="fas fa-cloud-upload-alt"></i>
                  <p className="upload-text">点击或拖拽文件到此处上传</p>
                  <p className="upload-hint">支持 JPG, PNG 格式，最大 10MB</p>
                </>
              )}
              <input
                type="file"
                id="comicFile"
                className="file-input"
                accept="image/*"
                onChange={handleFileSelect}
                required
                disabled={uploading}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', marginTop: '30px' }}>
            <button 
              type="button" 
              className="btn btn-outline"
              onClick={() => navigate('/browse')}
              disabled={uploading}
            >
              取消
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
                  上传中...
                </>
              ) : (
                '上传'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Upload