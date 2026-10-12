/**
 * server/storage.js
 * The tiny database: accounts and progress kept in one JSON file.
 */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { DATA_FILE } = require('./config');

fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });

let families = Object.create(null);

 // no inherited keys, so a code like "constructor" can never match
if (fs.existsSync(DATA_FILE)) {
  try { Object.assign(families, JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))); }
  catch { console.error('data/families.json is damaged. Fix or delete it, then start again.'); process.exit(1); }
}

function saveFamilies() {
  const temp = DATA_FILE + '.tmp';
  fs.writeFileSync(temp, JSON.stringify(families));
  fs.renameSync(temp, DATA_FILE); // rename is atomic, so a crash cannot leave half a file
}

// Family codes skip letters that look alike (0/O, 1/I) so they are easy to read out loud.
function newFamilyCode() {
  const letters = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let code;
  do { code = [...crypto.randomBytes(6)].map((b) => letters[b % letters.length]).join(''); } while (families[code]);
  return code;
}

module.exports = { families, newFamilyCode, saveFamilies };
