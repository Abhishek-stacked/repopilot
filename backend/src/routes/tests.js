import express from 'express';
import * as testsController from '../controllers/testsController.js';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.use(requireAuth);
router.post('/:id/tests', aiLimiter, testsController.generateTests);

export default router;
