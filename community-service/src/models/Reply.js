// src/models/Reply.js
const pool = require('../config/database');

const Reply = {
  async find(query = {}) {
    try {
      const { discussion } = query;
      let sql = 'SELECT * FROM replies WHERE 1=1';
      const params = [];
      
      if (discussion) {
        sql += ' AND discussion_id = $1';
        params.push(discussion);
      }
      
      sql += ' ORDER BY created_at ASC';
      
      const result = await pool.query(sql, params);
      return result.rows;
    } catch (error) {
      console.error('Error in Reply.find:', error);
      return [];
    }
  },

  async create(replyData) {
    try {
      const { content, author, authorName, discussion } = replyData;
      const result = await pool.query(
        `INSERT INTO replies (content, author, author_name, discussion_id, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *`,
        [content, author, authorName, discussion]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error in Reply.create:', error);
      throw error;
    }
  }
};

module.exports = Reply;