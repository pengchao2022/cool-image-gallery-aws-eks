const express = require('express');
const router = express.Router();

// 临时内存存储
let discussions = [];
let nextId = 1;

// 简化的认证中间件
const auth = (req, res, next) => {
  // 临时认证 - 总是通过
  req.user = {
    userId: 'user123',
    username: 'Test User'
  };
  console.log('🔐 Auth middleware executed');
  next();
};

// 简化的验证中间件
const validation = {
  createDiscussion: (req, res, next) => {
    const { title, content } = req.body;
    
    if (!title || title.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }
    
    console.log('✅ Validation passed');
    next();
  }
};

// 简化的控制器
const discussionController = {
  getDiscussions: async (req, res) => {
    try {
      const { page = 1, limit = 20, sort = '-createdAt', search } = req.query;
      
      console.log('📝 Get discussions called with:', { page, limit, search });
      
      let filteredDiscussions = [...discussions];
      
      // 搜索过滤
      if (search) {
        filteredDiscussions = filteredDiscussions.filter(d => 
          d.title.toLowerCase().includes(search.toLowerCase()) || 
          d.content.toLowerCase().includes(search.toLowerCase())
        );
      }
      
      // 排序
      if (sort === '-createdAt') {
        filteredDiscussions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      
      // 分页
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + parseInt(limit);
      const paginatedDiscussions = filteredDiscussions.slice(startIndex, endIndex);
      
      res.json({
        success: true,
        discussions: paginatedDiscussions,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredDiscussions.length,
          pages: Math.ceil(filteredDiscussions.length / limit)
        }
      });
    } catch (error) {
      console.error('❌ Error in getDiscussions:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  },

  getDiscussion: async (req, res) => {
    try {
      const { id } = req.params;
      console.log('📝 Get discussion called with ID:', id);
      
      const discussion = discussions.find(d => d.id == id);
      
      if (!discussion) {
        return res.status(404).json({ 
          success: false, 
          message: 'Discussion not found' 
        });
      }

      // 增加浏览量
      discussion.viewCount = (discussion.viewCount || 0) + 1;
      console.log(`👀 Discussion ${id} view count: ${discussion.viewCount}`);
      
      // 模拟获取回复
      const replies = [];

      res.json({
        success: true,
        discussion,
        replies
      });
    } catch (error) {
      console.error('❌ Error in getDiscussion:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  },

  createDiscussion: async (req, res) => {
    try {
      const { title, content, tags } = req.body;
      
      console.log('📝 Create discussion called with:', { title, content, tags });

      const newDiscussion = {
        id: nextId++,
        title,
        content,
        author: req.user.userId,
        authorName: req.user.username,
        tags: tags || [],
        viewCount: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      discussions.push(newDiscussion);
      
      console.log('✅ Discussion created:', newDiscussion.id);

      // 模拟用户活动记录
      console.log('📊 User activity recorded for discussion creation');

      res.status(201).json({
        success: true,
        message: 'Discussion created successfully',
        discussion: newDiscussion
      });
    } catch (error) {
      console.error('❌ Error in createDiscussion:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }
};

// 路由定义
router.get('/', discussionController.getDiscussions);
router.get('/:id', discussionController.getDiscussion);
router.post('/', auth, validation.createDiscussion, discussionController.createDiscussion);

// 添加一些示例数据（仅开发环境）
if (process.env.NODE_ENV === 'development') {
  discussions = [
    {
      id: 1,
      title: 'Welcome to Community!',
      content: 'This is the first discussion in our community. Feel free to introduce yourself!',
      author: 'system',
      authorName: 'System',
      tags: ['welcome', 'introduction'],
      viewCount: 15,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    },
    {
      id: 2,
      title: 'Best Comic Books of 2024',
      content: 'What are your favorite comic books released this year?',
      author: 'user123',
      authorName: 'Comic Fan',
      tags: ['comics', '2024', 'recommendations'],
      viewCount: 8,
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02')
    }
  ];
  nextId = 3;
  console.log('📚 Loaded example discussions');
}

console.log('✅ Discussion routes loaded successfully');

module.exports = router;