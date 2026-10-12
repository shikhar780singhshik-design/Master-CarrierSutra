/**
 * core/ai-client.js
 * Talks to the AI through the server, and translates the buddy's own lines.
 */
"use strict";

// Sends messages to the AI, through our server (or Claude directly in the preview).
async function askAi(msgs, json) {
    const messages = typeof msgs == 'string' ? [{ role: 'user', content: msgs }] : msgs;
    if (serverOnline && sessionToken) {
        const r = await fetch(API_BASE + '/api/ai', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ messages }) });
        const d = await r.json().catch(() => ({}));
        if (!r.ok)
            throw new Error(d.error || 'The AI service had a problem.');
        return json ? JSON.parse(d.text.replace(/```json|```/g, '').trim()) : d.text;
    }
    const sm = window.claude && await claude.use('sample');
    if (!sm)
        throw new Error(serverOnline ? 'Please sign in again.' : 'OFFLINE');
    return json ? await sm.json(messages, { cache: false }) : (await sm(messages, { cache: false })).text;
}

const translationCache = {};

// Translates one of the buddy's own lines into the chosen language (cached).
async function translateForStudent(text) {
    if (!appState.p || !appState.p.lang)
        return text;
    const key = appState.p.lang + '|' + text;
    if (translationCache[key])
        return translationCache[key];
    try {
        const r = await askAi(`Translate this into ${currentLanguage()[1]} the way a friendly school child would say it aloud. Keep names unchanged. Reply with only the translation.\n\n${text}`);
        return translationCache[key] = r.trim();
    }
    catch (e) {
        return text;
    }
}
