/**
 * server/security.js
 * Passwords, login tokens, rate limits and account lockouts.
 */
const crypto = require('node:crypto');
const { SECRET } = require('./config');
const { families } = require('./storage');
const { clientIp } = require('./http-utils');

function hashSecret(text) {
  const salt = crypto.randomBytes(16);
  return salt.toString('hex') + ':' + crypto.scryptSync(text, salt, 32).toString('hex');
}

function secretMatches(text, stored) {
  const [salt, key] = stored.split(':');
  const attempt = crypto.scryptSync(text, Buffer.from(salt, 'hex'), 32);
  return crypto.timingSafeEqual(attempt, Buffer.from(key, 'hex'));
}

const sign = (data) => crypto.createHmac('sha256', SECRET).update(data).digest('base64url');

function makeToken(code, role) {
  const body = Buffer.from(JSON.stringify({ code, role, v: families[code].tv || 0, exp: Date.now() + 7 * 24 * 3600 * 1000 })).toString('base64url');
  return body + '.' + sign(body);
}

function readToken(token) {
  try {
    const [body, signature] = String(token).split('.');
    const expected = sign(body);
    if (!signature || signature.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    const data = JSON.parse(Buffer.from(body, 'base64url').toString());
    return data.exp > Date.now() ? data : null;
  } catch { return null; }
}

// "allow at most N tries per time window", counted per key (an IP address or a family code)
const attempts = new Map();

function allow(key, max, windowMs) {
  const now = Date.now();
  const recent = (attempts.get(key) || []).filter((t) => now - t < windowMs);
  recent.push(now);
  attempts.set(key, recent);
  return recent.length <= max;
}

setInterval(() => {
  const cutoff = Date.now() - 3600 * 1000;
  for (const [key, times] of attempts) if (!times.some((t) => t > cutoff)) attempts.delete(key);
}, 10 * 60 * 1000).unref();

// After 5 wrong tries a family code is locked for 15 minutes, after 10 for a day.
// A made-up hash is checked for unknown codes too, so response time never reveals which codes exist.
const DUMMY_HASH = hashSecret('not-a-real-password');

const lockouts = new Map();

function noteFailure(code, req) {
  const entry = lockouts.get(code) || { n: 0, until: 0 };
  entry.n++;
  if (entry.n >= 5) entry.until = Date.now() + (entry.n >= 10 ? 24 * 3600 * 1000 : 15 * 60 * 1000);
  lockouts.set(code, entry);
  console.warn('[security] failed sign in for', code.slice(0, 2) + '****', 'from', clientIp(req));
}

module.exports = { DUMMY_HASH, allow, hashSecret, lockouts, makeToken, noteFailure, readToken, secretMatches };
