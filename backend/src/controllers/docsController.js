import { Repository, UsageLog } from '../models/index.js';

export async function generateDocs(req, res, next) {
  try {
    const { id } = req.params;
    const { docType = 'readme' } = req.body;

    const repo = await Repository.findOne({ where: { id, userId: req.user.id } });
    if (!repo) {
      return res.status(404).json({ error: 'Repository not found.' });
    }

    const templates = {
      readme: `# ${repo.name}\n\n> Autonomous repository intelligence, semantic code retrieval, and developer agent engine.\n\n## 🚀 Overview\n\`${repo.name}\` connects to GitHub APIs, indexes source trees into semantic chunks, and serves grounded RAG workflows.\n\n## 📦 Getting Started\n\`\`\`bash\ngit clone https://github.com/${repo.fullName}.git\ncd ${repo.name}\npnpm install\npnpm dev\n\`\`\``,
      architecture: `## 🏗 System Architecture Blueprint\n\n\`\`\`\n[GitHub Webhooks / API]\n         │\n         ▼\n[Node.js / Express Gateway]\n   ├── Auth & Session (JWT + OAuth)\n   └── REST API Endpoints\n         │\n         ▼\n[PostgreSQL 16 + pgvector]\n   ├── repository_files\n   └── code_embeddings (384-dim IVFFlat)\n\`\`\``,
      api: `## 📡 REST API Reference\n\n### Repositories\n- \`GET /api/repos\`: List user repositories\n- \`POST /api/repos\`: Connect GitHub repository\n\n### AI RAG Chat\n- \`POST /api/chat/sessions/:id/messages\`: Grounded query with line citations`,
      onboarding: `## 🧭 Developer Onboarding Guide\n\n### 1. Prerequisites\n- Node.js v20+\n- PostgreSQL with pgvector\n\n### 2. Environment Setup\n\`\`\`bash\ncp .env.example .env\npnpm install\npnpm dev\n\`\`\``,
    };

    const content = templates[docType] || templates.readme;

    await UsageLog.create({
      userId: req.user.id,
      action: 'generate_docs',
      repositoryId: repo.id,
      tokensUsed: 180,
    });

    return res.json({
      repositoryId: repo.id,
      docType,
      markdown: content,
    });
  } catch (err) {
    next(err);
  }
}
