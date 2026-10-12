/**
 * server/static-files.js
 * Serving the website files safely.
 */
const fs = require('node:fs');
const path = require('node:path');
const { PRODUCTION, PUBLIC_DIR } = require('./config');

const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.json': 'application/json' };

function serveFile(req, res) {
  let urlPath;
  try { urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { res.writeHead(400); return res.end('Bad request'); }
  const wanted = path.normalize(path.join(PUBLIC_DIR, urlPath === '/' ? 'index.html' : urlPath));
  const blocked = urlPath.includes('\0') || !wanted.startsWith(PUBLIC_DIR + path.sep) || path.basename(wanted).startsWith('.');
  if (blocked) { res.writeHead(403); return res.end('Forbidden'); } // blocks ../ tricks and hidden files
  fs.readFile(wanted, (error, data) => {
    if (error) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(wanted)] || 'application/octet-stream', 'Cache-Control': PRODUCTION ? 'public, max-age=300' : 'no-cache' });
    res.end(data);
  });
}

module.exports = { serveFile };
