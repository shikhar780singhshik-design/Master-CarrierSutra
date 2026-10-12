/**
 * server.js
 * Master Carriersutra: the server starts here. Run it with: npm start
 */
const http = require('node:http');
const { SECURITY_HEADERS, readJsonBody, sendJson } = require('./server/http-utils');
const { ANTHROPIC_KEY, FREE_TEST_VOICE, PORT, PRODUCTION } = require('./server/config');
const { serveFile } = require('./server/static-files');
const { readToken } = require('./server/security');
const { families } = require('./server/storage');
const { checkVoices, voiceProviders } = require('./server/voices');
const { routes, PUBLIC_ROUTES } = require('./server/routes');

const server = http.createServer(async (req, res) => {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) res.setHeader(name, value);
  if (PRODUCTION) res.setHeader('Strict-Transport-Security', 'max-age=15552000');

  // While developing, allow the page to be opened from VS Code Live Server (another port on localhost).
  const origin = req.headers.origin || '';
  if (!PRODUCTION && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
    res.setHeader('Vary', 'Origin');
  }
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }

  const pathname = new URL(req.url, 'http://x').pathname;
  if (!pathname.startsWith('/api/')) return serveFile(req, res);

  const routeKey = req.method + ' ' + pathname;
  const handler = routes[routeKey];
  if (!handler) return sendJson(res, 404, { error: 'Not found' });
  try {
    let user = null;
    if (!PUBLIC_ROUTES.has(routeKey)) {
      user = readToken((req.headers.authorization || '').replace('Bearer ', ''));
      const family = user && families[user.code];
      if (!family || (family.tv || 0) !== user.v) return sendJson(res, 401, { error: 'Please sign in again.' });
    }
    const body = req.method === 'GET' ? {} : await readJsonBody(req);
    await handler(req, res, body, user);
  } catch (error) {
    if (!res.headersSent) sendJson(res, 400, { error: 'Bad request' });
  }
});

server.requestTimeout = 20000;

server.headersTimeout = 10000;

server.listen(PORT, () => {
  console.log('Master Carriersutra is running at http://localhost:' + PORT);
  console.log('AI tutor: ' + (ANTHROPIC_KEY ? 'on' : 'OFF (add ANTHROPIC_API_KEY to .env)'));
  console.log('Cloud voice: ' + (voiceProviders.length ? voiceProviders.map((p) => p.name).join(' + ') : 'OFF (only voices already installed on each device will speak)'));
  if (FREE_TEST_VOICE) console.warn('FREE_TEST_VOICE is on. This is for testing on your own computer only. Use Google or Azure for a real launch.');
  if (voiceProviders.length) checkVoices();
});
