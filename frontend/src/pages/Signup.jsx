import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, User, Bot, ArrowRight, ShieldCheck } from 'lucide-react';
import { Github } from '../components/ui/GithubIcon';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useAuthStore } from '../stores/useAuthStore';

export const Signup = () => {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuthStore();
  const [name, setName] = useState('Abhishek Mishra');
  const [email, setEmail] = useState('abhishek@repopilot.io');
  const [password, setPassword] = useState('SecurePass123!');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await signup(name, email, password);
    navigate('/dashboard');
  };

  const handleGitHubOAuth = () => {
    window.location.href = 'http://localhost:3001/api/auth/github';
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-[#23283a] bg-[#0e1017] p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-600/30">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Create your RepoPilot account</h2>
          <p className="text-xs text-gray-400 mt-1">Start querying and reviewing codebases with grounded AI</p>
        </div>

        {/* GitHub OAuth Button */}
        <Button
          onClick={handleGitHubOAuth}
          variant="secondary"
          className="w-full justify-center gap-2.5 py-2.5 bg-[#171a26] hover:bg-[#202536] border-[#2b3247] text-white"
        >
          <Github className="w-4 h-4" />
          <span>Sign up with GitHub</span>
        </Button>

        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-[#202536]" />
          <span className="text-[11px] text-gray-500 uppercase tracking-wider">or register with email</span>
          <div className="flex-1 h-px bg-[#202536]" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#131622] border border-[#23283a] rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="Abhishek Mishra"
              />
            </div>
          </div>

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
            <label className="block text-xs font-medium text-gray-300 mb-1.5">Password</label>
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

          <div className="p-2.5 rounded-lg bg-[#141724] border border-[#23293d] flex items-center gap-2 text-[11px] text-gray-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Includes 50 free AI RAG requests & 3 public repositories.</span>
          </div>

          <Button type="submit" variant="primary" className="w-full justify-center gap-2 mt-2" isLoading={isLoading}>
            <span>Create Account</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-400 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
};
