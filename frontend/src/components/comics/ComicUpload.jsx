import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../../context/AuthContext.jsx'
import api from '../../services/api.jsx'

const ComicUpload = ({ onComicUpload }) => {
  const { currentUser, refreshUser } = useContext(AuthContext)
  const navigate = useNavigate()
  const [uploading, setUploading] = useState(false)
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    file: null
  })

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      // 验证文件大小 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('文件大小不能超过 10MB')
        return
      }
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        alert('请选择图片文件')
        return
      }
      setUploadData(prev => ({ ...prev, file }))
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!uploadData.title || !uploadData.file) {
      alert('请填写漫画标题并选择文件！')
      return
    }

    setUploading(true)
    try {
      console.log('🚀 开始上传漫画...')
      console.log('👤 当前用户:', currentUser)
      
      // 创建 FormData
      const formData = new FormData()
      formData.append('title', uploadData.title)
      formData.append('description', uploadData.description)
      formData.append('files', uploadData.file)
      
      console.log('📤 表单数据:', {
        title: uploadData.title,
        description: uploadData.description,
        file: uploadData.file.name,
        fileSize: uploadData.file.size
      })

      // 使用真实的 API 调用
      const response = await api.comics.createMultiple(formData)
      
      console.log('✅ 上传成功:', response)
      
      // 调用成功回调
      if (onComicUpload) {
        onComicUpload(response)
      }
      
      // 重置表单
      setUploadData({ title: '', description: '', file: null })
      
      // 关闭模态框
      const modal = document.getElementById('uploadModal')
      if (modal) {
        modal.style.display = 'none'
      }
      
      alert('漫画上传成功！')
      
    } catch (error) {
      console.error('❌ 上传失败:', error)
      
      // 改进的错误处理 - 使用新的错误对象结构
      if (error.status === 401) {
        console.log('🔐 上传认证失败 (401)')
        
        // 导航到上传错误页面
        navigate('/upload-error', {
          state: {
            error: '认证失败，请重新登录',
            status: 401,
            from: 'upload'
          }
        })
      } else if (error.status === 413) {
        alert('文件太大，请选择小于 10MB 的文件')
      } else if (error.data?.message) {
        alert(`上传失败: ${error.data.message}`)
      } else {
        // 其他错误导航到错误页面
        navigate('/upload-error', {
          state: {
            error: error.message || '上传失败，请重试',
            status: error.status || 500,
            from: 'upload'
          }
        })
      }
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
    setUploadData({ title: '', description: '', file: null })
  }

  const handleClose = () => {
    const modal = document.getElementById('uploadModal')
    if (modal) {
      modal.style.display = 'none'
    }
    resetForm()
  }

  return (
    <div className="modal" style={{ display: 'flex' }}>
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">上传漫画</h3>
          <button 
            className="close-modal" 
            onClick={handleClose}
            disabled={uploading}
            type="button"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleUpload}>
          <div className="form-group">
            <label htmlFor="comicTitle">漫画标题 *</label>
            <input 
              type="text" 
              id="comicTitle" 
              className="form-control" 
              placeholder="请输入漫画标题" 
              value={uploadData.title}
              onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
              required 
              disabled={uploading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="comicDescription">漫画描述</label>
            <textarea 
              id="comicDescription" 
              className="form-control" 
              rows="3" 
              placeholder="请输入漫画描述"
              value={uploadData.description}
              onChange={(e) => setUploadData(prev => ({ ...prev, description: e.target.value }))}
              disabled={uploading}
            ></textarea>
          </div>
          <div className="form-group">
            <label>上传漫画图片 *</label>
            <div 
              className="upload-area" 
              id="uploadArea"
              onClick={() => !uploading && document.getElementById('comicFile').click()}
              style={{ 
                opacity: uploading ? 0.6 : 1,
                cursor: uploading ? 'not-allowed' : 'pointer'
              }}
            >
              {uploadData.file ? (
                <>
                  <i className="fas fa-file-image"></i>
                  <p className="upload-text">已选择: {uploadData.file.name}</p>
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
                accept="image/jpeg,image/png,image/jpg" 
                onChange={handleFileSelect}
                required 
                disabled={uploading}
              />
            </div>
          </div>
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-outline" 
              onClick={handleClose}
              disabled={uploading}
            >
              取消
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={uploading || !uploadData.title || !uploadData.file}
            >
              {uploading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  上传中...
                </>
              ) : (
                '上传'
              )}
            </button>
          </div>
        </form>
        
        {/* 调试信息 - 仅在开发环境显示 */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{ 
            marginTop: '20px', 
            padding: '10px', 
            background: '#f5f5f5', 
            borderRadius: '4px',
            fontSize: '12px'
          }}>
            <strong>调试信息:</strong>
            <div>用户: {currentUser?.username || '未登录'}</div>
            <div>用户ID: {currentUser?.id || '无'}</div>
            <div>Token: {localStorage.getItem('authToken') ? '存在' : '不存在'}</div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ComicUpload