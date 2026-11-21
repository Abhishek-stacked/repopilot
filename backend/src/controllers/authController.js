import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import * as githubService from '../services/githubService.js';
import * as encryptionService from '../services/encryptionService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'repopilot_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = '7d';
const OAUTH_STATE_COOKIE = 'gh_oauth_state';
const OAUTH_STATE_MAX_AGE_MS = 10 * 60 * 1000;

function statesMatch(expected, received) {
  if (typeof expected !== 'string' || typeof received !== 'string') return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      plan: user.plan,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export async function signup(req, res, next) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'A user with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      passwordHash,
      name: name || email.split('@')[0],
      avatarUrl: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(email)}`,
      plan: 'free',
      aiRequestsUsed: 0,
      aiRequestsLimit: 50,
    });

    const token = generateToken(user);

    res.cookie('repopilot_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        plan: user.plan,
        aiRequestsUsed: user.aiRequestsUsed,
        aiRequestsLimit: user.aiRequestsLimit,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);

    res.cookie('repopilot_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        githubUsername: user.githubUsername,
        avatarUrl: user.avatarUrl,
        plan: user.plan,
        aiRequestsUsed: user.aiRequestsUsed,
        aiRequestsLimit: user.aiRequestsLimit,
      },
    });
  } catch (err) {
    next(err);
  }
}

export function githubOAuth(req, res) {
  if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
    // Sending the browser to GitHub without credentials just lands it on a
    // GitHub error page; say what is missing instead.
    return res.redirect(
      `/login?error=${encodeURIComponent('GitHub sign-in is not configured on this deployment. Sign up with email instead.')}`
    );
  }

  const state = crypto.randomBytes(16).toString('hex');
  res.cookie(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: OAUTH_STATE_MAX_AGE_MS,
  });

  const url = githubService.getOAuthUrl(state, req);
  res.redirect(url);
}

export async function githubCallback(req, res, next) {
  try {
    const { code, state } = req.query;
    const expectedState = req.cookies?.[OAUTH_STATE_COOKIE];
    res.clearCookie(OAUTH_STATE_COOKIE, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    if (!code) {
      return res.redirect('/login?error=' + encodeURIComponent('Missing authorization code'));
    }

    // Without this check the callback accepts any code a third party injects.
    if (!statesMatch(expectedState, state)) {
      return res.redirect(
        '/login?error=' + encodeURIComponent('GitHub returned an unexpected state. Start the sign-in again.')
      );
    }

    // 1. Exchange code for access token
    const rawAccessToken = await githubService.exchangeCodeForToken(code);

    // 2. Fetch user profile from GitHub
    const profile = await githubService.fetchUserProfile(rawAccessToken);

    // 3. Encrypt GitHub access token before saving
    const encryptedToken = encryptionService.encrypt(rawAccessToken);

    // 4. Upsert user in database
    let user = await User.findOne({ where: { githubId: profile.githubId } });

    if (!user) {
      // Check if email already registered via local signup
      user = await User.findOne({ where: { email: profile.email } });
      if (user) {
        user.githubId = profile.githubId;
        user.githubUsername = profile.githubUsername;
        user.githubAccessToken = encryptedToken;
        user.avatarUrl = profile.avatarUrl || user.avatarUrl;
        await user.save();
      } else {
        user = await User.create({
          email: profile.email,
          name: profile.name,
          githubId: profile.githubId,
          githubUsername: profile.githubUsername,
          githubAccessToken: encryptedToken,
          avatarUrl: profile.avatarUrl,
          plan: 'free',
          aiRequestsUsed: 0,
          aiRequestsLimit: 50,
        });
      }
    } else {
      user.githubAccessToken = encryptedToken;
      user.githubUsername = profile.githubUsername;
      user.avatarUrl = profile.avatarUrl || user.avatarUrl;
      await user.save();
    }

    // 5. Generate RepoPilot JWT session token
    const token = generateToken(user);

    res.cookie('repopilot_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 6. Redirect to frontend dashboard with token parameter
    return res.redirect(`/dashboard?token=${encodeURIComponent(token)}`);
  } catch (err) {
    console.error('GitHub OAuth Callback Error:', err.message);
    return res.redirect(`/login?error=${encodeURIComponent(err.message)}`);
  }
}

export async function getMe(req, res) {
  const user = req.user;
  return res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      githubUsername: user.githubUsername,
      githubConnected: !!user.githubAccessToken,
      avatarUrl: user.avatarUrl,
      plan: user.plan,
      aiRequestsUsed: user.aiRequestsUsed,
      aiRequestsLimit: user.aiRequestsLimit,
    },
  });
}

export function logout(req, res) {
  res.clearCookie('repopilot_token');
  return res.json({ message: 'Logged out successfully' });
}
