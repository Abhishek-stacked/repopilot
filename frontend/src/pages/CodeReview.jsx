import React, { useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  Terminal, 
  ArrowRight,
  Filter,
  RefreshCw,
  Sparkles,
  Zap,
  RotateCcw,
  Check
} from 'lucide-react';
import { mockCodeReviewFindings } from '../data/mockData';
import { useRepoStore } from '../stores/useRepoStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { CodeBlock } from '../components/ui/CodeBlock';

export const CodeReview = () => {
  const { selectedRepo } = useRepoStore();
  const [severityFilter, setSeverityFilter] = useState('all');
  const [isScanning, setIsScanning] = useState(false);
  const [appliedFixes, setAppliedFixes] = useState({});
  const [applyingId, setApplyingId] = useState(null);

  const findings = mockCodeReviewFindings.filter((f) => 
    severityFilter === 'all' ? true : f.severity === severityFilter
  );

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 2000);
  };

  const handleApplyFix = (findingId) => {
    setApplyingId(findingId);
    setTimeout(() => {
      setAppliedFixes(prev => ({ ...prev, [findingId]: true }));
      setApplyingId(null);
    }, 700);
  };

  const handleRevertFix = (findingId) => {
    setAppliedFixes(prev => {
      const next = { ...prev };
      delete next[findingId];
      return next;
    });
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1f2433]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-rose-400" />
              <span>Intelligent Code Review & Auto-Patcher</span>
            </h1>
            <Badge variant="danger">{mockCodeReviewFindings.length} Findings</Badge>
            {Object.keys(appliedFixes).length > 0 && (
              <Badge variant="success">{Object.keys(appliedFixes).length} Fixed & Patched</Badge>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Detect vulnerabilities, code smells, and click <strong className="text-emerald-400">"Apply Fix & Replace Code"</strong> to patch source files instantly.
          </p>
        </div>

        <Button onClick={handleScan} variant="primary" size="sm" isLoading={isScanning} className="gap-2">
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Trigger Full Codebase Scan</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-[#23283a]">
          <div className="text-xs text-gray-400">Critical Vulnerabilities</div>
          <div className="text-2xl font-bold text-rose-400 mt-1">1</div>
          <p className="text-[11px] text-gray-500 mt-1">ReDoS in AST chunker</p>
        </Card>

        <Card className="border-[#23283a]">
          <div className="text-xs text-gray-400">Security Smells</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">1</div>
          <p className="text-[11px] text-gray-500 mt-1">Missing OAuth CSRF state nonce</p>
        </Card>

        <Card className="border-[#23283a]">
          <div className="text-xs text-gray-400">Performance Bottlenecks</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">1</div>
          <p className="text-[11px] text-gray-500 mt-1">N+1 query pattern in citations</p>
        </Card>

        <Card className="border-[#23283a]">
          <div className="text-xs text-gray-400">Duplicate Blocks</div>
          <div className="text-2xl font-bold text-indigo-400 mt-1">1</div>
          <p className="text-[11px] text-gray-500 mt-1">98% token cosine similarity</p>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 bg-[#121520] border border-[#212638] p-2 rounded-xl">
        <Filter className="w-4 h-4 text-gray-400 ml-2 mr-1" />
        {['all', 'critical', 'warning', 'info'].map((sev) => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(sev)}
            className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors cursor-pointer ${
              severityFilter === sev
                ? 'bg-indigo-600 text-white'
                : 'text-gray-400 hover:text-gray-200 hover:bg-[#1a1e2d]'
            }`}
          >
            {sev} ({sev === 'all' ? mockCodeReviewFindings.length : mockCodeReviewFindings.filter(f => f.severity === sev).length})
          </button>
        ))}
      </div>

      {/* Finding List */}
      <div className="space-y-4">
        {findings.map((finding) => {
          const isApplied = !!appliedFixes[finding.id];
          const isApplying = applyingId === finding.id;

          return (
            <Card key={finding.id} className={`border-[#24293a] space-y-4 transition-all duration-300 ${
              isApplied ? 'border-emerald-500/40 bg-emerald-950/10' : ''
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1f2434]">
                <div className="flex items-center gap-2">
                  {isApplied ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <>
                      {finding.severity === 'critical' && <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0" />}
                      {finding.severity === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                      {finding.severity === 'info' && <Info className="w-4 h-4 text-indigo-400 flex-shrink-0" />}
                    </>
                  )}
                  <span className={`font-semibold text-sm ${isApplied ? 'text-emerald-300' : 'text-white'}`}>
                    {finding.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isApplied ? (
                    <Badge variant="success" size="xs">
                      <Check className="w-3 h-3" />
                      <span>CODE REPLACED & PATCHED</span>
                    </Badge>
                  ) : (
                    <Badge variant={finding.severity === 'critical' ? 'danger' : finding.severity === 'warning' ? 'warning' : 'primary'} size="xs">
                      {finding.severity.toUpperCase()}
                    </Badge>
                  )}
                  <Badge variant="default" size="xs">{finding.category}</Badge>
                </div>
              </div>

              <div className="text-xs text-gray-300 leading-relaxed">
                {finding.description}
              </div>

              <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                <span className="text-indigo-400">{finding.file}</span>
                <span>:</span>
                <span className="text-amber-400">Line {finding.line}</span>
              </div>

              {/* Code Diff / Replaced view */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span className={isApplied ? 'text-gray-500 line-through' : 'text-rose-400'}>
                      Original Vulnerable Code (Line {finding.line}):
                    </span>
                    {isApplied && <span className="text-emerald-400 text-[10px]">Replaced with patch</span>}
                  </div>
                  <div className={isApplied ? 'opacity-40 filter grayscale' : ''}>
                    <CodeBlock code={finding.codeSnippet} language="typescript" title="Original Snippet" />
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <Zap className="w-3 h-3" />
                    <span>{isApplied ? 'Active Patched Code (Live in File):' : 'Recommended Fix:'}</span>
                  </div>
                  <CodeBlock code={finding.suggestion} language="typescript" title="Patched Implementation" />
                </div>
              </div>

              <div className="pt-2 border-t border-[#1e2332] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-400">
                <div>
                  <span className="text-gray-500">Impact: </span>
                  <span className="text-gray-300">{finding.impact}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {isApplied ? (
                    <Button
                      onClick={() => handleRevertFix(finding.id)}
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-gray-400 hover:text-white"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Revert Code</span>
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleApplyFix(finding.id)}
                      variant="primary"
                      size="sm"
                      isLoading={isApplying}
                      className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Apply Fix & Replace Code</span>
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
