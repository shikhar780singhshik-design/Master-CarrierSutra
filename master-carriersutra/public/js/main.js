/**
 * main.js
 * Starts the app. This file loads last.
 */
"use strict";

window.onhashchange = render;

render();

startBuddy();

fetch(API_BASE + '/api/health').then(r => r.ok ? r.json() : null).then(j => { if (j && j.ok) {
    serverOnline = true;
    cloudVoiceReady = !!j.tts;
    if (appState.role && !sessionToken)
        appState = { ...freshState() };
    render();
} }).catch(() => { });
