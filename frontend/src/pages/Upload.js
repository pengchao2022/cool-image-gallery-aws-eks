import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Upload.css';

const Upload = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file: null
  });
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.file) {
      alert('请填写标题并选择文件');
      return;
    }

    setUploading(true);
    // 模拟上传过程
    setTimeout(() => {
      alert('上传成功！');
      setUploading(false);
      navigate('/browse');
    }, 2000);
  };

  return (
    <div className="upload-page">
      <div className="container">
        <div className="upload-header">
          <h1>上传漫画</h1>
          <p>分享您的创作给社区</p>
        </div>

        <div className="upload-card">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>漫画标题 *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="请输入漫画标题"
                required
                disabled={uploading}
              />
            </div>

            <div className="form-group">
              <label>漫画描述</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="请输入漫画描述（可选）"
                rows="4"
                disabled={uploading}
              />
            </div>

            <div className="form-group">
              <label>上传图片 *</label>
              <div 
                className="upload-area"
                onClick={() => !uploading && document.getElementById('comicFile').click()}
              >
                {formData.file ? (
                  <>
                    <i className="fas fa-file-image"></i>
                    <p>已选择: {formData.file.name}</p>
                    <p className="upload-hint">点击更换文件</p>
                  </>
                ) : (
                  <>
                    <i className="fas fa-cloud-upload-alt"></i>
                    <p>点击或拖拽文件到此处上传</p>
                    <p className="upload-hint">支持 JPG, PNG 格式，最大 10MB</p>
                  </>
                )}
                <input
                  type="file"
                  id="comicFile"
                  accept="image/*"
                  onChange={handleFileSelect}
                  required
                  disabled={uploading}
                />
              </div>
            </div>

            <div className="upload-actions">
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
                {uploading ? '上传中...' : '上传'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Upload;