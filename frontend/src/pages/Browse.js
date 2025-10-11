import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import ComicUpload from '../components/comics/ComicUpload';
import '../App.css';

const Browse = () => {
  const { currentUser } = useContext(AuthContext);
  const [comics, setComics] = useState([
    { id: 1, title: "奇幻冒险", author: "漫画家A", image: "https://picsum.photos/300/200?random=1" },
    { id: 2, title: "科幻未来", author: "漫画家B", image: "https://picsum.photos/300/200?random=2" },
    { id: 3, title: "校园生活", author: "漫画家C", image: "https://picsum.photos/300/200?random=3" },
    { id: 4, title: "武侠传奇", author: "漫画家D", image: "https://picsum.photos/300/200?random=4" },
    { id: 5, title: "悬疑推理", author: "漫画家E", image: "https://picsum.photos/300/200?random=5" },
    { id: 6, title: "浪漫爱情", author: "漫画家F", image: "https://picsum.photos/300/200?random=6" }
  ]);

  const addNewComic = (newComic) => {
    setComics(prevComics => [newComic, ...prevComics]);
  };

  return (
    <>
      {/* 英雄区域 */}
      <section className="hero">
        <div className="container">
          <h1>发现精彩的漫画世界</h1>
          <p>浏览数千部漫画作品，与创作者互动，或者上传您自己的作品与大家分享</p>
          {currentUser && (
            <button 
              className="btn btn-primary"
              onClick={() => document.getElementById('uploadModal').style.display = 'flex'}
            >
              开始上传
            </button>
          )}
          <button className="btn btn-outline">浏览作品</button>
        </div>
      </section>

      {/* 漫画展示区域 */}
      <section className="container">
        <h2 style={{ marginBottom: '20px' }}>热门漫画</h2>
        <div className="comic-grid">
          {comics.map(comic => (
            <div key={comic.id} className="comic-card">
              <img src={comic.image} alt={comic.title} className="comic-image" />
              <div className="comic-info">
                <div className="comic-title">{comic.title}</div>
                <div className="comic-author">作者: {comic.author}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 模态框组件 */}
      <ComicUpload onComicUpload={addNewComic} />
    </>
  );
};

export default Browse;