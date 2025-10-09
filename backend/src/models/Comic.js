import { query } from '../config/database.js';

export class Comic {
  static async create(comicData) {
    const { title, description, tags, user_id, image_urls } = comicData;
    
    const result = await query(
      `INSERT INTO comics (title, description, tags, user_id, image_urls, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
       RETURNING *`,
      [title, description, tags, user_id, image_urls]
    );
    
    return result.rows[0];
  }

  static async findAll(page = 1, limit = 12) {
    const offset = (page - 1) * limit;
    
    const comicsResult = await query(
      `SELECT c.*, u.username as author_username,
              (SELECT COUNT(*) FROM comics) as total_count
       FROM comics c
       JOIN users u ON c.user_id = u.id
       ORDER BY c.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
    
    const totalCount = comicsResult.rows[0]?.total_count || 0;
    const totalPages = Math.ceil(totalCount / limit);
    
    return {
      comics: comicsResult.rows.map(row => {
        const { total_count, ...comic } = row;
        return comic;
      }),
      totalPages,
      currentPage: page,
      totalCount
    };
  }

  static async findById(id) {
    const result = await query(
      `SELECT c.*, u.username as author_username
       FROM comics c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async findByUserId(userId, page = 1, limit = 12) {
    const offset = (page - 1) * limit;
    
    const result = await query(
      `SELECT c.*, 
              (SELECT COUNT(*) FROM comics WHERE user_id = $1) as total_count
       FROM comics c
       WHERE c.user_id = $1
       ORDER BY c.created_at DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );
    
    const totalCount = result.rows[0]?.total_count || 0;
    const totalPages = Math.ceil(totalCount / limit);
    
    return {
      comics: result.rows.map(row => {
        const { total_count, ...comic } = row;
        return comic;
      }),
      totalPages,
      currentPage: page,
      totalCount
    };
  }

  static async delete(id, userId) {
    const result = await query(
      'DELETE FROM comics WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );
    return result.rows[0];
  }

  static async search(query, page = 1, limit = 12) {
    const offset = (page - 1) * limit;
    const searchTerm = `%${query}%`;
    
    const result = await query(
      `SELECT c.*, u.username as author_username,
              (SELECT COUNT(*) FROM comics 
               WHERE title ILIKE $1 OR description ILIKE $1 OR tags ILIKE $1) as total_count
       FROM comics c
       JOIN users u ON c.user_id = u.id
       WHERE c.title ILIKE $1 OR c.description ILIKE $1 OR c.tags ILIKE $1
       ORDER BY c.created_at DESC
       LIMIT $2 OFFSET $3`,
      [searchTerm, limit, offset]
    );
    
    const totalCount = result.rows[0]?.total_count || 0;
    const totalPages = Math.ceil(totalCount / limit);
    
    return {
      comics: result.rows.map(row => {
        const { total_count, ...comic } = row;
        return comic;
      }),
      totalPages,
      currentPage: page,
      totalCount
    };
  }
}