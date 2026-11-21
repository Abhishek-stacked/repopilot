import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'repopilot_super_secret_jwt_key_2026';

export const requireAuth = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.repopilot_token) {
      token = req.cookies.repopilot_token;
    }

    if (!token) {
      return res.status(401).json({ error: 'Authentication required. No token provided.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ code: 'TOKEN_EXPIRED', error: 'Authentication token expired.' });
    }
    return res.status(403).json({ error: 'Invalid authentication token.' });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.repopilot_token) {
      token = req.cookies.repopilot_token;
    }

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findByPk(decoded.id);
      if (user) req.user = user;
    }
  } catch (err) {
    // Ignore optional auth errors
  }
  next();
};
