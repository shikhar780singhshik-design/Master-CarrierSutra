/**
 * screens/login.js
 * Sign up, sign in, parent access and logging out.
 */
"use strict";

// The buddy's first hello.
function firstGreeting(p) { const t = p.tutor, n = p.name; return p.lang == 1 ? `नमस्ते ${n}! मैं ${t} हूँ, तुम्हारा स्टडी दोस्त। आज तुम क्या पढ़ रहे हो?` : p.lang == 2 ? `Namaste ${n}! Main ${t} hoon, tumhara study dost. Aaj tum kya padh rahe ho?` : `Hi ${n}! I'm ${t}, your study buddy. Nice to meet you. What are you studying today?`; }

// Picks a character on the sign-up form.
function pickCharacter(k) { chosenCharacter = k; document.querySelectorAll('.bud').forEach((x, n) => x.classList.toggle('on', n == k)); const l = pick('.login'); if (l)
    l.style.background = 'url(' + sceneBackground(k) + ') center/cover'; document.body.style.setProperty('--bgimg', 'url(' + sceneBackground(k) + ')'); renderBuddyFigure(); }

// Shows the student sign-up, student sign-in or parent form.
function showLoginForm(i) {
    pick('#t1').className = i != 2 ? 'on' : '';
    pick('#t2').className = i == 2 ? 'on' : '';
    const sf = `<label>Name</label><input id="n" value="${escapeHtml(appState.p?.name || '')}" autocomplete="off"><div style="display:flex;gap:10px"><div style="flex:1"><label>Class</label><select id="c">${[6, 7, 8, 9, 10].map(x => `<option ${appState.p?.cls == x ? 'selected' : ''}>${x}</option>`)}</select>${window.claude ? '' : `<p class="mu" style="margin:-6px 0 12px">${serverOnline && cloudVoiceReady ? 'Every language is spoken with the server voice.' : 'Without a cloud voice key on the server, only languages your device already has a voice for are spoken (usually English and Hindi). See the README.'}</p>`}</div><div style="flex:1"><label>Age</label><input id="a" type="number" min="8" max="20" value="${appState.p?.age || 13}"></div></div><label>Board</label><select id="b">${['CBSE', 'RBSE', 'ICSE', 'State board'].map(x => `<option ${appState.p?.board == x ? 'selected' : ''}>${x}</option>`)}</select><label>School</label><input id="s" value="${escapeHtml(appState.p?.school || '')}"><label>Choose your study buddy</label><div style="display:flex;gap:12px;margin:6px 0 12px">${CHARACTERS.map((c, k) => `<button type="button" class="bud ${(appState.p?.buddy || chosenCharacter) == k ? 'on' : ''}" onclick="pickCharacter(${k})" aria-label="${CHARACTER_NAMES[k]}">${c()}</button>`).join('')}</div><label>Name your study buddy</label><input id="tn" value="${escapeHtml(appState.p?.tutor || '')}" placeholder="Choose any name you like" maxlength="20"><label>Tutor speaks</label><select id="lg">${LANGUAGES.map((l, k) => `<option value="${k}" ${(appState.p?.lang || 0) == k ? 'selected' : ''}>${l[1]}</option>`)}</select>`;
    const code = r => `<label>Family code</label><input id="fc" autocapitalize="characters" autocomplete="off"><label>${r == 'parent' ? 'Parent password' : 'Student PIN'}</label><input id="fs" type="password"><button class="btn" style="width:100%" onclick="signIn('${r}')">Sign in</button>`;
    if (i == 3)
        pick('#lf').innerHTML = code('student') + `<p class="mu" style="margin-top:12px"><a onclick="showLoginForm(1)" style="cursor:pointer;color:var(--ac)">I am new, create my profile</a></p>`;
    else if (i == 2)
        pick('#lf').innerHTML = serverOnline ? `<p class="mu">Use the family code shown on your child's dashboard.</p>` + code('parent') : `<p class="mu">${appState.p ? 'Linked student on this device: <b>' + escapeHtml(appState.p.name) + '</b>.' : 'The student must create a profile first on this device.'}</p><button class="btn" style="width:100%" onclick="openLocalParentView()">Open parent dashboard</button>`;
    else
        pick('#lf').innerHTML = sf + (serverOnline ? `<label>Student PIN (6 or more characters)</label><input id="pin" type="password"><label>Parent password (8 or more, different from the PIN)</label><input id="pw" type="password">` : '') + `<button class="btn" style="width:100%" onclick="createStudentProfile()">Continue</button>` + (serverOnline ? `<p class="mu" style="margin-top:12px"><a onclick="showLoginForm(3)" style="cursor:pointer;color:var(--ac)">I already have a family code</a></p>` : '');
}

// Creates a new student profile (and a server account when the server is running).
async function createStudentProfile() {
    const n = pick('#n').value.trim();
    if (!n) {
        alert('Please enter a name.');
        return;
    }
    const p = { name: n, cls: +pick('#c').value, age: +pick('#a').value || 13, board: pick('#b').value, school: pick('#s').value.trim() || 'Not given', tutor: pick('#tn').value.trim().slice(0, 20) || 'Pip', buddy: chosenCharacter, lang: +pick('#lg').value || 0 };
    if (serverOnline) {
        try {
            const r = await fetch(API_BASE + '/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ p, pin: pick('#pin').value, pw: pick('#pw').value }) }), j = await r.json();
            if (!r.ok) {
                alert(j.error || 'Could not register.');
                return;
            }
            sessionToken = j.token;
            appState.token = j.token;
            appState.code = j.code;
            alert('Your family code is ' + j.code + '. Write it down. Parents need it to sign in.');
        }
        catch (e) {
            alert('Could not reach the server.');
            return;
        }
    }
    const g = firstGreeting(p);
    appState.role = 'student';
    appState.p = p;
    appState.chat = [{ u: 0, t: g }];
    buddyState.open = false;
    currentScreen = 'dash';
    saveState();
    render();
    greetStudent(g);
}

// Signs in with a family code.
async function signIn(role) {
    try {
        const r = await fetch(API_BASE + '/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: pick('#fc').value, secret: pick('#fs').value, role }) }), j = await r.json();
        if (!r.ok) {
            alert(j.error || 'Sign in failed.');
            return;
        }
        sessionToken = j.token;
        appState = { ...freshState(), ...j.state, token: j.token, code: j.code, role: j.role, chat: [] };
        currentScreen = 'dash';
        const g = `Welcome back ${appState.p.name}! Ready to study? Tell me what you are working on.`;
        if (j.role == 'student')
            appState.chat = [{ u: 0, t: g }];
        saveState();
        render();
        if (j.role == 'student')
            greetStudent(g);
    }
    catch (e) {
        alert('Could not reach the server.');
    }
}

// Parent view when there is no server (same device).
function openLocalParentView() { if (!appState.p) {
    alert('No student profile found yet.');
    return;
} appState.role = 'parent'; currentScreen = 'dash'; saveState(); render(); }

// Logs out.
function logOut() { if (serverOnline) {
    appState = { ...freshState() };
    sessionToken = null;
}
else
    appState.role = null; saveState(); render(); }

// Signs out every device for this family.
async function logOutEverywhere() { if (!confirm('Sign out on every device where this family is signed in?'))
    return; try {
    await fetch(API_BASE + '/api/logout-all', { method: 'POST', headers: authHeaders(), body: '{}' });
}
catch (e) { } logOut(); }

// Shared school computers: sign out after 30 quiet minutes (not while a video, timer or test is running).
setInterval(() => { if (appState.role && !playingLecture && !focusTimer.run && Date.now() - buddyState.last > 30 * 60 * 1000)
    logOut(); }, 60000);
