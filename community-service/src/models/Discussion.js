// src/models/Discussion.js
const pool = require('../config/database');

const Discussion = {
  async find(query = {}) {
    try {
      const { page = 1, limit = 20, search } = query;
      let sql = 'SELECT * FROM discussions WHERE 1=1';
      const params = [];
      let paramCount = 0;
      
      if (search) {
        paramCount++;
        sql += ` AND (title ILIKE $${paramCount} OR content ILIKE $${paramCount})`;
        params.push(`%${search}%`);
      }
      
      paramCount++;
      paramCount++;
      sql += ` ORDER BY created_at DESC LIMIT $${paramCount - 1} OFFSET $${paramCount}`;
      params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
      
      console.log('Executing query:', sql, params);
      const result = await pool.query(sql, params);
      return result.rows;
    } catch (error) {
      console.error('Error in Discussion.find:', error);
      throw error;
    }
  },

  async findById(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM discussions WHERE id = $1', 
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error in Discussion.findById:', error);
      throw error;
    }
  },

  async countDocuments(query = {}) {
    try {
      const { search } = query;
      let sql = 'SELECT COUNT(*) FROM discussions WHERE 1=1';
      const params = [];
      
      if (search) {
        sql += ' AND (title ILIKE $1 OR content ILIKE $1)';
        params.push(`%${search}%`);
      }
      
      const result = await pool.query(sql, params);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error in Discussion.countDocuments:', error);
      throw error;
    }
  },

  async create(discussionData) {
    try {
      const { title, content, author, authorName, tags = [] } = discussionData;
      const result = await pool.query(
        `INSERT INTO discussions (title, content, author, author_name, tags, view_count, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) RETURNING *`,
        [title, content, author, authorName, tags, 0]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error in Discussion.create:', error);
      throw error;
    }
  },

  async updateViewCount(id) {
    try {
      await pool.query(
        'UPDATE discussions SET view_count = view_count + 1, updated_at = NOW() WHERE id = $1',
        [id]
      );
    } catch (error) {
      console.error('Error in Discussion.updateViewCount:', error);
      throw error;
    }
  },

  async save() {
    // 为了兼容性保留空方法
    return this;
  }
};

module.exports = Discussion;