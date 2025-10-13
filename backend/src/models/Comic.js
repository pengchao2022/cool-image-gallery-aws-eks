// src/models/Comic.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Comic = sequelize.define('Comic', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tags: {
    type: DataTypes.STRING,
    allowNull: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  image_urls: {
    type: DataTypes.JSONB, // 或者 DataTypes.ARRAY(DataTypes.STRING)
    allowNull: false
  },
  views: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'comics',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

export default Comic;