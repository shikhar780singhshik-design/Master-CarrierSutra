/**
 * screens/focus-timer.js
 * The 25 minute focus timer.
 */
"use strict";

// Focus timer state.
let focusTimer = { left: 1500, run: false, t: null };

// Shows seconds as mm:ss.
const formatClock = s => String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');

// The focus timer screen.
function focusTimerScreen() { return `<h1>Focus timer</h1><p class="sub">Study for 25 minutes with no phone, then take a short break. Finishing a session earns 15 XP and your buddy cheers for you.</p><div class="card" style="text-align:center;max-width:380px"><div class="big" id="fxt" style="font-size:56px">${formatClock(focusTimer.left)}</div><div class="bar" style="margin:14px 0"><i id="fxb" style="width:${100 - focusTimer.left / 15}%;animation:none"></i></div><button class="btn" id="fxgo" onclick="toggleFocusTimer()">${focusTimer.run ? 'Pause' : 'Start'}</button> <button class="btn g" onclick="resetFocusTimer()">Reset</button></div>`; }

// Runs every second while the timer is on.
function focusTimerTick() {
    focusTimer.left--;
    if (focusTimer.left <= 0) {
        resetFocusTimer();
        awardXp(15);
        buddyAction('cheer');
        translateForStudent(`Well done ${appState.p.name}! You finished a full focus session. Take a short break.`).then(buddySays);
        return;
    }
    const t = pick('#fxt'), b = pick('#fxb');
    if (t)
        t.textContent = formatClock(focusTimer.left);
    if (b)
        b.style.width = (100 - focusTimer.left / 15) + '%';
}

// Starts or pauses the timer.
function toggleFocusTimer() { if (focusTimer.run) {
    clearInterval(focusTimer.t);
    focusTimer.run = false;
}
else {
    focusTimer.run = true;
    focusTimer.t = setInterval(focusTimerTick, 1000);
} const g = pick('#fxgo'); if (g)
    g.textContent = focusTimer.run ? 'Pause' : 'Start'; }

// Resets the timer.
function resetFocusTimer() { clearInterval(focusTimer.t); focusTimer.run = false; focusTimer.left = 1500; if (currentScreen == 'focus')
    render(); }
