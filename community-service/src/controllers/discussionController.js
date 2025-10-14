const Discussion = require('../models/Discussion');
const Reply = require('../models/Reply');
const UserActivity = require('../models/userActivity');

exports.getDiscussions = async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = '-createdAt', search } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    const discussions = await Discussion.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Discussion.countDocuments(query);

    res.json({
      success: true,
      discussions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.getDiscussion = async (req, res) => {
  try {
    const discussion = await Discussion.findById(req.params.id);
    
    if (!discussion) {
      return res.status(404).json({ 
        success: false, 
        message: 'Discussion not found' 
      });
    }

    // 增加浏览量
    discussion.viewCount += 1;
    await discussion.save();

    const replies = await Reply.find({ discussion: req.params.id })
      .sort('createdAt')
      .exec();

    res.json({
      success: true,
      discussion,
      replies
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.createDiscussion = async (req, res) => {
  try {
    const { title, content, tags } = req.body;

    const discussion = new Discussion({
      title,
      content,
      author: req.user.userId,
      authorName: req.user.username,
      tags: tags || []
    });

    await discussion.save();

    // 记录用户活动
    await UserActivity.create({
      user: req.user.userId,
      activityType: 'discussion_created',
      targetDiscussion: discussion._id,
      points: 5
    });

    res.status(201).json({
      success: true,
      message: 'Discussion created successfully',
      discussion
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};