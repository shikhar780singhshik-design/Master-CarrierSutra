/**
 * server/tutor.js
 * Asking Claude to answer students, with web search.
 */
const { ANTHROPIC_KEY, MODEL } = require('./config');

const TUTOR_RULES =
  'You are the AI behind a study app for school students in India, Class 6 to 10. ' +
  'Use web search whenever a question needs facts you are not sure of, current information or exam syllabus details, then explain the answer plainly. ' +
  'Keep everything safe and age appropriate for children. Never ask for or store personal details. ' +
  'Politely decline anything unsafe, adult or unrelated to learning, and gently steer back to studying. ' +
  'Reply in the language the student asks for.';

async function askClaude(messages) {
  const call = async (withSearch) => {
    const body = { model: MODEL, max_tokens: 2500, system: TUTOR_RULES, messages };
    if (withSearch) body.tools = [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }];
    return fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60000),
    });
  };
  let reply = await call(true);
  if (reply.status === 400) reply = await call(false); // some accounts cannot use web search: still answer
  if (!reply.ok) throw new Error('Anthropic error ' + reply.status + ' ' + (await reply.text()).slice(0, 200));
  const data = await reply.json();
  return data.content.filter((part) => part.type === 'text').map((part) => part.text).join('');
}

const PRIVATE_INFO = /(\+?\d[\d\s-]{8,}\d)|[\w.+-]+@[\w-]+\.[\w.]+/;

module.exports = { PRIVATE_INFO, askClaude };
