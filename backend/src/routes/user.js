import express from 'express';
import * as userController from '../controllers/userController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.put('/profile', userController.updateProfile);
router.post('/plan', userController.upgradePlan);
router.get('/usage', userController.getUsageHistory);

export default router;
