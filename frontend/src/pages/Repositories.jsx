import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Plus, 
  Star, 
  GitFork, 
  RefreshCw, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Globe, 
  Bot 
} from 'lucide-react';
import { Github } from '../components/ui/GithubIcon';
import { useRepoStore } from '../stores/useRepoStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

export const Repositories = () => {
  const { 
    repositories, 
    searchQuery, 
    setSearchQuery, 
    filterLanguage, 
    setFilterLanguage,
    selectRepo, 
    triggerReindex,
    connectNewRepo
  } = useRepoStore();

  const [showConnectModal, setShowConnectModal] = useState(false);
  const [newRepoUrl, setNewRepoUrl] = useState('');

  const languages = ['All', 'TypeScript', 'Python', 'Go'];

  const filteredRepos = repositories.filter((repo) => {
    const matchesSearch = repo.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          repo.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLang = filterLanguage === 'All' || repo.language === filterLanguage;
    return matchesSearch && matchesLang;
  });

  const handleConnectSubmit = (e) => {
    e.preventDefault();
    if (!newRepoUrl.trim()) return;

    const parts = newRepoUrl.replace('https://github.com/', '').split('/');
    const owner = parts[0] || 'developer';
    const name = parts[1] || 'new-service';
    const fullName = `${owner}/${name}`;

    const newRepo = {
      id: `repo_${Date.now()}`,
      name,
      fullName,
      description: 'Newly connected repository queued for AST parsing and vector embeddings.',
      language: 'TypeScript',
      isPrivate: false,
      stars: 1,
      forks: 0,
      fileCount: 42,
      sizeKb: 1200,
      indexStatus: 'indexing',
      indexedAt: 'Indexing now...',
      defaultBranch: 'main',
      branches: ['main'],
      languages: [{ name: 'TypeScript', percentage: 100, color: '#3178c6' }],
      qualityScore: 92,
      metrics: { bugs: 0, codeSmells: 2, securityWarnings: 0, duplicateBlocks: 0, testCoverage: '80%' }
    };

    connectNewRepo(newRepo);
    setShowConnectModal(false);
    setNewRepoUrl('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Title & Connect Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1f2433]">
        <div>
          <h1 className="text-2xl font-bold text-white">Your Repositories</h1>
          <p className="text-xs text-gray-400 mt-1">
            Manage your connected GitHub repositories, configure indexing, and inspect AST embeddings.
          </p>
        </div>

        <Button onClick={() => setShowConnectModal(true)} variant="primary" size="md" className="gap-2">
          <Plus className="w-4 h-4" />
          <span>Connect Repository</span>
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#11141e] border border-[#212638] p-3 rounded-xl">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by repository name or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#0a0c12] border border-[#252b3e] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-gray-500 mr-1" />
          {languages.map((lang) => (
            <button
              key={lang}
              onClick={() => setFilterLanguage(lang)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                filterLanguage === lang
                  ? 'bg-indigo-600 text-white'
                  : 'bg-[#181c28] text-gray-400 hover:text-gray-200'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Repos */}
      {filteredRepos.length === 0 ? (
        <Card className="text-center py-12 border-dashed border-[#282f44]">
          <Github className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-white">No repositories found</h3>
          <p className="text-xs text-gray-400 mt-1">Try adjusting your search query or connect a new repo.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRepos.map((repo) => (
            <Card key={repo.id} hoverEffect className="flex flex-col justify-between border-[#222738] p-5">
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Github className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <span className="font-semibold text-sm text-white truncate max-w-[200px]">
                      {repo.name}
                    </span>
                  </div>
                  <Badge variant={repo.isPrivate ? 'default' : 'purple'} size="xs">
                    {repo.isPrivate ? (
                      <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Private</span>
                    ) : (
                      <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> Public</span>
                    )}
                  </Badge>
                </div>

                <div className="text-[11px] text-gray-500 font-mono mb-2">{repo.fullName}</div>
                <p className="text-xs text-gray-300 leading-relaxed line-clamp-2 mb-4">
                  {repo.description}
                </p>

                {/* Language bars */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex h-1.5 w-full rounded-full overflow-hidden bg-[#1f2434]">
                    {repo.languages.map((l) => (
                      <div
                        key={l.name}
                        style={{ width: `${l.percentage}%`, backgroundColor: l.color }}
                        title={`${l.name}: ${l.percentage}%`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-400">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: repo.languages[0]?.color }} />
                      {repo.language}
                    </span>
                    <span>{repo.fileCount} files</span>
                  </div>
                </div>
              </div>

              {/* Footer controls */}
              <div className="pt-3 border-t border-[#1e2333] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant={repo.indexStatus === 'ready' ? 'success' : 'warning'} size="xs">
                    {repo.indexStatus === 'ready' ? 'Ready' : 'Indexing'}
                  </Badge>
                  <button
                    onClick={() => triggerReindex(repo.id)}
                    className="p-1 rounded text-gray-400 hover:text-indigo-400 hover:bg-[#1a1e2c] transition-colors cursor-pointer"
                    title="Refresh index"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${repo.indexStatus === 'indexing' ? 'animate-spin text-indigo-400' : ''}`} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <Link to={`/repo/${repo.id}`} onClick={() => selectRepo(repo.id)}>
                    <Button variant="ghost" size="sm">Inspect</Button>
                  </Link>
                  <Link to={`/repo/${repo.id}/chat`} onClick={() => selectRepo(repo.id)}>
                    <Button variant="primary" size="sm" className="gap-1">
                      <Bot className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Connect Repo Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <Card className="w-full max-w-lg border-[#2e344a] bg-[#0f111a] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#212638]">
              <div className="flex items-center gap-2 text-white font-semibold text-base">
                <Github className="w-5 h-5 text-indigo-400" />
                <span>Connect GitHub Repository</span>
              </div>
              <button
                onClick={() => setShowConnectModal(false)}
                className="text-gray-400 hover:text-white text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-300">
              Provide the GitHub repository URL or full name (e.g. <code className="text-indigo-300 font-mono">expressjs/express</code> or <code className="text-indigo-300 font-mono">https://github.com/owner/repo</code>).
            </p>

            <form onSubmit={handleConnectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">Repository URL or Path</label>
                <input
                  type="text"
                  required
                  placeholder="https://github.com/organization/repository"
                  value={newRepoUrl}
                  onChange={(e) => setNewRepoUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-[#141724] border border-[#272e42] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3 rounded-lg bg-[#151926] border border-[#262c3e] text-[11px] text-gray-400 space-y-1">
                <div className="flex items-center gap-1.5 text-gray-200 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Security & Permissions:</span>
                </div>
                <div>• Public repos are fetched anonymously without elevated access.</div>
                <div>• Private repos require configured GitHub OAuth token scopes.</div>
                <div>• Source code is parsed for AST embeddings and never shared across tenants.</div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowConnectModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Start Indexing
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};
