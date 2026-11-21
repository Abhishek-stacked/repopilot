import React, { useState } from 'react';
import { 
  User, 
  CreditCard, 
  Key, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { Github } from '../components/ui/GithubIcon';
import { useAuthStore } from '../stores/useAuthStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

export const Settings = () => {
  const { user, upgradePlan } = useAuthStore();
  const [apiKey, setApiKey] = useState('sk-proj-••••••••••••••••••••••••');
  const [llmProvider, setLlmProvider] = useState('openai'); // 'openai' | 'anthropic' | 'ollama'

  const handleUpgrade = (plan) => {
    upgradePlan(plan);
  };

  const usagePercent = Math.round(((user?.aiRequestsUsed || 0) / (user?.aiRequestsLimit || 50)) * 100);

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div className="pb-6 border-b border-[#1f2433]">
        <h1 className="text-2xl font-bold text-white">Account Settings & Subscription</h1>
        <p className="text-xs text-gray-400 mt-1">
          Manage your GitHub authentication, subscription tier, and external LLM credentials.
        </p>
      </div>

      {/* Profile & GitHub Card */}
      <Card className="border-[#23283a] space-y-6">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-400" />
          <span>Profile & Identity</span>
        </h2>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#141724] border border-[#23293d]">
          <div className="flex items-center gap-3">
            <img
              src={user?.avatarUrl}
              alt={user?.name}
              className="w-12 h-12 rounded-full border border-[#2e344a] object-cover"
            />
            <div>
              <div className="font-semibold text-sm text-white">{user?.name}</div>
              <div className="text-xs text-gray-400">{user?.email}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1f2e] border border-[#2b3348] text-xs text-gray-300">
              <Github className="w-4 h-4 text-white" />
              <span>Connected as <strong className="text-indigo-400">@{user?.githubUsername}</strong></span>
            </div>
            <Badge variant="success" size="xs">OAuth Verified</Badge>
          </div>
        </div>
      </Card>

      {/* Subscription & Usage */}
      <Card className="border-[#23283a] space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-indigo-400" />
            <span>Subscription & Monthly Quota</span>
          </h2>
          <Badge variant={user?.plan === 'pro' ? 'primary' : 'default'}>
            CURRENT: {user?.plan?.toUpperCase()} PLAN
          </Badge>
        </div>

        {/* Usage progress bar */}
        <div className="p-4 rounded-xl bg-[#141724] border border-[#23293d] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-300">Monthly AI Queries Used</span>
            <span className="font-mono text-indigo-400 font-semibold">
              {user?.aiRequestsUsed} / {user?.aiRequestsLimit} requests ({usagePercent}%)
            </span>
          </div>
          <div className="w-full bg-[#1e2333] h-2 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                usagePercent > 80 ? 'bg-amber-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <div className="text-[11px] text-gray-500">
            Resets automatically at the start of your billing cycle.
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl border flex flex-col justify-between ${
            user?.plan === 'free' ? 'border-indigo-500/50 bg-[#161a29]' : 'border-[#23283a] bg-[#11141e]'
          }`}>
            <div>
              <div className="text-sm font-semibold text-white">Developer Free</div>
              <div className="text-xl font-bold text-gray-200 mt-1">$0 / month</div>
              <p className="text-xs text-gray-400 mt-2">50 requests/mo, 3 public repositories.</p>
            </div>
            <Button
              variant={user?.plan === 'free' ? 'secondary' : 'outline'}
              size="sm"
              className="mt-4"
              disabled={user?.plan === 'free'}
              onClick={() => handleUpgrade('free')}
            >
              {user?.plan === 'free' ? 'Current Plan' : 'Downgrade to Free'}
            </Button>
          </div>

          <div className={`p-4 rounded-xl border flex flex-col justify-between ${
            user?.plan === 'pro' ? 'border-indigo-500/50 bg-[#161a29]' : 'border-[#23283a] bg-[#11141e]'
          }`}>
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-indigo-300">Team Pro</span>
                <Badge variant="primary" size="xs">Recommended</Badge>
              </div>
              <div className="text-xl font-bold text-white mt-1">$29 / month</div>
              <p className="text-xs text-gray-400 mt-2">1,000 requests/mo, unlimited private repositories.</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              className="mt-4"
              disabled={user?.plan === 'pro'}
              onClick={() => handleUpgrade('pro')}
            >
              {user?.plan === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
            </Button>
          </div>
        </div>
      </Card>

      {/* LLM Provider Configuration */}
      <Card className="border-[#23283a] space-y-6">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Key className="w-4 h-4 text-indigo-400" />
          <span>LLM Provider & Credentials</span>
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Active LLM Provider Engine</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'openai', name: 'OpenAI (GPT-4o Mini)' },
                { id: 'anthropic', name: 'Anthropic (Claude 3.5 Haiku)' },
                { id: 'ollama', name: 'Local Ollama (Llama 3.2)' }
              ].map((prov) => (
                <button
                  key={prov.id}
                  onClick={() => setLlmProvider(prov.id)}
                  className={`p-3 rounded-lg border text-left text-xs font-medium transition-colors cursor-pointer ${
                    llmProvider === prov.id
                      ? 'bg-indigo-600/15 border-indigo-500 text-indigo-300'
                      : 'bg-[#141724] border-[#252b3e] text-gray-400 hover:text-white'
                  }`}
                >
                  {prov.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">API Key (Encrypted At Rest via AES-256)</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full px-3 py-2 bg-[#141724] border border-[#272e42] rounded-lg text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/30 text-[11px] text-emerald-300 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>Tokens and API credentials are encrypted with AES-256 before writing to storage.</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
