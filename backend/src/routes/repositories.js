import express from 'express';
import * as repoController from '../controllers/repoController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', repoController.listUserRepositories);
router.get('/github/accessible', repoController.listGitHubAccessibleRepos);
router.post('/', repoController.connectRepository);
router.get('/:id', repoController.getRepository);
router.post('/:id/index', repoController.triggerReindex);

export default router;
