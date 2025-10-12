// src/components/common/Footer.jsx
import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>漫画世界</h4>
            <p>&copy; {currentYear} 漫画网站. Designed by Pengchao Ma @2025 保留所有权利.</p>
          </div>
          <div className="footer-section">
            <p><strong>开发团队</strong></p>
            <p>探索创意，分享故事</p>
            <p>联系我们: pengchao.ma2@outlook.com</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;