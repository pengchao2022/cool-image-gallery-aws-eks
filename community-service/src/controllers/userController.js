const UserActivity = require('../models/userActivity');

exports.getUserActivity = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const activities = await UserActivity.find({ user: userId })
      .populate('targetDiscussion')
      .populate('targetReply')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await UserActivity.countDocuments({ user: userId });

    res.json({
      success: true,
      activities,
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

exports.getLeaderboard = async (req, res) => {
  try {
    const { period = 'weekly' } = req.query;
    let startDate = new Date();

    // 根据周期设置开始日期
    switch (period) {
      case 'daily':
        startDate.setDate(startDate.getDate() - 1);
        break;
      case 'weekly':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    const leaderboard = await UserActivity.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$user',
          totalPoints: { $sum: '$points' },
          activityCount: { $sum: 1 }
        }
      },
      {
        $sort: { totalPoints: -1 }
      },
      {
        $limit: 10
      }
    ]);

    res.json({
      success: true,
      leaderboard,
      period
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};