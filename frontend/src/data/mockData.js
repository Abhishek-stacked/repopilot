// Grounded mock data for development and preview

export const mockChatSessions = [
  {
    id: 'chat_01',
    title: 'Explain Authentication Flow & JWT Handling',
    updatedAt: '10 mins ago',
    messages: [
      {
        id: 'msg_01',
        role: 'user',
        content: 'How is user authentication implemented and what happens when a JWT token expires?',
        timestamp: '10:14 AM'
      },
      {
        id: 'msg_02',
        role: 'assistant',
        content: `User authentication in **repopilot-core** is built with a dual-token JWT architecture (short-lived access tokens + rotating refresh tokens in httpOnly cookies).

### 1. Token Verification & Middleware Flow
The incoming requests pass through \`verifyAccessToken\` in \`src/auth/jwt.ts\`:

\`\`\`typescript
export const verifyAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed authorization token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as UserPayload;
    req.user = payload;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        code: 'TOKEN_EXPIRED', 
        message: 'Access token expired. Refresh using /api/auth/refresh' 
      });
    }
    return res.status(403).json({ error: 'Invalid authentication token' });
  }
};
\`\`\`

### 2. Token Refresh Strategy
When the frontend receives \`TOKEN_EXPIRED\`, the Axios interceptor requests \`/api/auth/refresh\`. The server reads the encrypted refresh token from the cookie, verifies it against the active session in PostgreSQL, and issues a fresh 15-minute access token.`,
        citations: [
          {
            file: 'src/auth/jwt.ts',
            lines: '24-48',
            snippet: 'jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as UserPayload;'
          },
          {
            file: 'src/auth/session.ts',
            lines: '12-35',
            snippet: 'export const refreshUserSession = async (refreshToken: string) => {...}'
          }
        ],
        timestamp: '10:15 AM'
      }
    ]
  },
  {
    id: 'chat_02',
    title: 'Vector Search & pgvector Query Mechanics',
    updatedAt: '2 hours ago',
    messages: [
      {
        id: 'msg_10',
        role: 'user',
        content: 'Where is the vector similarity search executed in the code?',
        timestamp: '08:22 AM'
      },
      {
        id: 'msg_11',
        role: 'assistant',
        content: `The pgvector cosine similarity search is executed in \`src/rag/retriever.ts\` using an optimized IVFFlat index query:

\`\`\`typescript
const results = await db.query(
  \`SELECT id, file_path, start_line, end_line, chunk_text,
          1 - (embedding <=> $1::vector) AS similarity_score
   FROM code_embeddings
   WHERE repository_id = $2
   ORDER BY embedding <=> $1::vector ASC
   LIMIT $3\`,
  [formattedEmbedding, repoId, topK]
);
\`\`\`

It computes cosine distance (\`<=>\`) and returns the top matches ordered by nearest vector similarity.`,
        citations: [
          {
            file: 'src/rag/retriever.ts',
            lines: '42-63',
            snippet: '1 - (embedding <=> $1::vector) AS similarity_score'
          }
        ],
        timestamp: '08:23 AM'
      }
    ]
  }
];

export const mockCodeReviewFindings = [
  {
    id: 'rev_01',
    severity: 'critical', // 'critical' | 'warning' | 'info'
    category: 'Security Vulnerability',
    file: 'src/indexing/chunker.ts',
    line: 87,
    title: 'Potential ReDoS in Regex Pattern Matching',
    description: 'Catastrophic backtracking vulnerability detected in nested quantifier expression `/(def|class)\\s+([a-zA-Z0-9_]+(\\s*<.*>)?)/g`. An adversarial code file can cause CPU exhaustion.',
    codeSnippet: 'const match = line.match(/(def|class)\\s+([a-zA-Z0-9_]+(\\s*<.*>)?)/g);',
    suggestion: 'const match = line.match(/(?:def|class)\\s+([a-zA-Z_][a-zA-Z0-9_]*)/);',
    impact: 'Denial of Service during background repository indexing jobs.'
  },
  {
    id: 'rev_02',
    severity: 'warning',
    category: 'Code Smell',
    file: 'src/auth/oauth.ts',
    line: 112,
    title: 'Missing GitHub State Parameter Validation (CSRF)',
    description: 'The OAuth callback handler does not cross-verify the returned `state` query parameter against the cryptographically generated nonce stored in the user session.',
    codeSnippet: 'const { code } = req.query;\nconst tokenRes = await exchangeGitHubCode(code as string);',
    suggestion: 'const { code, state } = req.query;\nif (!req.session.oauthState || req.session.oauthState !== state) throw new AuthError("CSRF detected");',
    impact: 'Enables potential cross-site request forgery attacks during GitHub account linking.'
  },
  {
    id: 'rev_03',
    severity: 'warning',
    category: 'Performance',
    file: 'src/rag/retriever.ts',
    line: 154,
    title: 'N+1 Query Pattern in Citation Hydration',
    description: 'File metadata is being queried inside a synchronous loop over vector results instead of utilizing a single batch `IN (...)` SQL query.',
    codeSnippet: 'for (const r of results) {\n  const fileMeta = await db.query("SELECT * FROM files WHERE id = $1", [r.fileId]);\n}',
    suggestion: 'const fileIds = results.map(r => r.fileId);\nconst fileMetaList = await db.query("SELECT * FROM files WHERE id = ANY($1)", [fileIds]);',
    impact: 'Adds 200-400ms latency to every user AI chat message retrieval step.'
  },
  {
    id: 'rev_04',
    severity: 'info',
    category: 'Duplicate Code',
    file: 'src/auth/session.ts',
    line: 45,
    title: 'Duplicate Token Decoding Logic',
    description: 'Duplicate 24-line base64 payload decoding logic detected between `session.ts` and `jwt.ts` (98% cosine token similarity).',
    codeSnippet: 'const decoded = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());',
    suggestion: 'Centralize decoding logic in `src/utils/tokenDecoder.ts` to reduce maintenance surface.',
    impact: 'Violates DRY principle and risks divergent bug fixes.'
  }
];

export const mockGeneratedDocs = {
  readme: `# repopilot-core

> Autonomous repository intelligence, semantic code retrieval, and developer agent engine.

## 🚀 Overview
\`repopilot-core\` powers deep repository understanding by connecting to GitHub APIs, indexing source trees into semantic chunks, and serving grounded RAG workflows with pinpoint source citations.

## 🛠 Key Modules
- **\`src/auth\`**: Multi-tenant OAuth & dual-token JWT lifecycle.
- **\`src/indexing\`**: AST-aware chunking with line number tracking and vector storage.
- **\`src/rag\`**: Hybrid BM25 + pgvector cosine retrieval pipeline.

## 📦 Getting Started
\`\`\`bash
git clone https://github.com/repopilot/repopilot-core.git
cd repopilot-core
pnpm install
pnpm dev
\`\`\`
`,
  architecture: `## 🏗 System Architecture Diagram

\`\`\`
[GitHub Webhooks / API]
         │
         ▼
[Node.js / Express Gateway]
   ├── Auth & Session (JWT + OAuth)
   ├── Rate Limiter (Redis)
   └── Job Dispatcher (BullMQ)
         │
         ▼
[Python ML & RAG Service (FastAPI)]
   ├── AST Chunker (Language Aware)
   ├── all-MiniLM-L6-v2 Embeddings
   └── Hybrid Ranker (BM25 + Cosine)
         │
         ▼
[PostgreSQL 16 + pgvector]
   ├── repository_files
   └── code_embeddings (384-dim IVFFlat)
\`\`\`

### Data Ingestion Sequence
1. **Fetch**: User connects GitHub repo; recursive Git tree is traversed.
2. **Chunk**: AST boundary parser splits functions and classes preserving line numbers.
3. **Embed**: 384-dimensional vector embeddings generated via Sentence Transformers.
4. **Index**: Upserted into PostgreSQL \`code_embeddings\` table with cosine index.
`,
  api: `## 📡 REST API Reference

### Repositories
- **\`GET /api/repos\`**: List all user indexed repositories.
- **\`POST /api/repos\`**: Register and initiate indexing for a GitHub repository.
- **\`GET /api/repos/:id/analytics\`**: Fetch code health, languages, and quality metrics.

### AI RAG Chat
- **\`POST /api/chat/sessions\`**: Initialize a chat session for a repository.
- **\`POST /api/chat/sessions/:id/messages\`**: Send a question; returns grounded answer with file:line citations.

### Code Intelligence
- **\`POST /api/repos/:id/review\`**: Trigger static + ML code review scan.
- **\`POST /api/repos/:id/tests\`**: Generate unit test suites for target functions.
`,
  onboarding: `## 🧭 Developer Onboarding Guide

Welcome to the team! Follow this checklist to set up your local development environment:

### 1. Prerequisites
- **Node.js** v20+ & **pnpm** v9+
- **Python** 3.10+
- **PostgreSQL** with \`pgvector\` extension enabled
- **Docker** & Docker Compose

### 2. Environment Configuration
Copy \`.env.example\` to \`.env\` and configure:
\`\`\`env
GITHUB_CLIENT_ID=your_id
GITHUB_CLIENT_SECRET=your_secret
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://postgres:password@localhost:5432/repopilot
\`\`\`

### 3. Verification Test Run
\`\`\`bash
pnpm test
\`\`\`
`
};

export const mockTestGeneration = {
  functionName: 'verifyAccessToken',
  filePath: 'src/auth/jwt.ts',
  language: 'TypeScript / Jest',
  generatedTests: `import { verifyAccessToken } from '../src/auth/jwt';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

describe('verifyAccessToken middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let nextFn: NextFunction;

  beforeEach(() => {
    mockReq = { headers: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFn = jest.fn();
    process.env.JWT_ACCESS_SECRET = 'test-secret-key';
  });

  test('should return 401 when Authorization header is absent', async () => {
    await verifyAccessToken(mockReq as Request, mockRes as Response, nextFn);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringMatching(/missing or malformed/i) })
    );
    expect(nextFn).not.toHaveBeenCalled();
  });

  test('should return 401 with TOKEN_EXPIRED code when jwt is expired', async () => {
    mockReq.headers = { authorization: 'Bearer expired.token.signature' };
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      const error: any = new Error('jwt expired');
      error.name = 'TokenExpiredError';
      throw error;
    });

    await verifyAccessToken(mockReq as Request, mockRes as Response, nextFn);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'TOKEN_EXPIRED' })
    );
  });

  test('should populate req.user and call next() on valid token', async () => {
    mockReq.headers = { authorization: 'Bearer valid.jwt.token' };
    const mockUserPayload = { id: 'u_123', email: 'test@repopilot.io' };
    jest.spyOn(jwt, 'verify').mockReturnValue(mockUserPayload as any);

    await verifyAccessToken(mockReq as Request, mockRes as Response, nextFn);

    expect((mockReq as any).user).toEqual(mockUserPayload);
    expect(nextFn).toHaveBeenCalledTimes(1);
  });
});
`
};
