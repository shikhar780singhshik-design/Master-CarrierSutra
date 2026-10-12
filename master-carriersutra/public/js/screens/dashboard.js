/**
 * screens/dashboard.js
 * The dashboard.
 */
"use strict";

// The dashboard: level, streak, goals, subjects and today's plan.
function dashboardScreen() {
    const par = appState.role == 'parent', o = overallAverage(), a = allTests(), xp = appState.xp || 0, todayXp = (appState.xpDay || {})[todayString()] || 0, ranks = subjectsByStrength();
    const tested = ranks.filter(x => x[1] != null), weak = tested.length ? tested[tested.length - 1] : null;
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()], todays = (fullPlan().find(x => x[0] == dayName) || [dayName, []])[1];
    const week = [...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - 6 + i); return [d.toLocaleDateString('en-IN', { weekday: 'short' }), (appState.xpDay || {})[todayString(d)] || 0]; }), top = Math.max(30, ...week.map(x => x[1]));
    const trend = s => { const l = appState.sc[s] || []; if (l.length < 2)
        return ''; const d = l[l.length - 1].p - l[l.length - 2].p; return d > 0 ? '<span class="tag ok">Improving</span>' : d < 0 ? '<span class="tag b">Dropped</span>' : ''; };
    const last = (appState.days || []).slice(-1)[0];
    return `<div class="ban" style="background-image:url(${sceneBackground(appState.p.buddy || 0)})"></div>
 <h1>${par ? 'Progress of ' + escapeHtml(appState.p.name) : escapeHtml(appState.p.name)}</h1>
 <p class="sub">Class ${appState.p.cls}, ${appState.p.board}, ${escapeHtml(appState.p.school)}${appState.code && !par ? '. Family code: <b>' + appState.code + '</b>' : ''}${par ? '. Last studied: ' + (last || 'not yet') : ''}</p>
 <div class="grid" style="margin-bottom:14px">
  <div class="card"><div class="mu">Overall test average</div><div class="big">${o == null ? 'No tests yet' : o + '%'}</div>${progressBar(o)}<div class="mu" style="margin-top:6px">${a.length} tests taken</div></div>
  <div class="card"><div class="mu">Level ${Math.floor(xp / 100) + 1}</div><div class="big">${xp} XP</div>${progressBar(xp % 100)}<div class="mu" style="margin-top:6px">${studyStreak()} day study streak</div></div>
  <div class="card"><div class="mu">Today's goal: ${preference('goal', 30)} XP</div><div class="big">${todayXp} XP</div>${progressBar(Math.min(100, todayXp / preference('goal', 30) * 100))}<div class="mu" style="margin-top:6px">${todayXp >= preference('goal', 30) ? 'Goal reached' : 'Earn XP with tests, videos and the focus timer'}</div></div>
 </div>
 <div class="grid" style="margin-bottom:14px">
  <div class="card"><h2>XP in the last 7 days</h2><div class="chart">${week.map(([d, v]) => `<div><b style="height:${Math.max(3, v / top * 120)}px"></b>${v}<br>${d}</div>`).join('')}</div></div>
  <div class="card"><h2>Subjects</h2>${ranks.map(([s, v]) => `<div style="margin:9px 0"><div class="row"><span>${s}</span><span>${trend(s)} <span class="tag ${levelOf(v)[1]}">${v == null ? 'Not tested' : v + '%'}</span></span></div>${progressBar(v)}</div>`).join('')}</div>
 </div>
 <div class="grid">
  <div class="card"><h2>${par ? 'Suggestion for you' : 'Your next step'}</h2><p>${weak ? (par ? `Ask ${escapeHtml(appState.p.name)} to practise ${weak[0]}. The average there is ${weak[1]}%.` : `Practise ${weak[0]}. Your average there is ${weak[1]}%.`) : (par ? 'No tests yet. Ask your child to take a first test.' : 'Take your first test so your buddy can build your plan.')}</p>${par ? '' : `<button class="btn s" onclick="goTo('quiz')">Take a test</button>`}</div>
  <div class="card"><h2>Today, ${dayName}</h2>${todays.length ? todays.map(x => `<div class="slot"><b>${friendlyTime(x.time)}</b> &nbsp; ${escapeHtml(x.subject)}${x.note ? ' (' + escapeHtml(x.note) + ')' : ''}</div>`).join('') : '<p class="mu">Rest day.</p>'}</div>
  <div class="card"><h2>Recent tests</h2>${a.length ? a.slice(-5).reverse().map(x => `<div class="row" style="padding:4px 0"><span>${x.s} <span class="tag">${x.t}</span></span><b>${x.p}%</b></div>`).join('') : '<p class="mu">Nothing recorded yet.</p>'}</div>
 </div>`;
}
