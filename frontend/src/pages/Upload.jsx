import React, { useState, useContext, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext.jsx'
import api from '../services/api.jsx'
import '../App.css'

const Upload = () => {
  const { currentUser } = useContext(AuthContext)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    files: []
  })
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      const validFiles = files.filter(file => {
        if (!file.type.startsWith('image/')) {
          alert(`文件 ${file.name} 不是图片格式`)
          return false
        }
        if (file.size > 10 * 1024 * 1024) {
          alert(`文件 ${file.name} 大小超过10MB`)
          return false
        }
        return true
      })
      
      if (validFiles.length > 0) {
        setFormData(prev => ({ ...prev, files: validFiles }))
      }
    }
    // 清空input值，允许重复选择相同文件
    e.target.value = ''
  }

  const handleUploadAreaClick = () => {
    if (!uploading) {
      fileInputRef.current?.click()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title || formData.files.length === 0) {
      alert('请填写标题并选择文件')
      return
    }

    setUploading(true)
    try {
      const submitData = new FormData()
      submitData.append('title', formData.title)
      submitData.append('description', formData.description)
      
      formData.files.forEach((file) => {
        submitData.append('images', file)
      })

      const response = await api.post('/comics', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.success) {
        alert('上传成功！')
        setFormData({ title: '', description: '', files: [] })
        navigate('/browse')
      } else {
        throw new Error(response.data.message || '上传失败')
      }

    } catch (error) {
      console.error('上传失败:', error)
      alert(`上传失败: ${error.response?.data?.message || error.message}`)
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (index) => {
    if (uploading) return
    const newFiles = [...formData.files]
    newFiles.splice(index, 1)
    setFormData(prev => ({ ...prev, files: newFiles }))
  }

  const uploadAreaClass = `upload-area ${formData.files.length > 0 ? 'has-files' : ''}`

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
            />
          </div>

          <div className="form-group">
            <label>上传图片 * (支持多选)</label>
            <div 
              className={uploadAreaClass}
              onClick={handleUploadAreaClick}
            >
              {formData.files.length > 0 ? (
                <>
                  <i className="fas fa-file-image"></i>
                  <p className="upload-text">已选择 {formData.files.length} 个文件</p>
                  <p className="upload-hint">点击添加更多文件</p>
                  <div className="file-list">
                    {formData.files.map((file, index) => (
                      <div key={index} className="file-item">
                        <span className="file-name">{file.name}</span>
                        <button
                          type="button"
                          className="file-remove"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFile(index)
                          }}
                          disabled={uploading}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <i className="fas fa-cloud-upload-alt"></i>
                  <p className="upload-text">点击选择文件</p>
                  <p className="upload-hint">支持 JPG, PNG 格式，最大 10MB</p>
                </>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                className="file-input"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
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
              disabled={uploading || formData.files.length === 0}
            >
              {uploading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  上传中...
                </>
              ) : (
                `上传 ${formData.files.length} 个文件`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Upload