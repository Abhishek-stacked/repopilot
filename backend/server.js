import 'dotenv/config';
import app from './src/app.js';
import { sequelize } from './src/models/index.js';

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    console.log('[Database] Connecting and synchronizing models...');
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('[Database] Synchronized successfully.');

    app.listen(PORT, () => {
      console.log(`[RepoPilot Backend] Server listening on http://localhost:${PORT}`);
      console.log(`[RepoPilot Backend] GitHub OAuth Callback: http://localhost:${PORT}/api/auth/github/callback`);
      console.log(`[RepoPilot Backend] Health Check: http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('[RepoPilot Backend] Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
