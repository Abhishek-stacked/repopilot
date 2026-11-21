import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  BookOpen, 
  Network, 
  FileCode2, 
  Compass,
  RefreshCw 
} from 'lucide-react';
import { mockGeneratedDocs } from '../data/mockData';
import { useRepoStore } from '../stores/useRepoStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

export const DocsGenerator = () => {
  const { selectedRepo } = useRepoStore();
  const [selectedDocType, setSelectedDocType] = useState('readme'); // 'readme' | 'architecture' | 'api' | 'onboarding'
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const docTypes = [
    { id: 'readme', label: 'README.md', icon: BookOpen, desc: 'Project overview, setup & badges' },
    { id: 'architecture', label: 'System Architecture', icon: Network, desc: 'Component dataflow & sequencing' },
    { id: 'api', label: 'API Reference', icon: FileCode2, desc: 'REST endpoints, request & response schemas' },
    { id: 'onboarding', label: 'Developer Onboarding', icon: Compass, desc: 'Prerequisites, local env & verification' },
  ];

  const currentContent = mockGeneratedDocs[selectedDocType] || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 1500);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1f2433]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-cyan-400" />
              <span>Automated Documentation Generator</span>
            </h1>
            <Badge variant="primary">AI Synthesized</Badge>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Generate living technical documentation directly from codebase AST and Git commits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleCopy} variant="outline" size="sm" className="gap-1.5">
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
          </Button>
          <Button onClick={handleRegenerate} variant="primary" size="sm" isLoading={isGenerating} className="gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Regenerate</span>
          </Button>
        </div>
      </div>

      {/* Doc Type Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {docTypes.map((doc) => {
          const Icon = doc.icon;
          const isSelected = selectedDocType === doc.id;
          return (
            <button
              key={doc.id}
              onClick={() => setSelectedDocType(doc.id)}
              className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-600/15 border-indigo-500/50 shadow-lg shadow-indigo-950/40'
                  : 'bg-[#11141e] border-[#212638] hover:border-gray-600 hover:bg-[#151926]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-600 text-white' : 'bg-[#1b202f] text-gray-400'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {isSelected && <Badge variant="primary" size="xs">Active</Badge>}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{doc.label}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{doc.desc}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Live Preview Card */}
      <Card className="border-[#23283a] p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#141724] border-b border-[#23283a]">
          <div className="flex items-center gap-2 text-xs font-mono text-gray-300">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Preview: {selectedDocType.toUpperCase()}.md</span>
          </div>
          <div className="text-[11px] text-gray-400">
            Target Repo: <span className="text-indigo-400">{selectedRepo?.name}</span>
          </div>
        </div>

        <div className="p-6 font-mono text-xs text-gray-200 leading-relaxed whitespace-pre-wrap bg-[#0b0d13] overflow-x-auto min-h-[400px]">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
              <span>Analyzing AST dependencies and synthesizing documentation...</span>
            </div>
          ) : (
            currentContent
          )}
        </div>
      </Card>
    </div>
  );
};
