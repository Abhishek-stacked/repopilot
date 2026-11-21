import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Bot, 
  ShieldCheck, 
  Sparkles, 
  Terminal, 
  FileCode2, 
  CheckCircle2, 
  ArrowRight,
  GitPullRequest,
  Search,
  Zap,
  Lock,
  ChevronRight
} from 'lucide-react';
import { Github } from '../components/ui/GithubIcon';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';

export const Landing = () => {
  return (
    <div className="relative overflow-hidden">
      {/* Background radial gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-indigo-600/15 via-cyan-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero section */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-800/50 text-indigo-300 text-xs font-medium mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          <span>RepoPilot 2.0 with AST-Grounded RAG is now live</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
          AI-Powered GitHub Intelligence for <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-300 bg-clip-text text-transparent">Complex Codebases</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Connect your repositories, index every function and AST node into pgvector embeddings, and query your codebase with exact line-level citations. No hallucinations.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/signup">
            <Button size="lg" className="w-full sm:w-auto gap-2">
              <Github className="w-4 h-4" />
              <span>Connect GitHub Free</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Sign In
            </Button>
          </Link>
        </div>

        <div className="mt-6 flex items-center justify-center gap-6 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Never trains on private code</span>
          <span className="flex items-center gap-1.5"><Lock className="w-4 h-4 text-indigo-400" /> AES-256 token encryption</span>
          <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-400" /> 384-dim pgvector index</span>
        </div>

        {/* Hero Code & Chat Preview */}
        <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-[#232738] bg-[#0c0e17] shadow-2xl shadow-indigo-950/30 overflow-hidden text-left">
          <div className="flex items-center justify-between px-4 py-3 bg-[#131622] border-b border-[#232738]">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-xs font-mono text-gray-400">repopilot-core / src/auth/jwt.ts</span>
            </div>
            <Badge variant="primary" size="xs">Grounded RAG Active</Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#232738]">
            {/* Left: Code AST */}
            <div className="lg:col-span-6 p-4 font-mono text-xs text-gray-300 bg-[#090b12] overflow-x-auto">
              <div className="text-gray-500 mb-2">// File: src/auth/jwt.ts (Lines 24-38)</div>
              <div className="text-indigo-400">export const <span className="text-blue-300">verifyAccessToken</span> = async (req, res, next) =&gt; &#123;</div>
              <div className="pl-4 text-gray-400">const authHeader = req.headers.authorization;</div>
              <div className="pl-4 text-gray-400">if (!authHeader?.startsWith('Bearer ')) return res.status(401);</div>
              <div className="pl-4 text-amber-300">const token = authHeader.split(' ')[1];</div>
              <div className="pl-4 text-emerald-400">// pgvector citation verified</div>
              <div className="pl-4 text-gray-300">const payload = jwt.verify(token, SECRET);</div>
              <div className="text-indigo-400">&#125;;</div>
            </div>

            {/* Right: AI response bubble */}
            <div className="lg:col-span-6 p-5 bg-[#0e111a] flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5" />
                  <span>AI Grounded Citation</span>
                </div>
                <p className="text-xs text-gray-200 leading-relaxed">
                  "Authentication verifies access tokens via <code className="text-indigo-300 font-mono">verifyAccessToken</code> in <code className="text-cyan-300 font-mono">src/auth/jwt.ts:24</code>. If expired, it triggers a 401 with <code className="text-amber-300 font-mono">TOKEN_EXPIRED</code> for cookie rotation."
                </p>
                <div className="mt-3 inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#181d2a] border border-[#2a3147] text-[11px] text-gray-300">
                  <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>src/auth/jwt.ts : L24-38</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1f2433] flex items-center justify-between text-xs text-gray-500">
                <span>Vector match score: 98.4%</span>
                <span className="text-emerald-400 font-medium">0 Hallucinations</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-6xl mx-auto px-4 py-20 border-t border-[#1a1f2e]">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Badge variant="primary">Core Capabilities</Badge>
          <h2 className="text-2xl sm:text-4xl font-bold text-white mt-3">
            Engineered for Real Engineering Teams
          </h2>
          <p className="text-sm text-gray-400 mt-2">
            Not a prompt playground. A full-stack developer intelligence platform that hooks directly into your Git lifecycle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card hoverEffect className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Semantic RAG Code Search</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Chunks code along AST boundaries and stores 384-dimensional sentence transformer embeddings into PostgreSQL pgvector for sub-second retrieval.
            </p>
          </Card>

          <Card hoverEffect className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-rose-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Automated Code Reviews</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Scans for security vulnerabilities (ReDoS, CSRF, SQL injection), performance bottlenecks (N+1 queries), and duplicate code blocks with severity ratings.
            </p>
          </Card>

          <Card hoverEffect className="space-y-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <FileCode2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Auto Docs & Test Suites</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Generates production-grade READMEs, architecture blueprints, API schemas, and framework-specific unit test suites (Jest, PyTest, Go).
            </p>
          </Card>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-5xl mx-auto px-4 py-20 border-t border-[#1a1f2e]">
        <div className="text-center max-w-xl mx-auto mb-12">
          <Badge variant="purple">Simple Transparent Pricing</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2">Start Free, Scale as You Ship</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Free Tier */}
          <Card className="flex flex-col justify-between border-[#282e42]">
            <div>
              <div className="text-sm font-medium text-gray-400">Developer Free</div>
              <div className="text-3xl font-extrabold text-white mt-2">$0 <span className="text-xs font-normal text-gray-500">/ forever</span></div>
              <p className="text-xs text-gray-400 mt-2">For individuals and open-source contributors.</p>

              <div className="mt-6 space-y-2.5 text-xs text-gray-300">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Up to 3 Public Repositories</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 50 AI queries / month</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> AST Semantic Code Search</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Basic Code Review finding scans</div>
              </div>
            </div>

            <Link to="/signup" className="mt-8">
              <Button variant="outline" className="w-full">Get Started Free</Button>
            </Link>
          </Card>

          {/* Pro Tier */}
          <Card className="flex flex-col justify-between border-indigo-500/50 bg-[#141726] shadow-xl shadow-indigo-950/40 relative">
            <div className="absolute -top-3 right-6">
              <Badge variant="primary" size="xs">RECOMMENDED</Badge>
            </div>

            <div>
              <div className="text-sm font-medium text-indigo-400">Team Pro</div>
              <div className="text-3xl font-extrabold text-white mt-2">$29 <span className="text-xs font-normal text-gray-500">/ seat / month</span></div>
              <p className="text-xs text-gray-400 mt-2">For startups and engineering teams analyzing private repos.</p>

              <div className="mt-6 space-y-2.5 text-xs text-gray-300">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Unlimited Public & Private Repos</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> 1,000 AI queries / month</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Comprehensive Vulnerability & ReDoS scans</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Automated Test Suite Generator</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-indigo-400" /> Priority pgvector indexing pipeline</div>
              </div>
            </div>

            <Link to="/signup" className="mt-8">
              <Button variant="primary" className="w-full">Start 14-Day Pro Trial</Button>
            </Link>
          </Card>
        </div>
      </section>
    </div>
  );
};
