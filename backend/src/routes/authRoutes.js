import express from 'express';
import * as authController from '../controllers/authController.js';
import { getMe,getUsername } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', authController.login);
router.post('/signup', authController.signup);
router.get('/getMe', protect, getMe);
router.get('/getUsername',protect, getUsername);

export default router;
