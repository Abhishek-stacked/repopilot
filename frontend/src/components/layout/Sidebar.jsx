import React from 'react';
import { NavLink, useParams } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquareCode,
  ShieldAlert,
  FileText,
  TestTube2,
  Settings,
  GitBranch,
  RefreshCw,
} from 'lucide-react';
import { useRepoStore } from '../../stores/useRepoStore';
import { Badge } from '../ui/Badge';

export const Sidebar = () => {
  const { id } = useParams();
  const { selectedRepo, triggerReindex } = useRepoStore();
  const repoId = id || selectedRepo?.id || 'repo_001';

  const navItems = [
    { label: 'Overview', to: `/repo/${repoId}`, icon: LayoutDashboard },
    { label: 'AI Code Chat', to: `/repo/${repoId}/chat`, icon: MessageSquareCode, badge: 'RAG' },
    { label: 'Code Review', to: `/repo/${repoId}/review`, icon: ShieldAlert, badge: selectedRepo?.metrics?.bugs + ' bugs' },
    { label: 'Doc Generator', to: `/repo/${repoId}/docs`, icon: FileText },
    { label: 'Test Suite', to: `/repo/${repoId}/tests`, icon: TestTube2 },
  ];

  return (
    <aside className="w-64 border-r border-[#1f2433] bg-[#0c0d14] flex flex-col flex-shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Active Repo summary */}
      <div className="p-4 border-b border-[#1f2433]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-gray-500">Workspace</span>
          <button
            onClick={() => triggerReindex(repoId)}
            title="Refresh indexing"
            className="text-gray-400 hover:text-indigo-400 p-1 rounded hover:bg-[#1a1e2c] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${selectedRepo?.indexStatus === 'indexing' ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>
        <div className="text-sm font-semibold text-white truncate">{selectedRepo?.name}</div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
          <GitBranch className="w-3 h-3 text-indigo-400" />
          <span>{selectedRepo?.defaultBranch || 'main'}</span>
          <span className="text-gray-600">•</span>
          <span>{selectedRepo?.fileCount || 0} files</span>
        </div>
      </div>

      {/* Nav items */}
      <div className="p-3 space-y-1 flex-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              end={item.to === `/repo/${repoId}`}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/25'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#151824]'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <Badge variant={item.badge.includes('bugs') ? 'danger' : 'primary'} size="xs">
                  {item.badge}
                </Badge>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Bottom settings link */}
      <div className="p-3 border-t border-[#1f2433]">
        <NavLink
          to="/settings"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-gray-400 hover:text-gray-200 hover:bg-[#151824] transition-colors"
        >
          <Settings className="w-4 h-4" />
          <span>Settings & Quota</span>
        </NavLink>
      </div>
    </aside>
  );
};
