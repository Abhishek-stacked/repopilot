import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './pages/Dashboard';
import { Repositories } from './pages/Repositories';
import { RepoOverview } from './pages/RepoOverview';
import { ChatWorkspace } from './pages/ChatWorkspace';
import { CodeReview } from './pages/CodeReview';
import { DocsGenerator } from './pages/DocsGenerator';
import { TestGenerator } from './pages/TestGenerator';
import { Settings } from './pages/Settings';
import { useAuthStore } from './stores/useAuthStore';

export default function App() {
  const { initializeFromToken } = useAuthStore();

  React.useEffect(() => {
    initializeFromToken();
  }, [initializeFromToken]);
  return (
    <BrowserRouter>
      <Routes>
        {/* Full-width views without repo sidebar */}
        <Route element={<AppLayout withSidebar={false} />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/repositories" element={<Repositories />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        {/* Repository workspace views with sidebar */}
        <Route element={<AppLayout withSidebar={true} />}>
          <Route path="/repo/:id" element={<RepoOverview />} />
          <Route path="/repo/:id/chat" element={<ChatWorkspace />} />
          <Route path="/repo/:id/review" element={<CodeReview />} />
          <Route path="/repo/:id/docs" element={<DocsGenerator />} />
          <Route path="/repo/:id/tests" element={<TestGenerator />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
