const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

test('family account lifecycle over HTTP', async (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'carriersutra-http-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const app = path.resolve(__dirname, '..');
  for (const file of ['server.js', 'server', 'public']) {
    fs.cpSync(path.join(app, file), path.join(root, file), { recursive: true });
  }

  const child = spawn(process.execPath, ['-e', `
    const http = require('node:http');
    const listen = http.Server.prototype.listen;
    http.Server.prototype.listen = function (port, callback) {
      return listen.call(this, 0, '127.0.0.1', () => {
        process.send(this.address().port);
        callback();
      });
    };
    require('./server');
  `], {
    cwd: root,
    env: { PATH: process.env.PATH, SESSION_SECRET: 'test-session-secret-only-for-tests' },
    stdio: ['ignore', 'ignore', 'inherit', 'ipc'],
  });
  t.after(async () => {
    if (child.exitCode !== null || child.signalCode !== null) return;
    const stopped = once(child, 'exit');
    child.kill();
    await stopped;
  });

  const port = await Promise.race([
    once(child, 'message').then(([port]) => port),
    once(child, 'exit').then(([code]) => { throw new Error('Server exited with code ' + code); }),
  ]);
  async function request(route, { method = 'GET', token, body } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = 'Bearer ' + token;
    const response = await fetch(`http://127.0.0.1:${port}/api/${route}`, {
      method, headers, body: JSON.stringify(body), signal: AbortSignal.timeout(5000),
    });
    return { status: response.status, data: await response.json() };
  }

  const register = (name) => request('register', {
    method: 'POST', body: { p: { name }, pin: 'study-427', pw: 'parent-581' },
  });
  assert.equal((await request('health')).data.ok, true);
  assert.equal((await request('state')).status, 401);
  assert.equal((await request('register', { method: 'POST', body: [] })).status, 400);
  const first = await register('Student One');
  const second = await register('Student Two');
  assert.equal(first.status, 200);
  assert.equal(second.status, 200);

  const { code, token } = first.data;
  const parent = await request('login', {
    method: 'POST', body: { code, role: 'parent', secret: 'parent-581' },
  });
  assert.equal(parent.status, 200);
  assert.equal((await request('state', { method: 'PUT', token: parent.data.token, body: {} })).status, 403);
  assert.equal((await request('delete-account', { method: 'POST', token, body: {} })).status, 403);
  assert.equal((await request('state', { token: second.data.token })).data.p.name, 'Student Two');
  assert.equal((await request('state', { token })).data.p.name, 'Student One');
  assert.equal((await request('ai', { method: 'POST', token, body: {} })).status, 503);
  assert.equal((await request('tts', { method: 'POST', token, body: {} })).status, 503);

  assert.equal((await request('logout-all', { method: 'POST', token: parent.data.token, body: {} })).status, 200);
  assert.equal((await request('state', { token })).status, 401);
  assert.equal((await request('state', { token: parent.data.token })).status, 401);
  assert.equal((await request('state', { token: second.data.token })).status, 200);
});
