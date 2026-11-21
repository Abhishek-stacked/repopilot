import React, { useState } from 'react';
import { 
  TestTube2, 
  Copy, 
  Check, 
  Sparkles, 
  FileCode2, 
  Play, 
  AlertCircle,
  CheckCircle2,
  RefreshCw 
} from 'lucide-react';
import { mockTestGeneration } from '../data/mockData';
import { useRepoStore } from '../stores/useRepoStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { CodeBlock } from '../components/ui/CodeBlock';

export const TestGenerator = () => {
  const { selectedRepo } = useRepoStore();
  const [selectedFunc, setSelectedFunc] = useState('verifyAccessToken');
  const [framework, setFramework] = useState('jest'); // 'jest' | 'mocha' | 'vitest'
  const [isGenerating, setIsGenerating] = useState(false);

  const functions = [
    { name: 'verifyAccessToken', file: 'src/auth/jwt.ts', coverage: '45%', missingCases: 3 },
    { name: 'splitCodeByAST', file: 'src/indexing/chunker.ts', coverage: '60%', missingCases: 2 },
    { name: 'calculateCosineSimilarity', file: 'src/rag/retriever.ts', coverage: '30%', missingCases: 4 },
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 1600);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1f2433]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <TestTube2 className="w-6 h-6 text-emerald-400" />
              <span>Automated Unit Test Generator</span>
            </h1>
            <Badge variant="success">AST Driven</Badge>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Detects untested edge cases and outputs framework-idiomatic unit test suites.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={framework}
            onChange={(e) => setFramework(e.target.value)}
            className="px-3 py-1.5 bg-[#141724] border border-[#252b3e] rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="jest">Jest / ts-jest</option>
            <option value="vitest">Vitest</option>
            <option value="mocha">Mocha / Chai</option>
          </select>
          <Button onClick={handleGenerate} variant="primary" size="sm" isLoading={isGenerating} className="gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate Tests</span>
          </Button>
        </div>
      </div>

      {/* Function Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {functions.map((fn) => {
          const isSelected = selectedFunc === fn.name;
          return (
            <button
              key={fn.name}
              onClick={() => setSelectedFunc(fn.name)}
              className={`text-left p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-emerald-950/20 border-emerald-500/50 shadow-lg shadow-emerald-950/30'
                  : 'bg-[#11141e] border-[#212638] hover:border-gray-600 hover:bg-[#151926]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-xs font-semibold text-white">{fn.name}()</span>
                  <Badge variant={fn.missingCases > 2 ? 'warning' : 'default'} size="xs">
                    {fn.missingCases} missing cases
                  </Badge>
                </div>
                <div className="text-[11px] text-gray-500 font-mono">{fn.file}</div>
              </div>

              <div className="mt-4 pt-2 border-t border-[#1e2332] flex items-center justify-between text-xs text-gray-400">
                <span>Coverage:</span>
                <span className="text-emerald-400 font-semibold">{fn.coverage}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Missing Test Cases Identified */}
      <Card className="border-[#23283a] space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
          <AlertCircle className="w-4 h-4" />
          <span>Identified Edge Cases for {selectedFunc}()</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-[#141724] border border-[#23283c] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-white">Missing Authorization Header</div>
              <div className="text-[11px] text-gray-400 mt-0.5">Asserts 401 response when header is omitted.</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#141724] border border-[#23283c] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-white">Expired Token Handling</div>
              <div className="text-[11px] text-gray-400 mt-0.5">Verifies TokenExpiredError returns TOKEN_EXPIRED code.</div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#141724] border border-[#23283c] flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-medium text-white">Payload Decoupling</div>
              <div className="text-[11px] text-gray-400 mt-0.5">Ensures req.user receives full typed UserPayload.</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Generated Code Suite */}
      <Card className="border-[#23283a] p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#141724] border-b border-[#23283a]">
          <div className="flex items-center gap-2 text-xs font-mono text-gray-300">
            <FileCode2 className="w-4 h-4 text-emerald-400" />
            <span>tests/{selectedFunc}.test.ts</span>
          </div>
          <Badge variant="success" size="xs">Ready to Run</Badge>
        </div>

        <div className="p-4 bg-[#0a0c12]">
          <CodeBlock
            code={mockTestGeneration.generatedTests}
            language="typescript"
            title="Generated Test Suite"
          />
        </div>
      </Card>
    </div>
  );
};
