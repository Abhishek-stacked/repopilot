import express from 'express';
import * as docsController from '../controllers/docsController.js';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(requireAuth);
router.post('/:id/docs', aiLimiter, docsController.generateDocs);

export default router;
