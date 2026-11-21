import express from 'express';
import * as authController from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/signup', authLimiter, authController.signup);
router.post('/login', authLimiter, authController.login);
router.get('/github', authController.githubOAuth);
router.get('/github/callback', authController.githubCallback);
router.get('/me', requireAuth, authController.getMe);
router.post('/logout', requireAuth, authController.logout);

export default router;
