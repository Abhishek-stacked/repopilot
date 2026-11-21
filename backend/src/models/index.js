import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'repopilot_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial DB Structure
const initialData = {
  users: [
    {
      id: 'usr_default_01',
      email: 'abhishek@repopilot.io',
      name: 'Abhishek Mishra',
      passwordHash: '$2a$10$wT0vV2fT4kPq8eZ5n2A7re1fI.kY59B6fF68j1t7W1wE1w8B5zBGe', // 'SecurePass123!'
      githubId: 4040774,
      githubUsername: 'abhishek-dev',
      githubAccessToken: null,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      plan: 'free',
      aiRequestsUsed: 18,
      aiRequestsLimit: 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ],
  repositories: [
    {
      id: 'repo_001',
      userId: 'usr_default_01',
      githubRepoId: 101,
      fullName: 'repopilot/repopilot-core',
      name: 'repopilot-core',
      description: 'Autonomous repository indexing, AST parsing, and RAG semantic engine for codebases.',
      language: 'TypeScript',
      isPrivate: false,
      defaultBranch: 'main',
      indexStatus: 'ready',
      indexedAt: new Date().toISOString(),
      fileCount: 142,
      sizeKb: 3840,
      qualityScore: 94,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'repo_002',
      userId: 'usr_default_01',
      githubRepoId: 102,
      fullName: 'fintech-org/ecommerce-payment-gateway',
      name: 'ecommerce-payment-gateway',
      description: 'High-throughput Stripe and PayPal payment orchestration service with webhook retry queues.',
      language: 'Python',
      isPrivate: true,
      defaultBranch: 'production',
      indexStatus: 'ready',
      indexedAt: new Date().toISOString(),
      fileCount: 86,
      sizeKb: 2150,
      qualityScore: 88,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ],
  repositoryFiles: [],
  chatSessions: [
    {
      id: 'chat_01',
      userId: 'usr_default_01',
      repositoryId: 'repo_001',
      title: 'Explain Authentication Flow & JWT Handling',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ],
  chatMessages: [],
  usageLogs: [],
};

function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf8');
    return initialData;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return initialData;
  }
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// Model wrapper with Sequelize-like API
class ModelInstance {
  constructor(tableName, data) {
    this._tableName = tableName;
    Object.assign(this, data);
  }

  async save() {
    const db = readDb();
    const list = db[this._tableName];
    this.updatedAt = new Date().toISOString();
    const idx = list.findIndex((item) => item.id === this.id);
    if (idx !== -1) {
      list[idx] = { ...this };
      delete list[idx]._tableName;
    }
    writeDb(db);
    return this;
  }
}

function createModel(tableName) {
  return {
    async findOne({ where = {} }) {
      const db = readDb();
      const list = db[tableName] || [];
      const item = list.find((record) => {
        return Object.entries(where).every(([k, v]) => record[k] == v);
      });
      return item ? new ModelInstance(tableName, item) : null;
    },

    async findByPk(id) {
      const db = readDb();
      const list = db[tableName] || [];
      const item = list.find((record) => record.id === id);
      return item ? new ModelInstance(tableName, item) : null;
    },

    async findAll({ where = {}, order, limit } = {}) {
      const db = readDb();
      let list = db[tableName] || [];
      if (Object.keys(where).length > 0) {
        list = list.filter((record) => {
          return Object.entries(where).every(([k, v]) => record[k] == v);
        });
      }
      if (order && order[0]) {
        const [field, direction] = order[0];
        list = [...list].sort((a, b) => {
          if (direction?.toUpperCase() === 'DESC') {
            return b[field] > a[field] ? 1 : -1;
          }
          return a[field] > b[field] ? 1 : -1;
        });
      }
      if (limit) {
        list = list.slice(0, limit);
      }
      return list.map((item) => new ModelInstance(tableName, item));
    },

    async create(data) {
      const db = readDb();
      const newRecord = {
        id: data.id || `id_${crypto.randomBytes(8).toString('hex')}`,
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (!db[tableName]) db[tableName] = [];
      db[tableName].push(newRecord);
      writeDb(db);
      return new ModelInstance(tableName, newRecord);
    },

    async destroy({ where = {} }) {
      const db = readDb();
      if (!db[tableName]) return 0;
      const originalCount = db[tableName].length;
      db[tableName] = db[tableName].filter((record) => {
        return !Object.entries(where).every(([k, v]) => record[k] == v);
      });
      writeDb(db);
      return originalCount - db[tableName].length;
    }
  };
}

export const User = createModel('users');
export const Repository = createModel('repositories');
export const RepositoryFile = createModel('repositoryFiles');
export const ChatSession = createModel('chatSessions');
export const ChatMessage = createModel('chatMessages');
export const UsageLog = createModel('usageLogs');

export const sequelize = {
  async authenticate() {
    return true;
  },
  async sync() {
    readDb();
    return true;
  }
};
