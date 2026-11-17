const assert = require('node:assert/strict');
const { test } = require('node:test');
process.env.ANTHROPIC_API_KEY = 'test-only';
const { askClaude } = require('../server/tutor');
const routes = require('../server/routes/study-buddy');

const messages = [{ role: 'user', content: 'Explain fractions.' }];

test('tutor retries without search and reads text blocks', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://api.anthropic.com/v1/messages');
    const request = JSON.parse(options.body);
    assert.deepEqual(request.messages, messages);
    if (request.tools) return new Response(null, { status: 400 });
    return Response.json({ content: [{ type: 'text', text: 'A fraction is part of a whole.' }] });
  });
  assert.equal(await askClaude(messages), 'A fraction is part of a whole.');
  assert.equal(fetch.mock.callCount(), 2);
});

test('tutor handles empty responses and keeps provider errors out of logs', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => Response.json({ content: [] }));
  await assert.rejects(askClaude(messages), /empty answer/);
  fetch.mock.mockImplementation(async () => new Response('provider response detail', { status: 503 }));
  await assert.rejects(askClaude(messages), { message: 'Anthropic error 503' });
});

test('tutor screens previous turns and rejects malformed messages without fetching', async (t) => {
  const fetch = t.mock.method(globalThis, 'fetch', async () => { throw new Error('Unexpected provider call'); });
  async function request(history) {
    const response = {
      writeHead(status) { this.status = status; },
      end(body) { this.body = JSON.parse(body); },
    };
    await routes['POST /api/ai']({}, response, { messages: history }, { code: 'TEST01' });
    return response;
  }

  assert.equal((await request([null, ...messages])).status, 400);
  const reply = await request([{ role: 'user', content: 'student@example.com' }, ...messages]);
  assert.equal(reply.status, 200);
  assert.match(reply.body.text, /Keep those private/);
  assert.equal(fetch.mock.callCount(), 0);
});
