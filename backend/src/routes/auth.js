import express from 'express';
import {
  register,
  login,
  getProfile,
  verifyToken
} from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validateRegistration, validateLogin } from '../middleware/validation.js';

const router = express.Router();

router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.get('/verify', authenticate, verifyToken);
router.get('/profile', authenticate, getProfile);

export default router;