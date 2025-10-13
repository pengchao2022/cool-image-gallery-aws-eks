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
    type: DataTypes.ARRAY(DataTypes.TEXT), // 改为数组类型
    allowNull: false,
    defaultValue: [] // 添加默认值
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