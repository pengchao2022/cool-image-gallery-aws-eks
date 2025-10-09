import { Comic } from '../models/Comic.js';
import { S3Service } from '../utils/s3.js';

export const uploadComic = async (req, res) => {
  try {
    const { title, description, tags } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images provided'
      });
    }

    // Upload images to S3
    const uploadedImages = await S3Service.uploadMultipleImages(files);
    const imageUrls = uploadedImages.map(img => img.url);

    // Create comic record
    const comic = await Comic.create({
      title,
      description: description || '',
      tags: tags || '',
      user_id: req.user.id,
      image_urls: imageUrls
    });

    res.status(201).json({
      success: true,
      message: 'Comic uploaded successfully',
      comic
    });
  } catch (error) {
    console.error('Upload comic error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload comic'
    });
  }
};

export const getAllComics = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    const result = await Comic.findAll(page, limit);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Get comics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comics'
    });
  }
};

export const getComic = async (req, res) => {
  try {
    const { id } = req.params;
    const comic = await Comic.findById(id);

    if (!comic) {
      return res.status(404).json({
        success: false,
        message: 'Comic not found'
      });
    }

    res.json({
      success: true,
      comic
    });
  } catch (error) {
    console.error('Get comic error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch comic'
    });
  }
};

export const getUserComics = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    const result = await Comic.findByUserId(req.user.id, page, limit);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Get user comics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user comics'
    });
  }
};

export const deleteComic = async (req, res) => {
  try {
    const { id } = req.params;

    const comic = await Comic.delete(id, req.user.id);

    if (!comic) {
      return res.status(404).json({
        success: false,
        message: 'Comic not found or access denied'
      });
    }

    // TODO: Delete images from S3

    res.json({
      success: true,
      message: 'Comic deleted successfully'
    });
  } catch (error) {
    console.error('Delete comic error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comic'
    });
  }
};

export const searchComics = async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const result = await Comic.search(q, page, limit);

    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Search comics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search comics'
    });
  }
};