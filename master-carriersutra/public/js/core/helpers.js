/**
 * core/helpers.js
 * Small tools used everywhere: finding elements, safe text, averages, dates, XP and streaks.
 */
"use strict";

// Short for document.querySelector.
const pick = s => document.querySelector(s), escapeHtml = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// Average test score for one subject, or null if untested.
const subjectAverage = s => { const a = appState.sc[s]; return a && a.length ? Math.round(a.reduce((x, y) => x + y.p, 0) / a.length) : null; };

// Every test the student has taken.
const allTests = () => Object.values(appState.sc).flat();

// Average of all subject averages.
const overallAverage = () => { const a = SUBJ.map(subjectAverage).filter(x => x != null); return a.length ? Math.round(a.reduce((x, y) => x + y, 0) / a.length) : null; };

// Turns a score into a label and a tag colour.
const levelOf = a => a == null ? ['Not tested', ''] : a >= 75 ? ['Strong', 'ok'] : a >= 50 ? ['Average', ''] : ['Needs focus', 'b'];

// Draws a progress bar for a percentage.
const progressBar = v => `<div class="bar"><i style="width:${v || 0}%"></i></div>`;

// Subjects sorted from strongest to weakest.
const subjectsByStrength = () => SUBJ.map(s => [s, subjectAverage(s)]).sort((a, b) => (b[1] ?? 50) - (a[1] ?? 50));

// One line describing the student, sent to the AI.
const describeStudent = () => `Class ${appState.p.cls}, ${appState.p.board} board, India, age ${appState.p.age}`;

// The part of the address after #/ (used for the Privacy and Terms pages).
function currentRoute() { return location.hash.slice(2); }

// A date as YYYY-MM-DD in local time.
const todayString = (d = new Date()) => d.toLocaleDateString('en-CA');

// Gives XP, records today as a study day, and saves.
function awardXp(n) { appState.xp = (appState.xp || 0) + n; appState.xpDay = { ...(appState.xpDay || {}), [todayString()]: ((appState.xpDay || {})[todayString()] || 0) + n }; if (!(appState.days || []).includes(todayString()))
    appState.days = [...(appState.days || []), todayString()]; saveState(); }

// How many days in a row the student studied.
function studyStreak() { const days = new Set(appState.days || []); const d = new Date(); if (!days.has(todayString(d)))
    d.setDate(d.getDate() - 1); let n = 0; while (days.has(todayString(d))) {
    n++;
    d.setDate(d.getDate() - 1);
} return n; }
