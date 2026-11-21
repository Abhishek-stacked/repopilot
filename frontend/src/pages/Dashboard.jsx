import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Bot, 
  Layers, 
  Sparkles, 
  Database, 
  ShieldAlert, 
  FileCode2, 
  TestTube2, 
  ArrowUpRight, 
  RefreshCw, 
  GitBranch, 
  Activity, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { Github } from '../components/ui/GithubIcon';
import { useAuthStore } from '../stores/useAuthStore';
import { useRepoStore } from '../stores/useRepoStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

export const Dashboard = () => {
  const { user } = useAuthStore();
  const { repositories, selectRepo, triggerReindex, loadRepositories } = useRepoStore();

  React.useEffect(() => {
    loadRepositories();
  }, [loadRepositories]);

  // Without a connected repository these would link to /repo/undefined/...
  const repoLink = (suffix) =>
    repositories[0]?.id ? `/repo/${repositories[0].id}/${suffix}` : '/repositories';
  const requestsUsed = user?.aiRequestsUsed ?? 0;
  const requestsLimit = user?.aiRequestsLimit ?? 50;
  const identity = user?.githubUsername ? `@${user.githubUsername}` : user?.email;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#1f2433]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {user?.name?.split(' ')[0] || 'Engineer'}
            </h1>
            <Badge variant="primary">v2.0 Active</Badge>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Signed in as <span className="text-gray-200 font-mono">{identity}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/repositories">
            <Button variant="outline" size="sm" className="gap-2">
              <Github className="w-4 h-4" />
              <span>Connect Repo</span>
            </Button>
          </Link>
          <Link to={repoLink('chat')}>
            <Button variant="primary" size="sm" className="gap-2">
              <Bot className="w-4 h-4" />
              <span>New AI Chat</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-[#212638] space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>Connected Repos</span>
            <Github className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white">{repositories.length}</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>All public & private accessible</span>
          </div>
        </Card>

        <Card className="border-[#212638] space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>AST Code Chunks</span>
            <FileCode2 className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white">1,420</div>
          <div className="text-[11px] text-gray-400">
            <span>Preserving function boundaries</span>
          </div>
        </Card>

        <Card className="border-[#212638] space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>pgvector Embeddings</span>
            <Database className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white">384-dim</div>
          <div className="text-[11px] text-gray-400">
            <span>all-MiniLM-L6-v2 model</span>
          </div>
        </Card>

        <Card className="border-[#212638] space-y-1">
          <div className="flex items-center justify-between text-gray-400 text-xs">
            <span>AI Query Quota</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white">
            {requestsUsed} <span className="text-xs font-normal text-gray-500">/ {requestsLimit}</span>
          </div>
          <div className="w-full bg-[#1e2333] h-1.5 rounded-full overflow-hidden mt-1">
            <div 
              className="bg-indigo-500 h-full rounded-full" 
              style={{ width: `${Math.min(100, (requestsUsed / requestsLimit) * 100)}%` }}
            />
          </div>
        </Card>
      </div>

      {/* Quick Launch Cards */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">AI Intelligence Workspaces</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link to={repoLink('chat')} onClick={() => selectRepo(repositories[0]?.id)}>
            <Card hoverEffect className="group border-[#222738] p-4 flex flex-col justify-between h-32">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-indigo-950/60 text-indigo-400 border border-indigo-800/40">
                  <Bot className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 transition-colors" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">RAG Code Chat</div>
                <p className="text-[11px] text-gray-400">Ask questions with exact line citations</p>
              </div>
            </Card>
          </Link>

          <Link to={repoLink('review')} onClick={() => selectRepo(repositories[0]?.id)}>
            <Card hoverEffect className="group border-[#222738] p-4 flex flex-col justify-between h-32">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-rose-950/60 text-rose-400 border border-rose-800/40">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-rose-400 transition-colors" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Code Review Scan</div>
                <p className="text-[11px] text-gray-400">Detect ReDoS, bugs & code smells</p>
              </div>
            </Card>
          </Link>

          <Link to={repoLink('docs')} onClick={() => selectRepo(repositories[0]?.id)}>
            <Card hoverEffect className="group border-[#222738] p-4 flex flex-col justify-between h-32">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-cyan-950/60 text-cyan-400 border border-cyan-800/40">
                  <FileCode2 className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 transition-colors" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Auto Docs Generator</div>
                <p className="text-[11px] text-gray-400">README, Architecture & API specs</p>
              </div>
            </Card>
          </Link>

          <Link to={repoLink('tests')} onClick={() => selectRepo(repositories[0]?.id)}>
            <Card hoverEffect className="group border-[#222738] p-4 flex flex-col justify-between h-32">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                  <TestTube2 className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-600 group-hover:text-emerald-400 transition-colors" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Test Suite Creator</div>
                <p className="text-[11px] text-gray-400">Generate Jest, PyTest & unit tests</p>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* Repositories Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400">Active Repositories</h2>
          <Link to="/repositories" className="text-xs text-indigo-400 hover:underline">
            Manage all ({repositories.length})
          </Link>
        </div>

        <div className="rounded-xl border border-[#212638] bg-[#0c0d14] overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#121520] border-b border-[#212638] text-gray-400 uppercase text-[10px] tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Repository</th>
                <th className="py-3 px-4">Branch</th>
                <th className="py-3 px-4">Language</th>
                <th className="py-3 px-4">Index Status</th>
                <th className="py-3 px-4">Quality Score</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2434]">
              {repositories.map((repo) => (
                <tr key={repo.id} className="hover:bg-[#131622] transition-colors">
                  <td className="py-3 px-4">
                    <Link
                      to={`/repo/${repo.id}`}
                      onClick={() => selectRepo(repo.id)}
                      className="font-medium text-white hover:text-indigo-400 flex items-center gap-2"
                    >
                      <Github className="w-4 h-4 text-gray-400" />
                      <span>{repo.fullName}</span>
                    </Link>
                    <div className="text-[11px] text-gray-500 truncate max-w-xs">{repo.description}</div>
                  </td>
                  <td className="py-3 px-4 text-gray-300">
                    <span className="flex items-center gap-1 font-mono text-[11px]">
                      <GitBranch className="w-3 h-3 text-indigo-400" />
                      {repo.defaultBranch}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant="default" size="xs">{repo.language}</Badge>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={repo.indexStatus === 'ready' ? 'success' : 'warning'} size="xs">
                      {repo.indexStatus === 'ready' ? 'Ready' : 'Indexing'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-emerald-400">{repo.qualityScore}/100</span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => triggerReindex(repo.id)}
                        className="p-1 rounded text-gray-400 hover:text-indigo-400 hover:bg-[#1c202e] transition-colors cursor-pointer"
                        title="Reindex Repository"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${repo.indexStatus === 'indexing' ? 'animate-spin text-indigo-400' : ''}`} />
                      </button>
                      <Link to={`/repo/${repo.id}/chat`} onClick={() => selectRepo(repo.id)}>
                        <Button variant="outline" size="sm">Open AI</Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {repositories.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 px-4 text-center">
                    <div className="text-sm text-gray-300">No repositories yet</div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Connect a repository to populate this workspace.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
