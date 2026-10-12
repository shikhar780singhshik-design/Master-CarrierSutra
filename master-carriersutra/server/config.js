/**
 * server/config.js
 * Settings read from .env and the environment.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const ROOT = path.join(__dirname, '..'); // the project folder

function loadEnvFile() {
  const file = path.join(ROOT, '.env');
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !line.trim().startsWith('#') && process.env[m[1]] === undefined) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}

loadEnvFile();

const PORT = Number(process.env.PORT) || 3000;

const PRODUCTION = process.env.NODE_ENV === 'production';

const MODEL = process.env.MODEL || 'claude-sonnet-5-5';

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';

const GOOGLE_TTS_KEY = process.env.GOOGLE_TTS_API_KEY || '';

const PUBLIC_DIR = path.join(ROOT, 'public');

const DATA_FILE = path.join(ROOT, 'data', 'families.json');

// The secret that signs login tokens. If you forget to set one, we make a temporary
// one so the app still starts. Everyone is then signed out whenever the server restarts.
let SECRET = process.env.SESSION_SECRET || '';

if (SECRET.length < 24) {
  if (PRODUCTION) { console.error('Set SESSION_SECRET (32 or more characters) before running in production.'); process.exit(1); }
  SECRET = crypto.randomBytes(32).toString('hex');
  console.warn('Note: SESSION_SECRET is missing or short. Using a temporary one. Set it in .env for real use.');
}

// Voices. We try Google first, then Microsoft Azure. If neither works, the browser uses its own voice.
const AZURE_KEY = process.env.AZURE_SPEECH_KEY || '';

const AZURE_REGION = process.env.AZURE_SPEECH_REGION || '';

// Unofficial test voice. Needs no key, but it is not an approved Google service: use it only to try the app on your own computer.
const FREE_TEST_VOICE = process.env.FREE_TEST_VOICE === '1';

module.exports = { ANTHROPIC_KEY, AZURE_KEY, AZURE_REGION, DATA_FILE, FREE_TEST_VOICE, GOOGLE_TTS_KEY, MODEL, PORT, PRODUCTION, PUBLIC_DIR, SECRET };
