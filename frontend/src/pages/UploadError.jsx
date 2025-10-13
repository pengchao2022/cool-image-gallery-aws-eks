import React from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'

const UploadError = () => {
  const location = useLocation()
  const navigate = useNavigate()
  
  const errorState = location.state || {}

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '50px auto', 
      padding: '20px',
      textAlign: 'center'
    }}>
      <h1 style={{ color: '#e74c3c' }}>📤 上传错误</h1>
      
      <div style={{ 
        background: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        margin: '20px 0'
      }}>
        <p>{errorState.error || '上传过程中发生错误'}</p>
        
        {errorState.from && (
          <p><small>错误来源: {errorState.from}</small></p>
        )}
      </div>

      <div style={{ marginTop: '30px' }}>
        <Link 
          to="/upload"
          style={{
            display: 'inline-block',
            background: '#3498db',
            color: 'white',
            textDecoration: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            margin: '0 10px'
          }}
        >
          重新上传
        </Link>
        
        <Link 
          to="/"
          style={{
            display: 'inline-block',
            background: '#2ecc71',
            color: 'white',
            textDecoration: 'none',
            padding: '10px 20px',
            borderRadius: '5px',
            margin: '0 10px'
          }}
        >
          返回首页
        </Link>
      </div>
    </div>
  )
}

export default UploadError