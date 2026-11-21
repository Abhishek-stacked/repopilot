import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Mail, Bot, ArrowRight } from 'lucide-react';
import { Github } from '../components/ui/GithubIcon';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuthStore } from '../stores/useAuthStore';
import { GITHUB_OAUTH_URL } from '../services/api';

export const Login = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [searchParams] = useSearchParams();

  // The OAuth callback returns here with ?error= when GitHub sign-in cannot run.
  useEffect(() => {
    const oauthError = searchParams.get('error');
    if (oauthError) setAuthError(oauthError);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    const res = await login(email, password);
    if (res?.success) {
      navigate('/dashboard');
    } else {
      setAuthError(res?.error || 'Invalid email or password.');
    }
  };

  const handleGitHubOAuth = () => {
    window.location.href = GITHUB_OAUTH_URL;
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-[#23283a] bg-[#0e1017] p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-600/30">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Welcome back to RepoPilot</h2>
          <p className="text-xs text-gray-400 mt-1">Sign in to inspect your repositories and AI indexes</p>
        </div>

        {/* GitHub OAuth Button */}
        <Button
          onClick={handleGitHubOAuth}
          variant="secondary"
          className="w-full justify-center gap-2.5 py-2.5 bg-[#171a26] hover:bg-[#202536] border-[#2b3247] text-white"
        >
          <Github className="w-4 h-4" />
          <span>Continue with GitHub</span>
        </Button>

        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-[#202536]" />
          <span className="text-[11px] text-gray-500 uppercase tracking-wider">or sign in with email</span>
          <div className="flex-1 h-px bg-[#202536]" />
        </div>

        {/* Form */}
        {authError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs">
            {authError}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#131622] border border-[#23283a] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="name@company.com"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-gray-300">Password</label>
              <a href="#forgot" className="text-[11px] text-indigo-400 hover:underline">Forgot?</a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#131622] border border-[#23283a] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full justify-center gap-2 mt-2" isLoading={isLoading}>
            <span>Sign In to RepoPilot</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-400 hover:underline font-medium">
            Sign up free
          </Link>
        </p>
      </Card>
    </div>
  );
};
