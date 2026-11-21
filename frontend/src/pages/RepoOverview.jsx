import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Star, 
  GitFork, 
  RefreshCw, 
  Bot, 
  ShieldAlert, 
  FileText, 
  TestTube2,
  Folder,
  FileCode2,
  ChevronRight,
  GitBranch,
  CheckCircle2,
  BarChart2,
  Layers,
  Sparkles
} from 'lucide-react';
import { Github } from '../components/ui/GithubIcon';
import { useRepoStore } from '../stores/useRepoStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { CodeBlock } from '../components/ui/CodeBlock';

export const RepoOverview = () => {
  const { id } = useParams();
  const { selectedRepo, fileTree, triggerReindex } = useRepoStore();
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'tree' | 'analytics'
  const [selectedFile, setSelectedFile] = useState('src/auth/jwt.ts');

  const filePreviewMap = {
    'src/auth/jwt.ts': `import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export interface UserPayload {
  id: string;
  email: string;
  plan: 'free' | 'pro';
}

export const verifyAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed authorization header' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as UserPayload;
    (req as any).user = payload;
    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ code: 'TOKEN_EXPIRED', message: 'Access token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
};`,
    'src/indexing/chunker.ts': `import { CodeChunk } from '../types';

export function splitCodeByAST(code: string, language: string): CodeChunk[] {
  // Splits source code into AST chunks respecting function and class boundaries
  const lines = code.split('\\n');
  const chunks: CodeChunk[] = [];
  let currentChunkLines: string[] = [];
  let startLine = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    currentChunkLines.push(line);

    if (currentChunkLines.length >= 40 || line.startsWith('export class') || line.startsWith('export function')) {
      chunks.push({
        text: currentChunkLines.join('\\n'),
        startLine,
        endLine: i + 1,
      });
      currentChunkLines = [];
      startLine = i + 2;
    }
  }
  return chunks;
}`,
  };

  const currentPreviewCode = filePreviewMap[selectedFile] || `// File: ${selectedFile}\n// Content indexed into 384-dimensional vector embeddings.\nexport default {};`;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1f2433]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Github className="w-6 h-6 text-indigo-400" />
              <span>{selectedRepo?.name}</span>
            </h1>
            <Badge variant="primary">{selectedRepo?.language}</Badge>
            <Badge variant={selectedRepo?.indexStatus === 'ready' ? 'success' : 'warning'}>
              {selectedRepo?.indexStatus === 'ready' ? 'AST Indexed' : 'Indexing'}
            </Badge>
          </div>
          <p className="text-xs text-gray-400 mt-1 max-w-2xl">{selectedRepo?.description}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => triggerReindex(selectedRepo?.id)}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${selectedRepo?.indexStatus === 'indexing' ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Re-Index</span>
          </Button>
          <Link to={`/repo/${selectedRepo?.id}/chat`}>
            <Button variant="primary" size="sm" className="gap-1.5">
              <Bot className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#212638] pb-1">
        {[
          { id: 'overview', label: 'Overview & Health' },
          { id: 'tree', label: 'File Tree & Source' },
          { id: 'analytics', label: 'AST & Metrics' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-xs font-medium rounded-t-lg transition-colors cursor-pointer border-b-2 ${
              activeTab === tab.id
                ? 'border-indigo-500 text-white bg-[#141724]'
                : 'border-transparent text-gray-400 hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-[#23283a]">
              <div className="text-xs text-gray-400">Quality Score</div>
              <div className="text-3xl font-extrabold text-emerald-400 mt-1">
                {selectedRepo?.qualityScore}/100
              </div>
              <p className="text-[11px] text-gray-500 mt-1">Automated AST & static analysis</p>
            </Card>

            <Card className="border-[#23283a]">
              <div className="text-xs text-gray-400">Identified Bugs</div>
              <div className="text-3xl font-extrabold text-rose-400 mt-1">
                {selectedRepo?.metrics?.bugs}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">1 potential ReDoS vulnerability</p>
            </Card>

            <Card className="border-[#23283a]">
              <div className="text-xs text-gray-400">Code Smells</div>
              <div className="text-3xl font-extrabold text-amber-400 mt-1">
                {selectedRepo?.metrics?.codeSmells}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">N+1 queries & unvalidated state</p>
            </Card>

            <Card className="border-[#23283a]">
              <div className="text-xs text-gray-400">Total Files</div>
              <div className="text-3xl font-extrabold text-white mt-1">
                {selectedRepo?.fileCount}
              </div>
              <p className="text-[11px] text-gray-500 mt-1">{selectedRepo?.sizeKb} KB source size</p>
            </Card>
          </div>

          {/* Languages & Shortcuts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <Card className="lg:col-span-6 border-[#23283a] space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Language Breakdown
              </h3>
              <div className="space-y-3">
                {selectedRepo?.languages.map((l) => (
                  <div key={l.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-200">{l.name}</span>
                      <span className="text-gray-400 font-mono">{l.percentage}%</span>
                    </div>
                    <div className="w-full bg-[#1e2333] h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${l.percentage}%`, backgroundColor: l.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="lg:col-span-6 border-[#23283a] space-y-3 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Recommended Next Actions
                </h3>
                <div className="space-y-2">
                  <Link to={`/repo/${selectedRepo?.id}/review`} className="flex items-center justify-between p-2.5 rounded-lg bg-[#161a26] hover:bg-[#1f2436] transition-colors">
                    <div className="flex items-center gap-2.5 text-xs text-gray-200">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <span>Resolve Critical ReDoS Bug in <code className="text-indigo-300 font-mono">chunker.ts</code></span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </Link>

                  <Link to={`/repo/${selectedRepo?.id}/tests`} className="flex items-center justify-between p-2.5 rounded-lg bg-[#161a26] hover:bg-[#1f2436] transition-colors">
                    <div className="flex items-center gap-2.5 text-xs text-gray-200">
                      <TestTube2 className="w-4 h-4 text-emerald-400" />
                      <span>Generate Missing Unit Tests for <code className="text-indigo-300 font-mono">verifyAccessToken</code></span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </Link>

                  <Link to={`/repo/${selectedRepo?.id}/docs`} className="flex items-center justify-between p-2.5 rounded-lg bg-[#161a26] hover:bg-[#1f2436] transition-colors">
                    <div className="flex items-center gap-2.5 text-xs text-gray-200">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <span>Generate Project Architecture & Onboarding Docs</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                  </Link>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-800/30 text-[11px] text-indigo-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 flex-shrink-0" />
                <span>All source files are indexed with sentence-transformers 384-dimensional embeddings.</span>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 2: File Tree */}
      {activeTab === 'tree' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[500px]">
          {/* Tree selector */}
          <Card className="lg:col-span-4 border-[#23283a] p-3 overflow-y-auto">
            <div className="text-[11px] uppercase tracking-wider text-gray-500 font-semibold mb-2 px-2">
              Repository Tree
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex items-center gap-1.5 px-2 py-1 text-gray-300 font-medium">
                <Folder className="w-4 h-4 text-indigo-400" />
                <span>src</span>
              </div>
              <div className="pl-4 space-y-1">
                <div className="flex items-center gap-1.5 px-2 py-1 text-gray-400 font-medium">
                  <Folder className="w-3.5 h-3.5 text-indigo-400" />
                  <span>auth</span>
                </div>
                <div className="pl-4 space-y-0.5">
                  <button
                    onClick={() => setSelectedFile('src/auth/jwt.ts')}
                    className={`w-full flex items-center justify-between px-2 py-1 rounded text-left cursor-pointer ${
                      selectedFile === 'src/auth/jwt.ts' ? 'bg-indigo-600/20 text-indigo-300' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-mono text-[11px]">
                      <FileCode2 className="w-3.5 h-3.5" /> jwt.ts
                    </span>
                    <span className="text-[10px] text-gray-500">142 L</span>
                  </button>
                  <button
                    onClick={() => setSelectedFile('src/auth/oauth.ts')}
                    className={`w-full flex items-center justify-between px-2 py-1 rounded text-left cursor-pointer ${
                      selectedFile === 'src/auth/oauth.ts' ? 'bg-indigo-600/20 text-indigo-300' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-mono text-[11px]">
                      <FileCode2 className="w-3.5 h-3.5" /> oauth.ts
                    </span>
                    <span className="text-[10px] text-gray-500">98 L</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 px-2 py-1 text-gray-400 font-medium">
                  <Folder className="w-3.5 h-3.5 text-indigo-400" />
                  <span>indexing</span>
                </div>
                <div className="pl-4 space-y-0.5">
                  <button
                    onClick={() => setSelectedFile('src/indexing/chunker.ts')}
                    className={`w-full flex items-center justify-between px-2 py-1 rounded text-left cursor-pointer ${
                      selectedFile === 'src/indexing/chunker.ts' ? 'bg-indigo-600/20 text-indigo-300' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-mono text-[11px]">
                      <FileCode2 className="w-3.5 h-3.5" /> chunker.ts
                    </span>
                    <span className="text-[10px] text-gray-500">210 L</span>
                  </button>
                </div>
              </div>
            </div>
          </Card>

          {/* File code preview */}
          <div className="lg:col-span-8">
            <Card className="border-[#23283a] p-0 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#141724] border-b border-[#23283a]">
                <div className="flex items-center gap-2 font-mono text-xs text-gray-300">
                  <FileCode2 className="w-4 h-4 text-indigo-400" />
                  <span>{selectedFile}</span>
                </div>
                <Badge variant="primary" size="xs">pgvector Indexed</Badge>
              </div>
              <div className="p-4">
                <CodeBlock code={currentPreviewCode} language="typescript" title={selectedFile} />
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 3: Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-[#23283a] space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
                <BarChart2 className="w-4 h-4" />
                <span>AST Chunk Density</span>
              </div>
              <div className="text-2xl font-bold text-white">4.8 chunks / file</div>
              <p className="text-xs text-gray-400">Target token size: 400 with 50-token overlap</p>
            </Card>

            <Card className="border-[#23283a] space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Test Coverage</span>
              </div>
              <div className="text-2xl font-bold text-white">82%</div>
              <p className="text-xs text-gray-400">Critical auth & indexing modules covered</p>
            </Card>

            <Card className="border-[#23283a] space-y-2">
              <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs">
                <Layers className="w-4 h-4" />
                <span>Duplicate Code Rate</span>
              </div>
              <div className="text-2xl font-bold text-white">1.2%</div>
              <p className="text-xs text-gray-400">Identified via cosine AST similarity</p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
