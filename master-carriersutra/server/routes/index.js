/**
 * server/routes/index.js
 * Joins every route file into one table, and lists the routes that need no sign in.
 */
const health = require('./health');
const signInAndSignUp = require('./sign-in-and-sign-up');
const progress = require('./progress');
const accountSettings = require('./account-settings');
const studyBuddy = require('./study-buddy');

const routes = Object.assign({}, health, signInAndSignUp, progress, accountSettings, studyBuddy);
const PUBLIC_ROUTES = new Set(['GET /api/health', 'POST /api/register', 'POST /api/login']);

module.exports = { routes, PUBLIC_ROUTES };
