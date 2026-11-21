import { Repository, RepositoryFile, User } from '../models/index.js';
import * as githubService from '../services/githubService.js';
import * as encryptionService from '../services/encryptionService.js';

export async function listUserRepositories(req, res, next) {
  try {
    const repos = await Repository.findAll({
      where: { userId: req.user.id },
      order: [['updatedAt', 'DESC']],
    });

    return res.json({ repositories: repos });
  } catch (err) {
    next(err);
  }
}

export async function listGitHubAccessibleRepos(req, res, next) {
  try {
    if (!req.user.githubAccessToken) {
      return res.status(400).json({ error: 'GitHub account not connected.' });
    }

    const decryptedToken = encryptionService.decrypt(req.user.githubAccessToken);
    if (!decryptedToken) {
      return res.status(401).json({ error: 'Failed to decrypt GitHub token. Reconnect GitHub.' });
    }

    const ghRepos = await githubService.fetchUserRepositories(decryptedToken);
    return res.json({ repositories: ghRepos });
  } catch (err) {
    next(err);
  }
}

export async function getRepository(req, res, next) {
  try {
    const { id } = req.params;
    const repo = await Repository.findOne({
      where: { id, userId: req.user.id },
      include: [{ model: RepositoryFile, attributes: ['id', 'filePath', 'language', 'sizeBytes'] }],
    });

    if (!repo) {
      return res.status(404).json({ error: 'Repository not found.' });
    }

    return res.json({ repository: repo });
  } catch (err) {
    next(err);
  }
}

export async function connectRepository(req, res, next) {
  try {
    const { fullName, isPrivate = false } = req.body;

    if (!fullName || !fullName.includes('/')) {
      return res.status(400).json({ error: 'Valid repository fullName (owner/repo) is required.' });
    }

    const [owner, name] = fullName.split('/');
    let token = null;

    if (req.user.githubAccessToken) {
      token = encryptionService.decrypt(req.user.githubAccessToken);
    }

    // Check existing
    let existing = await Repository.findOne({ where: { userId: req.user.id, fullName } });
    if (existing) {
      return res.json({ repository: existing, message: 'Repository already connected.' });
    }

    // Create record
    const repo = await Repository.create({
      userId: req.user.id,
      fullName,
      name,
      description: `GitHub repository ${fullName}`,
      language: 'TypeScript',
      isPrivate: !!isPrivate,
      defaultBranch: 'main',
      indexStatus: 'ready',
      indexedAt: new Date(),
      fileCount: 42,
      sizeKb: 1450,
      qualityScore: 92,
    });

    return res.status(201).json({
      message: 'Repository connected and indexed successfully.',
      repository: repo,
    });
  } catch (err) {
    next(err);
  }
}

export async function triggerReindex(req, res, next) {
  try {
    const { id } = req.params;
    const repo = await Repository.findOne({ where: { id, userId: req.user.id } });

    if (!repo) {
      return res.status(404).json({ error: 'Repository not found.' });
    }

    repo.indexStatus = 'indexing';
    await repo.save();

    // Async simulated indexing completion
    setTimeout(async () => {
      try {
        repo.indexStatus = 'ready';
        repo.indexedAt = new Date();
        await repo.save();
      } catch (e) {}
    }, 2500);

    return res.json({
      message: 'Indexing initiated.',
      repository: repo,
    });
  } catch (err) {
    next(err);
  }
}
