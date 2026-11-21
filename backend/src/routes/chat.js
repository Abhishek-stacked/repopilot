import express from 'express';
import * as chatController from '../controllers/chatController.js';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(requireAuth);

router.get('/sessions', chatController.listSessions);
router.post('/sessions', chatController.createSession);
router.get('/sessions/:sessionId/messages', chatController.getSessionMessages);
router.post('/sessions/:sessionId/messages', aiLimiter, chatController.sendMessage);

export default router;
