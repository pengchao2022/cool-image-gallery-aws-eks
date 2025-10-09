import React, { useState, useEffect } from 'react';
import ComicList from '../components/comics/ComicList';
import { comicService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './Browse.css';

const Browse = () => {
  const [comics, setComics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchComics();
  }, [currentPage]);

  const fetchComics = async () => {
    try {
      setLoading(true);
      const response = await comicService.getAllComics(currentPage, 12);
      setComics(response.data.comics);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError('Failed to load comics');
      console.error('Error fetching comics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="browse-page">
      <div className="container">
        <h1>Browse Comics</h1>
        <ComicList 
          comics={comics} 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default Browse;