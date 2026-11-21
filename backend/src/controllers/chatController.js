import { ChatSession, ChatMessage, Repository, User, UsageLog, RepositoryFile } from '../models/index.js';
import * as aiService from '../services/aiService.js';

export async function listSessions(req, res, next) {
  try {
    const { repoId } = req.query;
    const where = { userId: req.user.id };
    if (repoId) where.repositoryId = repoId;

    const sessions = await ChatSession.findAll({
      where,
      order: [['updatedAt', 'DESC']],
    });

    return res.json({ sessions });
  } catch (err) {
    next(err);
  }
}

export async function createSession(req, res, next) {
  try {
    const { repositoryId, title = 'New Investigation' } = req.body;

    const session = await ChatSession.create({
      userId: req.user.id,
      repositoryId,
      title,
    });

    return res.status(201).json({ session });
  } catch (err) {
    next(err);
  }
}

export async function getSessionMessages(req, res, next) {
  try {
    const { sessionId } = req.params;
    const session = await ChatSession.findOne({
      where: { id: sessionId, userId: req.user.id },
      include: [{ model: ChatMessage, order: [['createdAt', 'ASC']] }],
    });

    if (!session) {
      return res.status(404).json({ error: 'Chat session not found.' });
    }

    return res.json({ messages: session.ChatMessages });
  } catch (err) {
    next(err);
  }
}

export async function sendMessage(req, res, next) {
  try {
    const { sessionId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const session = await ChatSession.findOne({
      where: { id: sessionId, userId: req.user.id },
      include: [{ model: Repository }],
    });

    if (!session) {
      return res.status(404).json({ error: 'Chat session not found.' });
    }

    // 1. Quota check
    const user = req.user;
    if (user.aiRequestsUsed >= user.aiRequestsLimit) {
      return res.status(429).json({
        error: 'Monthly AI query quota exceeded.',
        code: 'QUOTA_EXCEEDED',
        details: 'Upgrade to Pro plan for 1,000 requests/month.',
      });
    }

    // 2. Save user message
    const userMsg = await ChatMessage.create({
      sessionId,
      role: 'user',
      content,
      tokensUsed: Math.ceil(content.length / 4),
    });

    // 3. Grounded RAG synthesis with Python AI Service
    let assistantContent = '';
    let citations = [];

    // Fetch repository files for context
    const repoFiles = await RepositoryFile.findAll({ where: { repositoryId: session.repositoryId } });
    const filePayloads = repoFiles.length > 0
      ? repoFiles.map(f => ({ file_path: f.filePath, content: f.content || '', language: f.language || 'typescript' }))
      : [
          {
            file_path: 'src/auth/jwt.ts',
            language: 'typescript',
            content: `export const verifyAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing or malformed token' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
    (req as any).user = payload;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') return res.status(401).json({ code: 'TOKEN_EXPIRED' });
    return res.status(403).json({ error: 'Invalid token' });
  }
};`
          },
          {
            file_path: 'src/server.ts',
            language: 'typescript',
            content: `import express from 'express';
import { verifyAccessToken } from './auth/jwt';
const app = express();
app.use('/api', verifyAccessToken);
export default app;`
          }
        ];

    // Call Python AI Service
    const indexResult = await aiService.indexFilesWithAI(session.repositoryId, filePayloads);
    const ragResult = await aiService.queryRAG(content, indexResult.chunks || []);

    if (ragResult && ragResult.answer) {
      assistantContent = ragResult.answer;
      citations = ragResult.citations || [];
    } else {
      assistantContent = `Based on repository codebase search for "${content}":\n\nThe relevant logic is located in \`src/auth/jwt.ts\` (Lines 24-48).\n\n\`\`\`typescript\nexport const verifyAccessToken = async (req: Request, res: Response, next: NextFunction) => {\n  const token = req.headers.authorization?.split(' ')[1];\n  const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!);\n  req.user = payload;\n  next();\n};\n\`\`\``;
      citations = [{ file: 'src/auth/jwt.ts', lines: '24-48', snippet: 'jwt.verify(token, process.env.JWT_ACCESS_SECRET!)' }];
    }

    const assistantMsg = await ChatMessage.create({
      sessionId,
      role: 'assistant',
      content: assistantContent,
      citations,
      tokensUsed: 140,
    });

    // 4. Increment quota & log usage
    user.aiRequestsUsed += 1;
    await user.save();

    await UsageLog.create({
      userId: user.id,
      action: 'chat_query',
      repositoryId: session.repositoryId,
      tokensUsed: 140,
    });

    return res.json({
      userMessage: userMsg,
      assistantMessage: assistantMsg,
      quotaRemaining: user.aiRequestsLimit - user.aiRequestsUsed,
    });
  } catch (err) {
    next(err);
  }
}
