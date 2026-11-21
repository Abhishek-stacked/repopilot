import React, { useState, useRef } from 'react';
import { 
  User, 
  CreditCard, 
  Key, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  AlertCircle,
  ExternalLink,
  Camera,
  Upload,
  Check,
  RefreshCw
} from 'lucide-react';
import { Github } from '../components/ui/GithubIcon';
import { useAuthStore } from '../stores/useAuthStore';
import { GITHUB_OAUTH_URL } from '../services/api';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

export const Settings = () => {
  const { user, upgradePlan, updateUserProfile } = useAuthStore();
  const [apiKey, setApiKey] = useState('sk-proj-••••••••••••••••••••••••');
  const [llmProvider, setLlmProvider] = useState('openai'); // 'openai' | 'anthropic' | 'ollama'
  const [name, setName] = useState(user?.name || '');
  const [isUpdatingPfp, setIsUpdatingPfp] = useState(false);
  const [pfpSuccess, setPfpSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const presetAvatars = [
    { label: 'Cyberpunk', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
    { label: 'Developer', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80' },
    { label: 'Architect', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80' },
    { label: 'Security Lead', url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80' },
    { label: 'Identicon', url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user?.email || 'dev')}` },
  ];

  const handleUpgrade = (plan) => {
    upgradePlan(plan);
  };

  const handlePfpChange = async (newUrl) => {
    setIsUpdatingPfp(true);
    await updateUserProfile({ avatarUrl: newUrl });
    setIsUpdatingPfp(false);
    setPfpSuccess(true);
    setTimeout(() => setPfpSuccess(false), 2500);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress image using client-side canvas
        const canvas = document.createElement('canvas');
        const maxSize = 250;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        handlePfpChange(compressedDataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const usagePercent = Math.round(((user?.aiRequestsUsed || 0) / (user?.aiRequestsLimit || 50)) * 100);

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      {/* Title */}
      <div className="pb-6 border-b border-[#1f2433]">
        <h1 className="text-2xl font-bold text-white">Account Settings & Security</h1>
        <p className="text-xs text-gray-400 mt-1">
          Manage your personal profile, custom profile picture, GitHub account linking, and security credentials.
        </p>
      </div>

      {/* Profile & PFP Card */}
      <Card className="border-[#23283a] space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            <span>Profile & Custom Profile Picture (PFP)</span>
          </h2>
          {pfpSuccess && (
            <Badge variant="success" size="xs">
              <Check className="w-3 h-3" />
              <span>Profile picture updated!</span>
            </Badge>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-5 rounded-xl bg-[#141724] border border-[#23293d]">
          {/* Avatar with upload overlay */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <img
                src={user?.avatarUrl}
                alt={user?.name || 'User'}
                className="w-16 h-16 rounded-full border-2 border-indigo-500/50 object-cover shadow-lg"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Upload photo from device"
                className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer text-white"
              >
                <Camera className="w-5 h-5 text-indigo-300" />
              </button>
            </div>

            <div>
              <div className="font-semibold text-sm text-white">{user?.name}</div>
              <div className="text-xs text-gray-400 font-mono">{user?.email}</div>
              <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Private & Multi-Tenant Isolated</span>
              </div>
            </div>
          </div>

          {/* Upload and GitHub status */}
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="sm"
              isLoading={isUpdatingPfp}
              className="gap-2 text-indigo-300 border-indigo-900/60 hover:bg-indigo-950/30"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Custom Photo</span>
            </Button>

            {user?.githubUsername ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1f2e] border border-[#2b3348] text-xs text-gray-300">
                <Github className="w-4 h-4 text-white" />
                <span>@{user.githubUsername}</span>
                <Badge variant="success" size="xs">Connected</Badge>
              </div>
            ) : (
              <a href={GITHUB_OAUTH_URL}>
                <Button variant="secondary" size="sm" className="gap-1.5">
                  <Github className="w-4 h-4" />
                  <span>Connect GitHub</span>
                </Button>
              </a>
            )}
          </div>
        </div>

        {/* Preset Avatar Chooser */}
        <div>
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
            Or choose a developer avatar preset:
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {presetAvatars.map((preset) => {
              const isSelected = user?.avatarUrl === preset.url;
              return (
                <button
                  key={preset.label}
                  onClick={() => handlePfpChange(preset.url)}
                  className={`flex items-center gap-2 p-1.5 pr-3 rounded-full border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-950/40 text-indigo-300 shadow-md shadow-indigo-950/30'
                      : 'border-[#23283a] bg-[#11141e] text-gray-400 hover:text-white hover:border-gray-600'
                  }`}
                >
                  <img src={preset.url} alt={preset.label} className="w-7 h-7 rounded-full object-cover" />
                  <span className="text-xs">{preset.label}</span>
                </button>
              );
            })}
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
