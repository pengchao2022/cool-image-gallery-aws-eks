import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const { currentUser } = useContext(AuthContext);

  return (
    <div className="home-page">
      {/* 英雄区域 */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1>欢迎来到漫画世界</h1>
            <p>发现精彩的漫画作品，与创作者互动，或者分享您自己的创作</p>
            <div className="hero-buttons">
              {currentUser ? (
                <>
                  <Link to="/browse" className="btn btn-primary">
                    浏览漫画
                  </Link>
                  <Link to="/upload" className="btn btn-outline">
                    上传作品
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/browse" className="btn btn-primary">
                    开始浏览
                  </Link>
                  <Link to="/register" className="btn btn-outline">
                    立即注册
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 特性介绍 */}
      <section className="features-section">
        <div className="container">
          <h2>为什么选择漫画世界？</h2>
          <div className="features-grid">
            <div className="feature-card">
              <i className="fas fa-book-open"></i>
              <h3>海量漫画</h3>
              <p>浏览数千部精彩漫画作品，涵盖各种题材和风格</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-upload"></i>
              <h3>轻松上传</h3>
              <p>简单易用的上传功能，快速分享您的创作</p>
            </div>
            <div className="feature-card">
              <i className="fas fa-users"></i>
              <h3>社区互动</h3>
              <p>与创作者和其他读者交流，发现更多精彩内容</p>
            </div>
          </div>
        </div>
      </section>

      {/* 热门漫画预览 */}
      <section className="preview-section">
        <div className="container">
          <h2>热门漫画</h2>
          <p>探索社区中最受欢迎的作品</p>
          <div className="preview-grid">
            <div className="preview-card">
              <div className="preview-image"></div>
              <div className="preview-info">
                <h4>奇幻冒险</h4>
                <p>作者: 漫画家A</p>
              </div>
            </div>
            <div className="preview-card">
              <div className="preview-image"></div>
              <div className="preview-info">
                <h4>科幻未来</h4>
                <p>作者: 漫画家B</p>
              </div>
            </div>
            <div className="preview-card">
              <div className="preview-image"></div>
              <div className="preview-info">
                <h4>校园生活</h4>
                <p>作者: 漫画家C</p>
              </div>
            </div>
          </div>
          <div className="preview-actions">
            <Link to="/browse" className="btn btn-primary">
              查看所有漫画
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;