// src/models/userActivity.js
const pool = require('../config/database');

const UserActivity = {
  async create(activityData) {
    try {
      const { user, activityType, targetDiscussion, points } = activityData;
      const result = await pool.query(
        `INSERT INTO user_activities (user_id, activity_type, target_discussion_id, points, created_at) 
         VALUES ($1, $2, $3, $4, NOW()) RETURNING *`,
        [user, activityType, targetDiscussion, points]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error in UserActivity.create:', error);
      // 不抛出错误，避免影响主要功能
      return {};
    }
  }
};

module.exports = UserActivity;