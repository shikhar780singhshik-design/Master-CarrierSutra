/**
 * server/routes/sign-in-and-sign-up.js
 * Routes: Creating accounts and signing in.
 */
const { DUMMY_HASH, allow, hashSecret, lockouts, makeToken, noteFailure, secretMatches } = require('../security');
const { clientIp, sendJson } = require('../http-utils');
const { cleanProfile, isWeak } = require('../validation');
const { families, newFamilyCode, saveFamilies } = require('../storage');

module.exports = {
  'POST /api/register': (req, res, body) => {
    if (!allow('register:' + clientIp(req), 10, 3600 * 1000)) return sendJson(res, 429, { error: 'Too many attempts. Please try again later.' });
    const { p, pin, pw } = body;
    if (!p || !p.name || String(pin || '').length < 6 || String(pw || '').length < 8 || isWeak(String(pin)) || isWeak(String(pw)) || String(pin) === String(pw)) {
      return sendJson(res, 400, { error: 'Choose a student PIN of 6 or more characters and a different parent password of 8 or more. Avoid things like 123456 or repeated letters.' });
    }
    const code = newFamilyCode();
    families[code] = { code, profile: cleanProfile(p), state: {}, pinHash: hashSecret(String(pin)), pwHash: hashSecret(String(pw)), created: Date.now() };
    saveFamilies();
    sendJson(res, 200, { code, token: makeToken(code, 'student') });
  },

  'POST /api/login': (req, res, body) => {
    const code = String(body.code || '').toUpperCase().trim();
    if (!allow('login:' + clientIp(req), 15, 15 * 60 * 1000) || !allow('login-code:' + code, 10, 15 * 60 * 1000)) {
      return sendJson(res, 429, { error: 'Too many attempts. Try again in a few minutes.' });
    }
    const role = body.role === 'parent' ? 'parent' : 'student';
    const lock = lockouts.get(code);
    if (lock && lock.until > Date.now()) return sendJson(res, 423, { error: 'This account is locked for a while after too many wrong tries. Please wait and try again.' });
    const family = families[code];
    const stored = (family && (role === 'parent' ? family.pwHash : family.pinHash)) || DUMMY_HASH;
    const good = !!family && !!body.secret && secretMatches(String(body.secret), stored);
    if (!good) { noteFailure(code, req); return sendJson(res, 401, { error: 'Wrong family code or password.' }); }
    lockouts.delete(code);
    sendJson(res, 200, { token: makeToken(code, role), role, code, state: { ...family.state, p: family.profile } });
  },
};
