// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';  // 改为小写

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);