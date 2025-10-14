const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  content: { 
    type: String, 
    required: true,
    maxlength: 2000
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
  discussion: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Discussion', 
    required: true 
  },
  parentReply: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Reply' 
  },
  likes: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }],
  likeCount: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true 
});

// 索引
replySchema.index({ discussion: 1, createdAt: 1 });
replySchema.index({ author: 1, createdAt: -1 });

module.exports = mongoose.model('Reply', replySchema);