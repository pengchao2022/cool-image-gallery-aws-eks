class RealtimeService {
  constructor(io) {
    this.io = io;
  }

  broadcastNewDiscussion(discussion) {
    this.io.emit('new-discussion', discussion);
  }

  broadcastNewReply(discussionId, reply) {
    this.io.to(`discussion:${discussionId}`).emit('new-reply', reply);
  }

  notifyDiscussionUpdate(discussionId, update) {
    this.io.to(`discussion:${discussionId}`).emit('discussion-updated', update);
  }
}

module.exports = RealtimeService;