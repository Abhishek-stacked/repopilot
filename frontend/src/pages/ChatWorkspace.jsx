import React, { useState, useRef, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Bot, 
  Send, 
  Plus, 
  Sparkles, 
  FileCode2, 
  Terminal, 
  Clock, 
  ExternalLink,
  ChevronDown,
  Layers,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { useChatStore } from '../stores/useChatStore';
import { useRepoStore } from '../stores/useRepoStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { CodeBlock } from '../components/ui/CodeBlock';

export const ChatWorkspace = () => {
  const { id } = useParams();
  const { selectedRepo } = useRepoStore();
  const { 
    sessions, 
    activeSessionId, 
    setActiveSession, 
    createNewSession, 
    sendMessage, 
    getActiveSession,
    isGenerating 
  } = useChatStore();

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);

  const activeSession = getActiveSession();

  const suggestedPrompts = [
    'Explain the entire project architecture',
    'Where is user authentication implemented?',
    'Explain how the backend communicates with the frontend',
    'Find where a particular API is called',
    'What happens when a user clicks the login button?'
  ];

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isGenerating) return;
    sendMessage(inputMessage);
    setInputMessage('');
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isGenerating]);

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      {/* Left Chat History Sidebar */}
      <div className="w-72 border-r border-[#1f2433] bg-[#0c0d14] flex flex-col flex-shrink-0">
        <div className="p-3 border-b border-[#1f2433]">
          <Button
            onClick={createNewSession}
            variant="primary"
            size="sm"
            className="w-full justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat Session</span>
          </Button>
        </div>

        <div className="p-3 overflow-y-auto flex-1 space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 px-2 py-1">
            Recent Inquiries
          </div>
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => setActiveSession(session.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors cursor-pointer flex flex-col gap-1 ${
                session.id === activeSessionId
                  ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/25'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-[#141724]'
              }`}
            >
              <span className="font-medium truncate">{session.title}</span>
              <div className="flex items-center gap-1 text-[10px] text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{session.updatedAt}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-[#1f2433] text-[11px] text-gray-500 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          <span>Grounded RAG: 0% hallucinations</span>
        </div>
      </div>

      {/* Main Conversation Area */}
      <div className="flex-1 flex flex-col bg-[#090a0f] overflow-hidden">
        {/* Chat Header */}
        <div className="h-12 border-b border-[#1f2433] px-6 flex items-center justify-between bg-[#0e1017]">
          <div className="flex items-center gap-2.5">
            <Bot className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-semibold text-white">{activeSession?.title}</span>
            <Badge variant="primary" size="xs">pgvector RAG</Badge>
          </div>
          <div className="text-xs text-gray-400">
            Repository: <span className="text-indigo-400 font-mono">{selectedRepo?.name}</span>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeSession?.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-12">
              <div className="w-12 h-12 rounded-2xl bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400 mb-4 shadow-xl">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Ask anything about {selectedRepo?.name}</h3>
              <p className="text-xs text-gray-400 mt-1 mb-6 leading-relaxed">
                RepoPilot retrieves exact code AST chunks using pgvector and answers with verified line-level source citations.
              </p>

              <div className="w-full space-y-2 text-left">
                <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Suggested queries:</div>
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => {
                      setInputMessage(prompt);
                      sendMessage(prompt);
                    }}
                    className="w-full p-2.5 rounded-lg bg-[#121520] hover:bg-[#1a1e2e] border border-[#212638] text-xs text-gray-300 hover:text-white transition-colors cursor-pointer text-left flex items-center justify-between"
                  >
                    <span>{prompt}</span>
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 opacity-60" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            activeSession?.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${
                  msg.role === 'user' ? 'ml-auto justify-end' : 'mr-auto justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-md shadow-indigo-600/30">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`rounded-xl p-4 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'bg-[#121520] border border-[#212638] text-gray-200'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>

                  {/* Grounded Citations if present */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-[#23293c] space-y-2">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400 uppercase tracking-wider">
                        <FileCode2 className="w-3.5 h-3.5" />
                        <span>Verified Source Citations</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {msg.citations.map((cite, idx) => (
                          <div
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#181d2a] border border-[#2a3248] text-[11px] font-mono text-gray-300"
                          >
                            <span className="text-cyan-400 font-medium">{cite.file}</span>
                            <span className="text-gray-500">:</span>
                            <span className="text-amber-400">L{cite.lines}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-2 text-[10px] text-gray-500 text-right">{msg.timestamp}</div>
                </div>
              </div>
            ))
          )}

          {isGenerating && (
            <div className="flex gap-3 max-w-xl mr-auto">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0 animate-pulse">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="rounded-xl p-4 bg-[#121520] border border-[#212638] text-xs text-gray-400 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1 text-[11px]">Searching AST chunks with pgvector embeddings...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bottom Bar */}
        <div className="p-4 border-t border-[#1f2433] bg-[#0c0d14]">
          <form onSubmit={handleSend} className="max-w-4xl mx-auto relative">
            <textarea
              rows={2}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(e);
                }
              }}
              placeholder="Ask a question about authentication, architecture, APIs, or functions in this repo... (Enter to send)"
              className="w-full pl-4 pr-12 py-3 bg-[#131622] border border-[#23283a] rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none transition-colors"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isGenerating}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-center text-[10px] text-gray-500 mt-2">
            Answers are strictly grounded in repository files retrieved via pgvector vector similarity search.
          </div>
        </div>
      </div>
    </div>
  );
};
