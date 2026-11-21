import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../../frontend/dist');

import authRoutes from './routes/auth.js';
import repoRoutes from './routes/repositories.js';
import chatRoutes from './routes/chat.js';
import reviewRoutes from './routes/review.js';
import docsRoutes from './routes/docs.js';
import testsRoutes from './routes/tests.js';
import userRoutes from './routes/user.js';
import { errorHandler } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';

const app = express();

// Security & Parsing
app.use(helmet({
  contentSecurityPolicy: false,
}));

const allowedOrigins = [
  'http://localhost:5180',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(null, true); // Allow all dev local origins
  },
  credentials: true,
}));

app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Apply rate limiting
app.use('/api', generalLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'repopilot-backend',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/repos', repoRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/repos', reviewRoutes);
app.use('/api/repos', docsRoutes);
app.use('/api/repos', testsRoutes);
app.use('/api/user', userRoutes);

// Serve static frontend in production (Single-Service Render Deployment)
app.use(express.static(distPath));

// For non-API routes, serve React index.html for SPA client-side routing
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    const indexHtml = path.join(distPath, 'index.html');
    return res.sendFile(indexHtml, (err) => {
      if (err) next();
    });
  }
  next();
});

// Global Error Handler
app.use(errorHandler);

export default app;
