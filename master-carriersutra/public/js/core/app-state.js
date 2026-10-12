/**
 * core/app-state.js
 * The app's memory: the state object, saving and loading, and where the server is.
 */
"use strict";

// A brand new, empty state. Every account starts from this, so nothing leaks between accounts.
const freshState = () => ({ role: null, p: null, sc: {}, links: {}, notes: {}, chat: [], xp: 0, days: [], xpDay: {}, prefs: {}, myPlan: [], planMode: 'both', myNotes: [] });

// The whole app state lives in appState. Other values: which screen is open, tab choices, the running quiz.
let appState = loadSavedState(), currentScreen = 'dash', selectedTabs = { vt: 'A', nt: 'long' }, currentQuiz = null, waitingForAi = false;

// When the page is opened from VS Code Live Server (another port), talk to the Node server on port 3000.
const API_BASE = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) && location.port && location.port !== '3000' ? 'http://localhost:3000' : '';

// Filled in at start-up: is the server running, does it have a cloud voice, and the login token.
let serverOnline = false, cloudVoiceReady = false, sessionToken = appState.token || null;

// Headers that prove who we are on every server request.
const authHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + sessionToken });

// Reads saved progress from this browser.
function loadSavedState() { try {
    return Object.assign({}, freshState(), JSON.parse(localStorage.getItem('carriersutra') || '{}'));
}
catch (e) {
    return { ...freshState() };
} }

// Saves progress in this browser, and to the server when signed in.
function saveState() { try {
    localStorage.setItem('carriersutra', JSON.stringify(appState));
}
catch (e) { } if (serverOnline && sessionToken && appState.role == 'student')
    fetch(API_BASE + '/api/state', { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ state: { p: appState.p, sc: appState.sc, links: appState.links, notes: appState.notes, xp: appState.xp, days: appState.days, xpDay: appState.xpDay, prefs: appState.prefs, myPlan: appState.myPlan, planMode: appState.planMode, myNotes: appState.myNotes } }) }).catch(() => { }); }
