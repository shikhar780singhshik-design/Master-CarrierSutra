/**
 * screens/study-plan.js
 * The study plan: the buddy's plan and the student's own sessions.
 */
"use strict";

// The plan the buddy builds: weaker subjects get more sessions.
function autoPlan() {
    const cnt = {}, w = {};
    SUBJ.forEach(s => { cnt[s] = 0; w[s] = 120 - (subjectAverage(s) ?? 50); });
    const n = appState.p.age <= 11 ? 3 : 4, t = ['5:00 PM', '6:00 PM', '7:30 PM', '8:30 PM'];
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => { const sl = []; for (let i = 0; i < n; i++) {
        const s = SUBJ.slice().sort((a, b) => w[b] / (1 + cnt[b]) - w[a] / (1 + cnt[a]))[0];
        cnt[s]++;
        sl.push([t[i], s]);
    } if (d == 'Sat')
        sl.push(['Evening', 'Weekly test and revision']); return [d, sl]; });
}

// ---- the student designs their own study plan
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Turns a time like 5:30 PM into minutes, for sorting.
function minutesOfDay(t) { const m = String(t).match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i); if (!m)
    return 1e4; let h = +m[1]; if (m[3]) {
    const pm = /pm/i.test(m[3]);
    if (pm && h < 12)
        h += 12;
    if (!pm && h == 12)
        h = 0;
} return h * 60 + +m[2]; }

// Shows 17:30 as 5:30 PM.
function friendlyTime(t) { const m = String(t).match(/^(\d{2}):(\d{2})$/); if (!m)
    return t; const h = +m[1]; return (h % 12 || 12) + ':' + m[2] + ' ' + (h < 12 ? 'AM' : 'PM'); }

// Combines the buddy plan and the student's own sessions.
function fullPlan() {
    const mode = appState.planMode || 'both', auto = mode == 'mine' ? [] : autoPlan(), mine = mode == 'auto' ? [] : (appState.myPlan || []);
    return DAYS.map(d => { const a = ((auto.find(x => x[0] == d) || [d, []])[1]).map(x => ({ time: x[0], subject: x[1], auto: true })), m = mine.filter(x => x.day == d).map(x => ({ ...x, mine: true })); return [d, [...a, ...m].sort((p, q) => minutesOfDay(p.time) - minutesOfDay(q.time))]; });
}

// Chooses buddy plan, own plan, or both.
function setPlanMode(k) { appState.planMode = k; saveState(); render(); }

// Adds one of the student's own sessions.
function addPlanSession() { const item = { id: 'p' + Date.now().toString(36), day: pick('#pd').value, time: pick('#pt').value || '17:00', subject: pick('#ps').value, note: pick('#pn').value.trim().slice(0, 120), done: '' }; appState.myPlan = [...(appState.myPlan || []), item]; if (appState.planMode == 'auto')
    appState.planMode = 'both'; saveState(); render(); }

// Removes one of the student's own sessions.
function removePlanSession(id) { appState.myPlan = (appState.myPlan || []).filter(x => x.id != id); saveState(); render(); }

// Ticks a session off for today.
function togglePlanSessionDone(id) { let now = false; appState.myPlan = (appState.myPlan || []).map(x => { if (x.id != id)
    return x; now = x.done != todayString(); return { ...x, done: now ? todayString() : '' }; }); if (now)
    awardXp(5);
else
    saveState(); render(); }

// The study plan screen.
function studyPlanScreen() {
    const mode = appState.planMode || 'both';
    return `<h1>Study plan</h1><p class="sub">Design your own plan, let your buddy build one from your test results, or mix both. Everything saves automatically.</p>
 <div class="tabs">${[['auto', 'Buddy plan'], ['both', 'Buddy plus mine'], ['mine', 'Only mine']].map(([k, l]) => `<button class="${mode == k ? 'on' : ''}" onclick="setPlanMode('${k}')">${l}</button>`).join('')}</div>
 <div class="card ov"><table><tr><th>Day</th><th>Sessions</th></tr>${fullPlan().map(([d, sl]) => `<tr><td><b>${d}</b></td><td>${sl.length ? sl.map(x => `<div class="slot row"><span><b>${friendlyTime(x.time)}</b> &nbsp; ${escapeHtml(x.subject)}${x.note ? ' <span class="mu">' + escapeHtml(x.note) + '</span>' : ''}</span>${x.mine ? `<span><label style="margin-right:8px"><input type="checkbox" style="width:auto;margin:0 4px 0 0" ${x.done == todayString() ? 'checked' : ''} onchange="togglePlanSessionDone('${escapeHtml(x.id)}')">Done today</label><button class="btn s g" onclick="removePlanSession('${escapeHtml(x.id)}')">Remove</button></span>` : '<span class="tag">Buddy</span>'}</div>`).join('') : '<span class="mu">Free</span>'}</td></tr>`).join('')}</table></div>
 <div class="card" style="margin-top:14px"><h2>Add your own session</h2><div class="grid"><div><label>Day</label><select id="pd">${DAYS.map(d => `<option>${d}</option>`).join('')}</select></div><div><label>Time</label><input id="pt" type="time" value="17:00"></div><div><label>Subject</label><select id="ps">${[...SUBJ, 'Revision', 'Other'].map(s => `<option>${s}</option>`).join('')}</select></div><div><label>Note (optional)</label><input id="pn" maxlength="120" placeholder="For example: Chapter 4 exercises"></div></div><button class="btn" onclick="addPlanSession()">Add session</button></div>`;
}
