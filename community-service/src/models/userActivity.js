const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  activityType: {
    type: String,
    enum: ['discussion_created', 'reply_created', 'like_given'],
    required: true
  },
  targetDiscussion: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Discussion' 
  },
  targetReply: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Reply' 
  },
  points: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true 
});

// 索引
userActivitySchema.index({ user: 1, createdAt: -1 });
userActivitySchema.index({ createdAt: -1 });

module.exports = mongoose.model('UserActivity', userActivitySchema);