/**
 * buddy/buddy-state.js
 * What the study buddy is doing right now.
 */
"use strict";

// Everything about the buddy right now: position, voice, what it is saying.
let buddyState = { open: false, voice: true, say: null, x: 0, y: 0, hover: false, pend: null, last: Date.now(), nudge: Date.now(), waiting: false }, bubbleTimer = 0;

// The name the student gave their buddy.
const buddyName = () => (appState.p && appState.p.tutor) || 'Pip';

// The drawing of the chosen character.
const buddyFigure = () => CHARACTERS[(appState.p ? appState.p.buddy : chosenCharacter) || 0]();
