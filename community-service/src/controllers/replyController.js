const Reply = require('../models/Reply');
const Discussion = require('../models/Discussion');
const UserActivity = require('../models/userActivity');

exports.createReply = async (req, res) => {
  try {
    const { content, parentReply } = req.body;
    const discussionId = req.params.id;

    const reply = new Reply({
      content,
      author: req.user.userId,
      authorName: req.user.username,
      discussion: discussionId,
      parentReply: parentReply || null
    });

    await reply.save();

    // 更新讨论的回复数和最后回复时间
    await Discussion.findByIdAndUpdate(discussionId, {
      $inc: { replyCount: 1 },
      lastReplyAt: new Date()
    });

    // 记录用户活动
    await UserActivity.create({
      user: req.user.userId,
      activityType: 'reply_created',
      targetDiscussion: discussionId,
      targetReply: reply._id,
      points: 2
    });

    res.status(201).json({
      success: true,
      message: 'Reply created successfully',
      reply
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

exports.likeReply = async (req, res) => {
  try {
    const reply = await Reply.findById(req.params.id);
    
    if (!reply) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reply not found' 
      });
    }

    const userId = req.user.userId;
    const hasLiked = reply.likes.includes(userId);

    if (hasLiked) {
      // 取消点赞
      reply.likes.pull(userId);
      reply.likeCount -= 1;
    } else {
      // 点赞
      reply.likes.push(userId);
      reply.likeCount += 1;
    }

    await reply.save();

    res.json({
      success: true,
      message: hasLiked ? 'Like removed' : 'Reply liked',
      likeCount: reply.likeCount,
      hasLiked: !hasLiked
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};