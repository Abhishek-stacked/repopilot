import express from 'express';
import * as reviewController from '../controllers/reviewController.js';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(requireAuth);
router.post('/:id/review', aiLimiter, reviewController.runCodeReview);

export default router;
