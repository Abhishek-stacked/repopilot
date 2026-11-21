# 🚀 RepoPilot — AI-Powered GitHub Repository Intelligence SaaS

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20Tailwind-indigo.svg)](https://github.com/repopilot/repopilot)
[![Backend](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green.svg)](https://github.com/repopilot/repopilot)
[![ML](https://img.shields.io/badge/ML%20Engine-FastAPI%20%7C%20pgvector%20%7C%20SentenceTransformers-purple.svg)](https://github.com/repopilot/repopilot)

**RepoPilot** is a production-oriented AI SaaS platform that connects directly to GitHub repositories, parses their complete codebase into AST-aware semantic chunks, and empowers developers to inspect, debug, document, and review repositories with grounded, zero-hallucination citations.

---

## 🏗 Architecture Overview

```
                          ┌───────────────────────────┐
                          │    Developer Frontend     │
                          │ React + Vite + Tailwind   │
                          │   (Port 5173 / Port 80)   │
                          └─────────────┬─────────────┘
                                        │ REST / SSE
                                        ▼
                          ┌───────────────────────────┐
                          │   Node.js API Gateway     │
                          │    Express + BullMQ       │
                          │        (Port 3001)        │
                          └──────┬─────────────┬──────┘
                                 │             │
                OAuth & Webhooks │             │ Internal Dispatch
                                 ▼             ▼
  ┌───────────────────────────────┐   ┌───────────────────────────────┐
  │         GitHub API            │   │      Python ML Service        │
  │ (User Repos, Tree, Commits)   │   │  FastAPI + Sentence-Trans.    │
  └───────────────────────────────┘   │          (Port 8000)          │
                                      └──────────────┬────────────────┘
                                                     │
                                                     ▼
                                      ┌───────────────────────────────┐
                                      │   PostgreSQL 16 + pgvector    │
                                      │  (384-dim IVFFlat Cosine Ops) │
                                      └───────────────────────────────┘
```

---

## ⚡ Key Capabilities

1. **AST-Grounded RAG Code Chat**:
   - Queries answered with line-level file citations (`file:start_line-end_line`).
   - Hybrid search scoring combining BM25 keyword rankings and pgvector cosine similarity.
2. **Automated Code Review Engine**:
   - Scans for security vulnerabilities (ReDoS, CSRF, unvalidated parameters).
   - Identifies performance anti-patterns (N+1 queries) and duplicate code blocks.
3. **Automated Documentation Generator**:
   - Synthesizes `README.md`, System Architecture blueprints, API references, and Onboarding runbooks.
4. **Unit Test Suite Generation**:
   - Generates idiomatic Jest, Vitest, and PyTest test cases identifying untested edge cases.
5. **Multi-tenant SaaS Architecture**:
   - Free (50 queries/mo, 3 repos) vs Team Pro (1,000 queries/mo, unlimited private repos).
   - AES-256 token encryption at rest.

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, Zustand, Lucide Icons, React Router v7 |
| **Backend Gateway** | Node.js v24, Express, PostgreSQL ORM, BullMQ, Redis, Passport GitHub OAuth |
| **AI / ML Service** | Python 3.10+, FastAPI, `sentence-transformers` (`all-MiniLM-L6-v2`), `scikit-learn`, `pgvector` |
| **Database** | PostgreSQL 16 with `pgvector` extension, Redis 7 Alpine |
| **Security** | AES-256 token encryption, Helmet, CORS isolation, Prompt sanitization |

---

## 📦 Getting Started (Local Development on D: Drive)

### 1. Prerequisites
- **Node.js** v20+ & **pnpm** v11+
- **Python** 3.10+
- **PostgreSQL 16** with `pgvector` extension

### 2. Frontend Launch (Phase 1)
```bash
cd D:\repopilot\frontend
pnpm install
pnpm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Backend Setup (Phase 2)
```bash
cd D:\repopilot\backend
pnpm install
# Configure your .env from .env.example
node server.js
```

### 4. AI / ML Service Setup (Phase 3 & 4)
```bash
cd D:\repopilot\ai-service
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --port 8000 --reload
```

---

## 🔑 GitHub OAuth App Configuration
When registering your OAuth Application on GitHub:
- **Application name**: `RepoPilot Dev`
- **Homepage URL**: `http://localhost:5173`
- **Authorization callback URL**: `http://localhost:3001/api/auth/github/callback`

---

## 📄 License
MIT License. Built for modern software engineering teams.
