import crypto from 'crypto';

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

export function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  const computed = crypto.scryptSync(password, salt, 64);
  const storedBuf = Buffer.from(storedHash, 'hex');
  if (computed.length !== storedBuf.length) return false;
  return crypto.timingSafeEqual(computed, storedBuf);
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function hashSessionToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function sanitizeText(value: unknown): string {
  if (value === null || value === undefined) return '';
  return String(value)
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .trim();
}

export function normalizePhone(phone: string): string {
  let cleaned = sanitizeText(phone).replace(/[\s\-()]/g, '');
  if (cleaned.startsWith('+880')) {
    cleaned = '0' + cleaned.slice(4);
  } else if (cleaned.startsWith('880') && cleaned.length === 13) {
    cleaned = '0' + cleaned.slice(3);
  } else if (/^1[3-9]\d{8}$/.test(cleaned)) {
    cleaned = '0' + cleaned;
  }
  return cleaned;
}

export function isValidBdPhone(phone: string): boolean {
  return /^01[3-9]\d{8}$/.test(normalizePhone(phone));
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizeText(email).toLowerCase());
}

export function generateId(prefix: string): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}_${ts}_${rnd}`;
}

// In-memory login rate limiter (5 attempts per 15 mins)
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();

export function checkRateLimit(key: string): { allowed: boolean; remainingMinutes: number } {
  const normalized = key.toLowerCase().trim();
  const entry = loginAttempts.get(normalized);
  if (!entry) return { allowed: true, remainingMinutes: 0 };
  if (Date.now() < entry.lockedUntil) {
    const mins = Math.ceil((entry.lockedUntil - Date.now()) / 60000);
    return { allowed: false, remainingMinutes: mins };
  }
  if (Date.now() >= entry.lockedUntil && entry.lockedUntil > 0) {
    loginAttempts.delete(normalized);
  }
  return { allowed: true, remainingMinutes: 0 };
}

export function recordFailedLogin(key: string, maxAttempts = 5, lockMinutes = 15): void {
  const normalized = key.toLowerCase().trim();
  const entry = loginAttempts.get(normalized) || { count: 0, lockedUntil: 0 };
  entry.count += 1;
  if (entry.count >= maxAttempts) {
    entry.lockedUntil = Date.now() + lockMinutes * 60 * 1000;
  }
  loginAttempts.set(normalized, entry);
}

export function clearRateLimit(key: string): void {
  loginAttempts.delete(key.toLowerCase().trim());
}
