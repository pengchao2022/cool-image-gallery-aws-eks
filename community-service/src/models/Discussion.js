const mongoose = require('mongoose');

const discussionSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 200
  },
  content: { 
    type: String, 
    required: true,
    maxlength: 5000
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  authorName: {
    type: String,
    required: true
  },
  tags: [{ 
    type: String,
    trim: true,
    lowercase: true
  }],
  viewCount: { 
    type: Number, 
    default: 0 
  },
  replyCount: { 
    type: Number, 
    default: 0 
  },
  lastReplyAt: { 
    type: Date, 
    default: Date.now 
  },
  isPinned: { 
    type: Boolean, 
    default: false 
  },
  isLocked: { 
    type: Boolean, 
    default: false 
  }
}, { 
  timestamps: true 
});

// 索引
discussionSchema.index({ createdAt: -1 });
discussionSchema.index({ author: 1, createdAt: -1 });
discussionSchema.index({ tags: 1 });

module.exports = mongoose.model('Discussion', discussionSchema);