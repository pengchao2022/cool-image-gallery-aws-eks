import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { comicService } from '../../services/api';
import './ComicUpload.css';

const ComicUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: ''
  });

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 10,
    multiple: true
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (acceptedFiles.length === 0) {
      setMessage('Please select at least one image');
      return;
    }

    if (!formData.title.trim()) {
      setMessage('Please enter a title');
      return;
    }

    try {
      setUploading(true);
      setMessage('');

      const uploadData = new FormData();
      uploadData.append('title', formData.title);
      uploadData.append('description', formData.description);
      uploadData.append('tags', formData.tags);
      
      acceptedFiles.forEach(file => {
        uploadData.append('images', file);
      });

      await comicService.uploadComic(uploadData);
      
      setMessage('Comic uploaded successfully!');
      setFormData({ title: '', description: '', tags: '' });
      acceptedFiles.length = 0;
      
    } catch (error) {
      setMessage('Upload failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="comic-upload">
      <h2>Upload New Comic</h2>
      
      <form onSubmit={handleSubmit} className="upload-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="4"
          />
        </div>

        <div className="form-group">
          <label htmlFor="tags">Tags (comma separated)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            placeholder="fantasy, adventure, comedy"
          />
        </div>

        <div className="form-group">
          <label>Upload Images *</label>
          <div
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'active' : ''}`}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the images here...</p>
            ) : (
              <p>Drag & drop images here, or click to select</p>
            )}
          </div>
          {acceptedFiles.length > 0 && (
            <div className="file-list">
              <h4>Selected files:</h4>
              <ul>
                {acceptedFiles.map(file => (
                  <li key={file.path}>{file.path} - {(file.size / 1024 / 1024).toFixed(2)} MB</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {message && (
          <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <button 
          type="submit" 
          disabled={uploading}
          className="upload-button"
        >
          {uploading ? 'Uploading...' : 'Upload Comic'}
        </button>
      </form>
    </div>
  );
};

export default ComicUpload;