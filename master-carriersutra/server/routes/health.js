/**
 * server/routes/health.js
 * Routes: Is the server up, and which features are switched on.
 */
const { sendJson } = require('../http-utils');
const { currentVoiceProblem, voiceProviders } = require('../voices');
const { ANTHROPIC_KEY } = require('../config');

module.exports = {
  'GET /api/health': (req, res) => sendJson(res, 200, { ok: true, tts: voiceProviders.length > 0, ttsProblem: currentVoiceProblem(), ai: !!ANTHROPIC_KEY }),
};
