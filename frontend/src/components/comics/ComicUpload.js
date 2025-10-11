import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';

const ComicUpload = ({ onComicUpload }) => {
  const { currentUser, login, register } = useContext(AuthContext);
  const [activeModal, setActiveModal] = useState(null);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    file: null
  });

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadData(prev => ({ ...prev, file }));
      // 更新上传区域显示
      const uploadArea = document.getElementById('uploadArea');
      if (uploadArea) {
        uploadArea.innerHTML = `
          <i class="fas fa-file-image"></i>
          <p class="upload-text">已选择文件: ${file.name}</p>
          <p class="upload-hint">点击此处更换文件</p>
        `;
      }
    }
  };

  const handleUpload = (e) => {
    e.preventDefault();
    if (!uploadData.title || !uploadData.file) {
      alert('请填写漫画标题并选择文件！');
      return;
    }

    const newComic = {
      id: Date.now(),
      title: uploadData.title,
      author: currentUser.username,
      image: URL.createObjectURL(uploadData.file)
    };

    onComicUpload(newComic);
    setActiveModal(null);
    setUploadData({ title: '', description: '', file: null });
    
    // 重置上传区域
    const uploadArea = document.getElementById('uploadArea');
    if (uploadArea) {
      uploadArea.innerHTML = `
        <i class="fas fa-cloud-upload-alt"></i>
        <p class="upload-text">点击或拖拽文件到此处上传</p>
        <p class="upload-hint">支持 JPG, PNG 格式，最大 10MB</p>
      `;
    }
    
    alert('漫画上传成功！');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    await login(email, password);
    setActiveModal(null);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
      alert('两次输入的密码不一致！');
      return;
    }
    
    await register(username, email, password);
    setActiveModal(null);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <>
      {/* 登录模态框 */}
      {activeModal === 'login' && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">登录账号</h3>
              <button className="close-modal" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label htmlFor="loginEmail">邮箱</label>
                <input type="email" id="loginEmail" className="form-control" placeholder="请输入邮箱" required />
              </div>
              <div className="form-group">
                <label htmlFor="loginPassword">密码</label>
                <input type="password" id="loginPassword" className="form-control" placeholder="请输入密码" required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>登录</button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '20px' }}>
              还没有账号？<a href="#" onClick={() => setActiveModal('register')}>立即注册</a>
            </p>
          </div>
        </div>
      )}

      {/* 注册模态框 */}
      {activeModal === 'register' && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">注册账号</h3>
              <button className="close-modal" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label htmlFor="registerUsername">用户名</label>
                <input type="text" id="registerUsername" className="form-control" placeholder="请输入用户名" required />
              </div>
              <div className="form-group">
                <label htmlFor="registerEmail">邮箱</label>
                <input type="email" id="registerEmail" className="form-control" placeholder="请输入邮箱" required />
              </div>
              <div className="form-group">
                <label htmlFor="registerPassword">密码</label>
                <input type="password" id="registerPassword" className="form-control" placeholder="请输入密码" required />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">确认密码</label>
                <input type="password" id="confirmPassword" className="form-control" placeholder="请再次输入密码" required />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>注册</button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '20px' }}>
              已有账号？<a href="#" onClick={() => setActiveModal('login')}>立即登录</a>
            </p>
          </div>
        </div>
      )}

      {/* 上传模态框 */}
      {activeModal === 'upload' && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">上传漫画</h3>
              <button className="close-modal" onClick={closeModal}>&times;</button>
            </div>
            <form onSubmit={handleUpload}>
              <div className="form-group">
                <label htmlFor="comicTitle">漫画标题</label>
                <input 
                  type="text" 
                  id="comicTitle" 
                  className="form-control" 
                  placeholder="请输入漫画标题" 
                  value={uploadData.title}
                  onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                  required 
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
                ></textarea>
              </div>
              <div className="form-group">
                <label>上传漫画图片</label>
                <div 
                  className="upload-area" 
                  id="uploadArea"
                  onClick={() => document.getElementById('comicFile').click()}
                >
                  <i className="fas fa-cloud-upload-alt"></i>
                  <p className="upload-text">点击或拖拽文件到此处上传</p>
                  <p className="upload-hint">支持 JPG, PNG 格式，最大 10MB</p>
                  <input 
                    type="file" 
                    id="comicFile" 
                    className="file-input" 
                    accept="image/*" 
                    onChange={handleFileSelect}
                    required 
                  />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>上传</button>
            </form>
          </div>
        </div>
      )}

      {/* 触发按钮 - 在Header中已经包含 */}
    </>
  );
};

export default ComicUpload;