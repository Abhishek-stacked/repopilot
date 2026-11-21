import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const RAW_KEY = process.env.ENCRYPTION_KEY || 'repopilot_default_secure_key_2026';
// Ensure key is exactly 32 bytes
const KEY = crypto.createHash('sha256').update(RAW_KEY).digest();

export function encrypt(text) {
  if (!text) return null;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
}

export function decrypt(encryptedData) {
  if (!encryptedData || !encryptedData.includes(':')) return null;
  try {
    const [ivHex, encryptedText] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Failed to decrypt token:', err.message);
    return null;
  }
}
