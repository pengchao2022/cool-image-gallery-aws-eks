import React, { useState, useContext, useEffect } from 'react'
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

  // 添加调试信息
  useEffect(() => {
    console.log('🔍 Upload 组件加载 - 开始调试')
    console.log('👤 当前用户:', currentUser)
    console.log('🔑 Token 存在:', !!localStorage.getItem('authToken'))
    console.log('🔑 Token 内容:', localStorage.getItem('authToken'))
    console.log('📍 当前路径:', window.location.pathname)
  }, [currentUser])

  const handleFileSelect = (e) => {
    console.log('📁 文件选择事件触发')
    const file = e.target.files[0]
    if (file) {
      console.log('✅ 选择的文件:', file.name, file.type, file.size)
      setFormData(prev => ({ ...prev, file }))
    } else {
      console.log('❌ 未选择文件')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    console.log('🚀 提交表单触发')
    console.log('📋 表单数据:', formData)
    
    if (!formData.title || !formData.file) {
      console.log('❌ 表单验证失败 - 标题或文件为空')
      alert('请填写标题并选择文件')
      return
    }

    console.log('✅ 表单验证通过，开始上传...')
    setUploading(true)
    
    try {
      // 模拟上传过程
      console.log('⏳ 模拟上传过程中...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('✅ 上传成功！')
      alert('上传成功！')
      
      // 重置表单
      setFormData({ title: '', description: '', file: null })
      console.log('🔄 表单已重置')
      
      // 跳转到浏览页面
      console.log('📍 跳转到 /browse')
      navigate('/browse')
      
    } catch (error) {
      console.error('❌ 上传失败:', error)
      alert('上传失败，请重试')
    } finally {
      setUploading(false)
      console.log('🏁 上传过程结束')
    }
  }

  // 添加点击事件调试
  const handleCancelClick = () => {
    console.log('❌ 取消按钮点击')
    console.log('📍 跳转到 /browse')
    navigate('/browse')
  }

  const handleUploadAreaClick = () => {
    if (!uploading) {
      console.log('📁 上传区域点击')
      document.getElementById('comicFile').click()
    } else {
      console.log('⏸️ 上传区域点击被阻止（上传中）')
    }
  }

  console.log('🔄 Upload 组件渲染 - 上传状态:', uploading)

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
          {/* 调试信息显示 */}
          <div style={{ 
            background: '#f8f9fa', 
            padding: '10px', 
            borderRadius: '5px', 
            fontSize: '12px',
            textAlign: 'left',
            marginTop: '10px'
          }}>
            <strong>调试信息:</strong>
            <div>用户: {currentUser?.username || '未登录'}</div>
            <div>Token: {localStorage.getItem('authToken') ? '存在' : '不存在'}</div>
            <div>上传状态: {uploading ? '进行中' : '空闲'}</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="comicTitle">漫画标题 *</label>
            <input
              type="text"
              id="comicTitle"
              className="form-control"
              value={formData.title}
              onChange={(e) => {
                console.log('📝 标题输入:', e.target.value)
                setFormData(prev => ({ ...prev, title: e.target.value }))
              }}
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
              onChange={(e) => {
                console.log('📝 描述输入:', e.target.value)
                setFormData(prev => ({ ...prev, description: e.target.value }))
              }}
              placeholder="请输入漫画描述（可选）"
              disabled={uploading}
            ></textarea>
          </div>

          <div className="form-group">
            <label>上传图片 *</label>
            <div 
              className="upload-area"
              onClick={handleUploadAreaClick}
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
              onClick={handleCancelClick}
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