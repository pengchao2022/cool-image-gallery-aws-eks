import express from 'express';
import {
  uploadComic,
  getAllComics,
  getComic,
  getUserComics,
  deleteComic,
  searchComics
} from '../controllers/comicController.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { upload, handleUploadErrors } from '../middleware/upload.js';

const router = express.Router();

router.post('/', authenticate, upload.array('images', 10), handleUploadErrors, uploadComic);
router.get('/', optionalAuth, getAllComics);
router.get('/search', optionalAuth, searchComics);
router.get('/my-comics', authenticate, getUserComics);
router.get('/:id', optionalAuth, getComic);
router.delete('/:id', authenticate, deleteComic);

export default router;