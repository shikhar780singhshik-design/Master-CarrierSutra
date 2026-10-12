/**
 * server/routes/study-buddy.js
 * Routes: The AI tutor and the spoken voice.
 */
const { ANTHROPIC_KEY, PRODUCTION } = require('../config');
const { sendJson } = require('../http-utils');
const { allow } = require('../security');
const { PRIVATE_INFO, askClaude } = require('../tutor');
const { SPEECH_LANGUAGES, speak, voiceProviders } = require('../voices');

module.exports = {
  'POST /api/ai': async (req, res, body, user) => {
    if (!ANTHROPIC_KEY) return sendJson(res, 503, { error: 'The tutor is not switched on yet. Add ANTHROPIC_API_KEY to the .env file and restart the server.' });
    if (!allow('ai:' + user.code, 60, 3600 * 1000)) return sendJson(res, 429, { error: 'That was a lot of questions. Take a short break and try again.' });
    const messages = (Array.isArray(body.messages) ? body.messages : []).slice(-14)
      .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content || '').slice(0, 6000) }));
    const last = messages[messages.length - 1];
    if (!last || last.role !== 'user') return sendJson(res, 400, { error: 'Bad request' });
    if (PRIVATE_INFO.test(last.content)) {
      return sendJson(res, 200, { text: 'Please do not share phone numbers or email addresses here. Keep those private. Ask me a study question instead!' });
    }
    try { sendJson(res, 200, { text: await askClaude(messages) }); }
    catch (error) { console.error(error.message); sendJson(res, 502, { error: 'The AI service is unavailable right now. Please try again.' }); }
  },

  'POST /api/tts': async (req, res, body, user) => {
    if (!voiceProviders.length) return sendJson(res, 503, { error: 'No voice key set on the server' });
    if (!allow('tts:' + user.code, 150, 3600 * 1000)) return sendJson(res, 429, { error: 'Slow down a little' });
    const text = String(body.text || '').replace(/\s+/g, ' ').trim().slice(0, 400);
    const language = SPEECH_LANGUAGES.includes(body.lang) ? body.lang : 'en-IN';
    if (!text) return sendJson(res, 400, { error: 'No text' });
    try {
      const audio = await speak(text, language);
      res.writeHead(200, { 'Content-Type': 'audio/mpeg', 'Content-Length': audio.length });
      res.end(audio);
    } catch (error) { console.error(error.message); sendJson(res, 502, { error: 'Voice unavailable', detail: PRODUCTION ? undefined : error.message }); }
  },
};
