import React, { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';

export const CodeBlock = ({ code, language = 'typescript', title = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const lines = code.trim().split('\n');

  return (
    <div className="my-3 rounded-lg overflow-hidden border border-[#262c3d] bg-[#0c0d14] text-xs font-mono">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#141722] border-b border-[#262c3d]">
        <div className="flex items-center gap-2 text-gray-400">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span>{title || language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white px-2 py-0.5 rounded hover:bg-[#202535] transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="p-3 overflow-x-auto leading-relaxed">
        <pre className="table">
          {lines.map((line, index) => (
            <div key={index} className="table-row hover:bg-[#151928]/50">
              <span className="table-cell select-none pr-4 text-right text-gray-600 font-mono text-[11px]">
                {index + 1}
              </span>
              <span className="table-cell text-gray-200 whitespace-pre">
                {line || ' '}
              </span>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
};
