/**
 * buddy/buddy-movement.js
 * The buddy walking around the page and asking questions on its own.
 */
"use strict";

// Moves the buddy to a spot on the page.
function placeBuddy(x, y, walk) { const e = pick('#pipc'); if (!e)
    return; e.classList.toggle('fl', x < buddyState.x); e.classList.toggle('rt', x > innerWidth / 2); e.classList.toggle('dn', y < 170); const d = Math.hypot(x - buddyState.x, y - buddyState.y), t = walk ? Math.max(1.6, d / 90) : 0; buddyState.x = x; buddyState.y = y; e.style.transitionDuration = t + 's'; e.style.left = x + 'px'; e.style.top = y + 'px'; if (walk) {
    e.classList.add('mv');
    clearTimeout(buddyState.mt);
    buddyState.mt = setTimeout(() => e.classList.remove('mv'), t * 1000);
} }

// Starts the buddy when the page opens.
function startBuddy() { placeBuddy(Math.max(8, innerWidth - 120), Math.max(70, innerHeight - 140)); if (appState.role == 'student')
    setTimeout(() => translateForStudent(`Welcome back ${appState.p.name}! Ready to study? Tell me what you are working on.`).then(buddySays), 700);
else {
    buddyState.pend = "Hi! I'm your study buddy. Fill in your details and give me a name.";
    renderBuddyFigure();
} }

// Every few seconds the buddy walks somewhere new.
function wanderBuddy() { const e = pick('#pipc'); if (e && e.style.display != 'none' && !buddyState.hover && !e.classList.contains('talk') && !matchMedia('(prefers-reduced-motion:reduce)').matches && !preference('calm', false)) {
    const a = Math.random() * 6.28, d = 110 + Math.random() * 170;
    placeBuddy(Math.min(innerWidth - 120, Math.max(8, buddyState.x + Math.cos(a) * d)), Math.min(innerHeight - 140, Math.max(70, buddyState.y + Math.sin(a) * d * .6)), true);
} setTimeout(wanderBuddy, 6000 + Math.random() * 8000); }

// After a quiet spell the buddy asks a question from the weakest subject.
function askQuestionOnItsOwn() {
    if (appState.role != 'student' || waitingForAi || currentRoute() || document.hidden || buddyState.waiting)
        return;
    const now = Date.now();
    if (now - buddyState.last < 45000 || now - buddyState.nudge < 120000)
        return;
    buddyState.nudge = now;
    buddyState.waiting = true;
    const s = subjectsByStrength().slice(-1)[0][0], q = BANK[s][Math.floor(Math.random() * BANK[s].length)][0], t = `Quick question for you, ${appState.p.name}. ${q}`;
    translateForStudent(t).then(x => { appState.chat.push({ u: 0, t: x }); saveState(); buddySays(x); renderChatPanel(); });
}

setTimeout(wanderBuddy, 8000);

setInterval(askQuestionOnItsOwn, 15000);

document.addEventListener('pointerdown', () => { if (buddyState.pend) {
    const t = buddyState.pend;
    buddyState.pend = null;
    speakAloud(t);
} buddyState.last = Date.now(); }, true);

document.addEventListener('keydown', () => { buddyState.last = Date.now(); }, true);

document.addEventListener('pointerover', ev => { buddyState.hover = !!(ev.target.closest && ev.target.closest('#pipc,#pcp')); });

// Plays a short action such as a wave or a jump.
function buddyAction(c) { const e = pick('#pipc'); if (!e)
    return; e.classList.remove('cheer', 'wave'); void e.offsetWidth; e.classList.add(c); setTimeout(() => e.classList.remove(c), 2200); }
