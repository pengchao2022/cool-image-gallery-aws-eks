import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Community.css'

const Community = () => {
  const [activeUsers, setActiveUsers] = useState([])
  const [recentComments, setRecentComments] = useState([])
  const [topCreators, setTopCreators] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('discussions')

  // 模拟加载社区数据
  useEffect(() => {
    const loadCommunityData = async () => {
      try {
        setLoading(true)
        
        // 模拟活跃用户数据
        const users = [
          { id: 1, name: '漫画爱好者', avatar: '', comics: 12, followers: 45 },
          { id: 2, name: '创作达人', avatar: '', comics: 28, followers: 120 },
          { id: 3, name: '新晋画家', avatar: '', comics: 5, followers: 23 },
          { id: 4, name: '资深读者', avatar: '', comics: 0, followers: 67 }
        ]

        // 模拟最近评论数据
        const comments = [
          { id: 1, user: '漫画迷', content: '这部作品的画风太棒了！', comic: '星空之旅', time: '2小时前' },
          { id: 2, user: '艺术爱好者', content: '剧情很吸引人，期待更新！', comic: '都市传说', time: '5小时前' },
          { id: 3, user: '新手画家', content: '学习了，这种分镜手法很好', comic: '冒险王', time: '1天前' },
          { id: 4, user: '资深读者', content: '角色塑造很成功，继续加油！', comic: '校园日记', time: '1天前' }
        ]

        // 模拟顶级创作者数据
        const creators = [
          { id: 1, name: '漫画家小明', totalViews: 12500, comics: 15, joinDate: '2023-01-15' },
          { id: 2, name: '创作小能手', totalViews: 8900, comics: 8, joinDate: '2023-03-20' },
          { id: 3, name: '绘画大师', totalViews: 15600, comics: 12, joinDate: '2022-11-08' }
        ]

        setActiveUsers(users)
        setRecentComments(comments)
        setTopCreators(creators)
      } catch (error) {
        console.error('加载社区数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCommunityData()
  }, [])

  if (loading) {
    return (
      <div className="community-page">
        <div className="container">
          <div className="loading-state">
            <p>加载社区数据中...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="community-page">
      <div className="container">
        {/* 页面标题 */}
        <div className="community-header">
          <h1>漫画社区</h1>
          <p>与创作者和读者交流，分享您的想法和见解</p>
        </div>

        {/* 主要内容区域 */}
        <div className="community-layout">
          {/* 左侧主要内容 */}
          <div className="community-main">
            {/* 标签页导航 */}
            <div className="community-tabs">
              <button 
                className={`tab-button ${activeTab === 'discussions' ? 'active' : ''}`}
                onClick={() => setActiveTab('discussions')}
              >
                讨论区
              </button>
              <button 
                className={`tab-button ${activeTab === 'creators' ? 'active' : ''}`}
                onClick={() => setActiveTab('creators')}
              >
                创作者
              </button>
              <button 
                className={`tab-button ${activeTab === 'events' ? 'active' : ''}`}
                onClick={() => setActiveTab('events')}
              >
                社区活动
              </button>
            </div>

            {/* 讨论区内容 */}
            {activeTab === 'discussions' && (
              <div className="tab-content">
                <div className="discussion-list">
                  <h3>热门讨论</h3>
                  <div className="discussion-item">
                    <div className="discussion-header">
                      <span className="discussion-title">大家最近在看什么漫画？</span>
                      <span className="discussion-meta">作者: 漫画迷 • 回复: 24 • 浏览: 156</span>
                    </div>
                    <p className="discussion-preview">来分享一下最近在追的漫画作品吧！我先来：《星空之旅》的画风真的很精致...</p>
                  </div>

                  <div className="discussion-item">
                    <div className="discussion-header">
                      <span className="discussion-title">绘画技巧交流帖</span>
                      <span className="discussion-meta">作者: 创作达人 • 回复: 18 • 浏览: 98</span>
                    </div>
                    <p className="discussion-preview">有没有好的数位板推荐？想开始学习数字绘画...</p>
                  </div>

                  <div className="discussion-item">
                    <div className="discussion-header">
                      <span className="discussion-title">剧情创作讨论</span>
                      <span className="discussion-meta">作者: 故事编剧 • 回复: 12 • 浏览: 67</span>
                    </div>
                    <p className="discussion-preview">大家觉得什么样的剧情最吸引读者？来聊聊你的想法...</p>
                  </div>
                </div>

                <div className="create-discussion">
                  <button className="btn btn-primary">
                    <i className="fas fa-plus"></i>
                    发起新讨论
                  </button>
                </div>
              </div>
            )}

            {/* 创作者内容 */}
            {activeTab === 'creators' && (
              <div className="tab-content">
                <h3>推荐创作者</h3>
                <div className="creators-grid">
                  {topCreators.map(creator => (
                    <div key={creator.id} className="creator-card">
                      <div className="creator-avatar">
                        <i className="fas fa-user"></i>
                      </div>
                      <div className="creator-info">
                        <h4>{creator.name}</h4>
                        <div className="creator-stats">
                          <span>作品: {creator.comics}</span>
                          <span>浏览: {(creator.totalViews / 1000).toFixed(1)}k</span>
                        </div>
                        <p>加入时间: {creator.joinDate}</p>
                      </div>
                      <button className="btn btn-outline btn-small">关注</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 社区活动内容 */}
            {activeTab === 'events' && (
              <div className="tab-content">
                <h3>近期活动</h3>
                <div className="events-list">
                  <div className="event-item">
                    <div className="event-date">
                      <span className="event-month">10月</span>
                      <span className="event-day">25</span>
                    </div>
                    <div className="event-details">
                      <h4>万圣节主题漫画创作大赛</h4>
                      <p>创作你的万圣节主题漫画，赢取精美奖品！</p>
                      <span className="event-status">进行中</span>
                    </div>
                  </div>

                  <div className="event-item">
                    <div className="event-date">
                      <span className="event-month">11月</span>
                      <span className="event-day">15</span>
                    </div>
                    <div className="event-details">
                      <h4>新手绘画指导讲座</h4>
                      <p>专业画家在线指导漫画绘画基础技巧</p>
                      <span className="event-status upcoming">即将开始</span>
                    </div>
                  </div>

                  <div className="event-item">
                    <div className="event-date">
                      <span className="event-month">12月</span>
                      <span className="event-day">01</span>
                    </div>
                    <div className="event-details">
                      <h4>年度漫画评选活动</h4>
                      <p>投票选出你最喜欢的年度漫画作品</p>
                      <span className="event-status upcoming">即将开始</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 右侧边栏 */}
          <div className="community-sidebar">
            {/* 活跃用户 */}
            <div className="sidebar-widget">
              <h3>活跃用户</h3>
              <div className="active-users">
                {activeUsers.map(user => (
                  <div key={user.id} className="user-item">
                    <div className="user-avatar">
                      <i className="fas fa-user"></i>
                    </div>
                    <div className="user-info">
                      <span className="user-name">{user.name}</span>
                      <div className="user-stats">
                        <small>作品: {user.comics}</small>
                        <small>粉丝: {user.followers}</small>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 最新评论 */}
            <div className="sidebar-widget">
              <h3>最新评论</h3>
              <div className="recent-comments">
                {recentComments.map(comment => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-header">
                      <span className="comment-user">{comment.user}</span>
                      <span className="comment-time">{comment.time}</span>
                    </div>
                    <p className="comment-content">{comment.content}</p>
                    <div className="comment-comic">
                      作品: <Link to={`/comic/1`}>{comment.comic}</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 社区统计 */}
            <div className="sidebar-widget">
              <h3>社区统计</h3>
              <div className="community-stats">
                <div className="stat-item">
                  <span className="stat-number">1,254</span>
                  <span className="stat-label">总用户数</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">568</span>
                  <span className="stat-label">漫画作品</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">3,842</span>
                  <span className="stat-label">总评论数</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Community