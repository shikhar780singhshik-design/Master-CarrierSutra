/**
 * server/routes/account-settings.js
 * Routes: Changing the PIN or password, signing out everywhere, deleting an account.
 */
const { families, saveFamilies } = require('../storage');
const { sendJson } = require('../http-utils');
const { allow, hashSecret, secretMatches } = require('../security');
const { isWeak } = require('../validation');

module.exports = {
  'POST /api/logout-all': (req, res, body, user) => {
    families[user.code].tv = (families[user.code].tv || 0) + 1; // every older token now fails the version check
    saveFamilies();
    sendJson(res, 200, { ok: true });
  },

  'POST /api/change-secret': (req, res, body, user) => {
    const family = families[user.code];
    const { which, current, next } = body;
    if (!allow('secret:' + user.code, 8, 3600 * 1000)) return sendJson(res, 429, { error: 'Too many attempts. Please try again later.' });
    // A student changes their PIN with the PIN. A parent changes the parent password, or resets the PIN, with the parent password.
    const mayChange = (which === 'pin') || (which === 'pw' && user.role === 'parent');
    const currentHash = which === 'pin' && user.role === 'student' ? family.pinHash : family.pwHash;
    if (!mayChange || !current || !secretMatches(String(current), currentHash)) return sendJson(res, 403, { error: 'The current PIN or password is not correct.' });
    const minimum = which === 'pin' ? 6 : 8;
    if (String(next || '').length < minimum || isWeak(String(next))) return sendJson(res, 400, { error: 'Use at least ' + minimum + ' characters and avoid easy ones like 123456.' });
    const other = which === 'pin' ? family.pwHash : family.pinHash;
    if (secretMatches(String(next), other)) return sendJson(res, 400, { error: 'The PIN and the parent password must be different.' });
    if (which === 'pin') family.pinHash = hashSecret(String(next)); else family.pwHash = hashSecret(String(next));
    family.tv = (family.tv || 0) + 1; // signs out every device
    saveFamilies();
    sendJson(res, 200, { ok: true });
  },

  'POST /api/delete-account': (req, res, body, user) => {
    const family = families[user.code];
    if (!allow('delete:' + user.code, 5, 3600 * 1000)) return sendJson(res, 429, { error: 'Too many attempts. Please try again later.' });
    if (user.role !== 'parent' || !body.secret || !secretMatches(String(body.secret), family.pwHash)) return sendJson(res, 403, { error: 'Only a parent can delete the account, with the parent password.' });
    delete families[user.code];
    saveFamilies();
    sendJson(res, 200, { ok: true });
  },
};
