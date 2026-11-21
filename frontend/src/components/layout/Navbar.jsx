import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Bot, 
  Layers, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { Github } from '../ui/GithubIcon';
import { useAuthStore } from '../../stores/useAuthStore';
import { useRepoStore } from '../../stores/useRepoStore';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const Navbar = () => {
  const location = useLocation();
  const { user } = useAuthStore();
  const { selectedRepo } = useRepoStore();

  const isPublicPage = location.pathname === '/' || location.pathname === '/login' || location.pathname === '/signup';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1f2433] bg-[#090a0f]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 text-white font-semibold text-lg tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span>Repo<span className="text-indigo-400">Pilot</span></span>
          </Link>

          {!isPublicPage && selectedRepo && (
            <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 pl-4 border-l border-[#222736]">
              <Link to="/repositories" className="hover:text-gray-200 transition-colors">
                Repositories
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
              <Link to={`/repo/${selectedRepo.id}`} className="flex items-center gap-1.5 text-gray-200 font-medium hover:text-indigo-400 transition-colors">
                <Github className="w-3.5 h-3.5 text-gray-400" />
                <span>{selectedRepo.name}</span>
              </Link>
              <Badge variant={selectedRepo.indexStatus === 'ready' ? 'success' : 'warning'} size="xs">
                {selectedRepo.indexStatus === 'ready' ? 'Indexed' : 'Syncing'}
              </Badge>
            </div>
          )}
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-3">
          {isPublicPage ? (
            <div className="flex items-center gap-3">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">Product Tour</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="sm">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm">Get Started</Button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* Plan pill */}
              <Link to="/settings" className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#161a26] border border-[#262c3e] text-xs text-gray-300 hover:border-indigo-500/50 transition-colors">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span className="capitalize font-medium">{user?.plan || 'Free'} Plan</span>
                <span className="text-gray-500">|</span>
                <span className="text-indigo-300 font-mono">{user?.aiRequestsUsed || 0}/{user?.aiRequestsLimit || 50} requests</span>
              </Link>

              {/* Repositories switcher link */}
              <Link to="/repositories">
                <Button variant="secondary" size="sm" className="hidden md:inline-flex">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Switch Repo</span>
                </Button>
              </Link>

              {/* Profile icon */}
              <Link to="/settings" className="flex items-center gap-2 p-1 rounded-lg hover:bg-[#1c202d] transition-colors">
                <img
                  src={user?.avatarUrl}
                  alt={user?.name || 'User'}
                  className="w-8 h-8 rounded-full border border-[#2e344a] object-cover"
                />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
