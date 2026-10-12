/**
 * server/routes/progress.js
 * Routes: Loading and saving a student's progress.
 */
const { families, saveFamilies } = require('../storage');
const { sendJson } = require('../http-utils');
const { cleanProfile, cleanState } = require('../validation');

module.exports = {
  'GET /api/state': (req, res, body, user) => {
    const family = families[user.code];
    if (!family) return sendJson(res, 404, { error: 'Not found' });
    sendJson(res, 200, { ...family.state, p: family.profile });
  },

  'PUT /api/state': (req, res, body, user) => {
    if (user.role !== 'student') return sendJson(res, 403, { error: 'Parents can view progress only.' });
    const next = body.state;
    const family = families[user.code];
    if (!family || !next || typeof next !== 'object') return sendJson(res, 400, { error: 'Bad state' });
    family.profile = cleanProfile(next.p);
    family.state = cleanState(next);
    saveFamilies();
    sendJson(res, 200, { ok: true });
  },
};
