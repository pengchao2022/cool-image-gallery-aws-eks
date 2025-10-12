import React, { useState, useContext } from 'react'
import { AuthContext } from '../../context/AuthContext.jsx'
import api from '../../services/api.jsx'

const ComicUpload = ({ onComicUpload }) => {
  const { currentUser } = useContext(AuthContext)
  const [uploading, setUploading] = useState(false)
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    file: null
  })

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
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
      // 模拟上传
      await new Promise(resolve => setTimeout(resolve, 2000))
      const newComic = {
        id: Date.now(),
        title: uploadData.title,
        author: currentUser.username,
        image_url: URL.createObjectURL(uploadData.file)
      }
      
      onComicUpload(newComic)
      setUploadData({ title: '', description: '', file: null })
      alert('漫画上传成功！')
    } catch (error) {
      console.error('上传失败:', error)
      alert('上传失败，请重试')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="modal" style={{ display: 'flex' }}>
      <div className="modal-content">
        <div className="modal-header">
          <h3 className="modal-title">上传漫画</h3>
          <button 
            className="close-modal" 
            onClick={() => document.getElementById('uploadModal')?.style.display = 'none'}
            disabled={uploading}
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
              style={{ opacity: uploading ? 0.6 : 1 }}
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
                accept="image/*" 
                onChange={handleFileSelect}
                required 
                disabled={uploading}
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%' }}
            disabled={uploading}
          >
            {uploading ? '上传中...' : '上传'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default ComicUpload