import React, { useState, useContext, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext.jsx'
import api from '../services/api.jsx'
import '../App.css'

const Upload = () => {
  const { currentUser, refreshUser } = useContext(AuthContext)
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
    console.log('📄 选择的文件:', files.length)
    
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
      
      console.log('✅ 有效文件:', validFiles.length)
      
      if (validFiles.length > 0) {
        setFormData(prev => ({ ...prev, files: validFiles }))
      }
    }
  }

  const handleUploadAreaClick = () => {
    console.log('🖱️ 上传区域被点击')
    if (!uploading) {
      console.log('🔍 触发文件输入点击')
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
      console.log('🚀 开始上传漫画...')
      console.log('👤 当前用户:', currentUser)
      
      const token = localStorage.getItem('authToken') || localStorage.getItem('token')
      console.log('🔑 Token状态:', token ? '存在' : '不存在')

      console.log('📤 表单数据:', {
        title: formData.title,
        description: formData.description,
        fileCount: formData.files.length,
        files: formData.files.map(f => f.name)
      })

      console.log('📤 调用上传API...')
      
      const response = await api.comics.createMultiple({
        title: formData.title,
        description: formData.description
      }, formData.files)

      console.log('✅ 上传成功:', response)
      
      if (response.success) {
        alert('上传成功！')
        setFormData({ title: '', description: '', files: [] })
        navigate('/browse')
      } else {
        throw new Error(response.message || '上传失败')
      }

    } catch (error) {
      console.error('❌ 上传失败:', error)
      
      let errorMessage = error.message
      if (error.message.includes('token') || error.message.includes('401') || error.message.includes('Unauthorized')) {
        errorMessage = '认证失败：Token无效或已过期'
        
        console.log('🔄 检测到认证错误，跳转到错误页面而不是直接清除数据')
        
        navigate('/auth-error', {
          state: {
            error: '上传时认证失败，但您的登录信息仍然存在',
            from: 'comic-upload-401',
            hasUserData: !!currentUser,
            canRetry: true,
            contextUser: currentUser ? `ID: ${currentUser.id}` : 'null',
            storageUser: localStorage.getItem('user') ? '存在' : 'null',
            token: localStorage.getItem('authToken') ? '存在' : '不存在'
          }
        })
        return
      } else if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
        errorMessage = '网络连接失败，请检查后端服务是否正常运行'
      }
      
      alert(`上传失败: ${errorMessage}`)
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

  const clearAllFiles = () => {
    if (!uploading) {
      setFormData(prev => ({ ...prev, files: [] }))
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
            />
          </div>

          <div className="form-group">
            <label>上传图片 * (支持多选)</label>
            
            {/* 重新设计的上传区域 */}
            <div style={{ position: 'relative' }}>
              {/* 可见的上传区域 */}
              <div 
                className={`upload-area ${formData.files.length > 0 ? 'has-files' : ''}`}
                onClick={handleUploadAreaClick}
                style={{
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  position: 'relative',
                  zIndex: 1
                }}
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
              </div>

              {/* 透明的文件输入，覆盖整个上传区域 */}
              <input
                ref={fileInputRef}
                type="file"
                className="file-input"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                disabled={uploading}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: uploading ? 'not-allowed' : 'pointer',
                  zIndex: 2
                }}
              />
            </div>

            {/* 文件操作按钮 */}
            {formData.files.length > 0 && (
              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={clearAllFiles}
                  disabled={uploading}
                  style={{ fontSize: '12px', padding: '5px 10px' }}
                >
                  清除所有文件
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleUploadAreaClick}
                  disabled={uploading}
                  style={{ fontSize: '12px', padding: '5px 10px' }}
                >
                  添加更多文件
                </button>
              </div>
            )}
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

        {/* 调试信息 */}
        <div style={{ 
          marginTop: '30px', 
          padding: '15px', 
          background: '#f8f9fa', 
          borderRadius: '8px',
          fontSize: '0.8rem',
          color: '#666'
        }}>
          <h4 style={{ marginBottom: '10px' }}>调试信息</h4>
          <div>用户: {currentUser?.username || '未登录'}</div>
          <div>用户ID: {currentUser?.id || '未知'}</div>
          <div>Token: {localStorage.getItem('authToken') ? '存在' : '不存在'}</div>
          <div>文件数量: {formData.files.length}</div>
          <div>上传状态: {uploading ? '进行中' : '空闲'}</div>
        </div>
      </div>
    </div>
  )
}

export default Upload