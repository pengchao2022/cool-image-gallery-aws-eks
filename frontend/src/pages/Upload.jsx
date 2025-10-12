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
    files: [] // 改为数组支持多文件
  })
  const [uploading, setUploading] = useState(false)
  const navigate = useNavigate()

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files)
    if (files.length > 0) {
      // 验证文件
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
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.title || formData.files.length === 0) {
      alert('请填写标题并选择文件')
      return
    }

    setUploading(true)
    try {
      console.log('🚀 开始上传漫画...')
      
      const submitData = new FormData()
      submitData.append('title', formData.title)
      submitData.append('description', formData.description)
      
      // 添加多个文件 - 字段名必须是 'images'
      formData.files.forEach((file) => {
        submitData.append('images', file) // 关键：字段名必须是 'images'
      })

      console.log('📤 上传数据:', {
        title: formData.title,
        description: formData.description,
        fileCount: formData.files.length,
        files: formData.files.map(f => f.name)
      })

      // 调用后端上传API - 端点是 '/comics'
      const response = await api.post('/comics', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000 // 60秒超时
      })

      console.log('✅ 上传成功响应:', response.data)
      
      if (response.data.success) {
        alert('上传成功！漫画已保存到数据库和AWS S3')
        setFormData({ title: '', description: '', files: [] })
        navigate('/browse')
      } else {
        throw new Error(response.data.message || '上传失败')
      }

    } catch (error) {
      console.error('❌ 上传失败:', error)
      console.error('❌ 错误详情:', error.response?.data)
      
      let errorMessage = '上传失败: '
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message
      } else if (error.message) {
        errorMessage += error.message
      } else {
        errorMessage += '未知错误，请检查网络连接'
      }
      
      alert(errorMessage)
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
          <p style={{ fontSize: '0.9rem', color: '#888', marginTop: '10px' }}>
            支持多文件上传，图片将存储在AWS S3云存储
          </p>
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
            <label>上传图片 * (支持多选)</label>
            <div 
              className="upload-area"
              onClick={() => !uploading && document.getElementById('comicFiles').click()}
              style={{ 
                opacity: uploading ? 0.6 : 1,
                border: formData.files.length > 0 ? '2px dashed #28a745' : '2px dashed #ddd'
              }}
            >
              {formData.files.length > 0 ? (
                <>
                  <i className="fas fa-file-image" style={{ color: '#28a745' }}></i>
                  <p className="upload-text">已选择 {formData.files.length} 个文件</p>
                  <p className="upload-hint">点击添加更多文件或拖拽新文件</p>
                  <div style={{ marginTop: '15px', maxHeight: '150px', overflowY: 'auto' }}>
                    {formData.files.map((file, index) => (
                      <div key={index} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '5px 10px',
                        margin: '5px 0',
                        background: '#f8f9fa',
                        borderRadius: '4px',
                        fontSize: '0.8rem'
                      }}>
                        <span>• {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFile(index)
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#dc3545',
                            cursor: 'pointer',
                            padding: '2px 6px'
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
                  <p className="upload-text">点击或拖拽文件到此处上传</p>
                  <p className="upload-hint">支持 JPG, PNG 格式，最大 10MB，最多10个文件</p>
                </>
              )}
              <input
                type="file"
                id="comicFiles"
                className="file-input"
                accept="image/*"
                multiple
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
              disabled={uploading || formData.files.length === 0}
            >
              {uploading ? (
                <>
                  <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
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