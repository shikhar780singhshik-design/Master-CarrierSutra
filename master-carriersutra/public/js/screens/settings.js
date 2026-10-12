/**
 * screens/settings.js
 * Settings: profile, buddy, themes, study goals, account and privacy.
 */
"use strict";

// Changes the buddy's language.
function changeLanguage(v) { appState.p.lang = +v; saveState(); stopSpeech(); renderBuddy(); }

// ---- settings, preferences and themes
const THEMES = [['night', 'Night'], ['light', 'Light'], ['ocean', 'Ocean'], ['contrast', 'High contrast']];

// Preview colours for each theme.
const SWATCH = { night: ['#0e1426', '#f2b84b'], light: ['#f6f5f1', '#1f5f4a'], ocean: ['#0a2a33', '#ff8a65'], contrast: ['#000000', '#ffe600'] };

// Reads a setting, with a default.
function preference(k, d) { return appState.prefs && appState.prefs[k] != null ? appState.prefs[k] : d; }

// Applies theme, text size and calm mode to the page.
function applyPreferences() { const d = document.documentElement; d.dataset.theme = preference('theme', 'night'); d.style.setProperty('--fs', preference('text', 1)); d.classList.toggle('calm', !!preference('calm', false)); buddyState.voice = !!preference('voice', true); }

// Saves one setting and redraws.
function savePreference(k, v) { appState.prefs = { ...(appState.prefs || {}), [k]: v }; if (k == 'voice' && !v)
    stopSpeech(); saveState(); render(); renderBuddy(); }

// Saves one profile or buddy field.
function saveProfileField(k, v) { appState.p = { ...appState.p, [k]: v }; if (k == 'lang')
    stopSpeech(); saveState(); renderBuddy(); render(); }

// Clears the chat history.
function clearChat() { appState.chat = [{ u: 0, t: 'Fresh start! What shall we study?' }]; saveState(); renderBuddy(); alert('Chat history cleared.'); }

// Downloads the student's data as a file.
function exportData() { const d = { profile: appState.p, scores: appState.sc, notes: appState.notes, myNotes: appState.myNotes, myPlan: appState.myPlan, xp: appState.xp, days: appState.days }; const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' })); a.download = 'my-study-data.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); }

// Erases everything stored in this browser.
function eraseThisDevice() { if (confirm('Erase everything saved in this browser?')) {
    try {
        localStorage.removeItem('carriersutra');
    }
    catch (e) { }
    appState = freshState();
    render();
} }

// Changes the PIN or parent password.
async function changeSecret(which) {
    const cur = pick('#c_' + which).value, next = pick('#n_' + which).value;
    if (!cur || !next) {
        alert('Fill in both boxes.');
        return;
    }
    try {
        const r = await fetch(API_BASE + '/api/change-secret', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ which, current: cur, next }) });
        const d = await r.json().catch(() => ({}));
        if (!r.ok) {
            alert(d.error || 'Could not change it.');
            return;
        }
        alert('Changed. Please sign in again.');
        logOut();
    }
    catch (e) {
        alert('Could not reach the server.');
    }
}

// Deletes the account (parent only).
async function deleteAccount() {
    const pw = prompt('Type the parent password to delete this account for good.');
    if (!pw)
        return;
    try {
        const r = await fetch(API_BASE + '/api/delete-account', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ secret: pw }) });
        const d = await r.json().catch(() => ({}));
        if (!r.ok) {
            alert(d.error || 'Could not delete.');
            return;
        }
        try {
            localStorage.removeItem('carriersutra');
        }
        catch (e) { }
        alert('The account was deleted.');
        logOut();
    }
    catch (e) {
        alert('Could not reach the server.');
    }
}

// The Settings screen.
function settingsScreen() {
    const st = appState.role == 'student', p = appState.p, tk = !!(serverOnline && sessionToken);
    const row = (label, control, hint) => `<div class="row" style="padding:10px 0;border-bottom:1px solid var(--bd)"><div style="flex:1;min-width:190px"><b>${label}</b>${hint ? `<div class="mu">${hint}</div>` : ''}</div><div style="min-width:190px">${control}</div></div>`;
    const opts = (list, cur) => list.map(([v, l]) => `<option value="${v}" ${String(v) == String(cur) ? 'selected' : ''}>${l}</option>`).join('');
    const secret = (which, title, hint) => `<div style="padding:10px 0;border-bottom:1px solid var(--bd)"><b>${title}</b><div class="mu">${hint}</div><div class="grid" style="margin:6px 0"><input id="c_${which}" type="password" placeholder="Current password or PIN" autocomplete="off" style="margin:0"><input id="n_${which}" type="password" placeholder="New one" autocomplete="off" style="margin:0"></div><button class="btn s" onclick="changeSecret('${which}')">Change</button></div>`;
    const profile = st ? `<div class="card" style="margin-bottom:14px"><h2>Profile</h2>${row('Name', `<input value="${escapeHtml(p.name)}" maxlength="60" onchange="saveProfileField('name',this.value.trim()||'Student')" style="margin:0">`)}${row('Class', `<select onchange="saveProfileField('cls',+this.value)" style="margin:0">${opts([6, 7, 8, 9, 10].map(x => [x, 'Class ' + x]), p.cls)}</select>`)}${row('Board', `<select onchange="saveProfileField('board',this.value)" style="margin:0">${opts(['CBSE', 'RBSE', 'ICSE', 'State board'].map(x => [x, x]), p.board)}</select>`, 'Decides which board notes are found for you')}${row('Age', `<input type="number" min="8" max="20" value="${p.age}" onchange="saveProfileField('age',+this.value||13)" style="margin:0">`)}${row('School', `<input value="${escapeHtml(p.school)}" maxlength="80" onchange="saveProfileField('school',this.value.trim()||'Not given')" style="margin:0">`)}</div>` : '';
    const buddy = st ? `<div class="card" style="margin-bottom:14px"><h2>Study buddy</h2>${row('Character', `<div style="display:flex;gap:8px;flex-wrap:wrap">${CHARACTERS.map((c, k) => `<button type="button" class="bud ${(p.buddy || 0) == k ? 'on' : ''}" onclick="saveProfileField('buddy',${k})" aria-label="${CHARACTER_NAMES[k]}">${c()}</button>`).join('')}</div>`)}${row('Name', `<input value="${escapeHtml(buddyName())}" maxlength="20" onchange="saveProfileField('tutor',this.value.trim().slice(0,20)||'Pip')" style="margin:0">`)}${row('Speaks', `<select onchange="saveProfileField('lang',+this.value)" style="margin:0">${opts(LANGUAGES.map((l, k) => [k, l[1]]), p.lang || 0)}</select>`, voiceStatusText())}${row('Jokes', `<select onchange="savePreference('jokes',this.value)" style="margin:0">${opts([['lots', 'Lots of jokes'], ['some', 'Some jokes'], ['none', 'No jokes']], preference('jokes', 'some'))}</select>`)}${row('Speak replies aloud', `<input type="checkbox" ${preference('voice', true) ? 'checked' : ''} onchange="savePreference('voice',this.checked)" style="width:auto;margin:0">`)}${row('Voice speed', `<select onchange="savePreference('speed',+this.value)" style="margin:0">${opts([[.8, 'Slow'], [1, 'Normal'], [1.15, 'Fast']], preference('speed', 1))}</select>`)}</div>` : '';
    const look = `<div class="card" style="margin-bottom:14px"><h2>Appearance</h2>${row('Theme', `<div style="display:flex;gap:8px;flex-wrap:wrap">${THEMES.map(([k, l]) => `<button class="swatch ${preference('theme', 'night') == k ? 'on' : ''}" style="background:${SWATCH[k][0]};color:${SWATCH[k][1]}" onclick="savePreference('theme','${k}')">${l}</button>`).join('')}</div>`)}${row('Text size', `<select onchange="savePreference('text',+this.value)" style="margin:0">${opts([[.9, 'Small'], [1, 'Normal'], [1.15, 'Large'], [1.3, 'Extra large']], preference('text', 1))}</select>`)}${row('Calm mode', `<input type="checkbox" ${preference('calm', false) ? 'checked' : ''} onchange="savePreference('calm',this.checked)" style="width:auto;margin:0">`, 'Stops animations and the walking buddy')}</div>`;
    const study = st ? `<div class="card" style="margin-bottom:14px"><h2>Study</h2>${row('Daily XP goal', `<select onchange="savePreference('goal',+this.value)" style="margin:0">${opts([[20, '20 XP, easy'], [30, '30 XP'], [50, '50 XP'], [80, '80 XP, ambitious']], preference('goal', 30))}</select>`)}${row('Study plan', `<select onchange="setPlanMode(this.value)" style="margin:0">${opts([['auto', 'Made by the buddy'], ['both', 'Buddy plus my own'], ['mine', 'Only my own']], appState.planMode || 'both')}</select>`, 'Add your own sessions on the Study plan page')}</div>` : '';
    const acct = `<div class="card"><h2>Account and privacy</h2>${tk ? (st ? secret('pin', 'Change my PIN', 'Use 6 or more characters. You will be signed out.') : secret('pw', 'Change parent password', 'Use 8 or more characters. You will be signed out.') + secret('pin', 'Reset the student PIN', 'Type your parent password in the first box and the new PIN in the second.')) : ''}${st ? row('Clear chat history', '<button class="btn s g" onclick="clearChat()">Clear</button>') : ''}${st ? row('Download my data', '<button class="btn s g" onclick="exportData()">Download</button>', 'A file with your plan, notes and scores') : ''}${tk ? row('Sign out everywhere', '<button class="btn s g" onclick="logOutEverywhere()">Sign out</button>', 'Ends every signed in device') : ''}${tk && !st ? row('Delete this account', '<button class="btn s g" style="color:var(--bad)" onclick="deleteAccount()">Delete</button>', 'Removes all data for good') : ''}${!tk ? row('Erase data on this device', '<button class="btn s g" style="color:var(--bad)" onclick="eraseThisDevice()">Erase</button>', 'Removes everything stored in this browser') : ''}</div>`;
    return `<h1>Settings</h1><p class="sub">Change how the app looks and how your study buddy behaves. Changes save straight away.</p>${profile}${buddy}${look}${study}${acct}`;
}
