/**
 * screens/layout.js
 * The app shell: sidebar, switching screens and page animation.
 */
"use strict";

let buddyShownFor = '';

// Draws the whole screen, then makes sure the buddy is shown correctly.
function render() { applyPreferences(); document.body.style.setProperty('--bgimg', 'url(' + sceneBackground((appState.p && appState.p.buddy) || chosenCharacter || 0) + ')'); drawScreen(); const k = (appState.role || '') + currentRoute(); if (k != buddyShownFor) {
    buddyShownFor = k;
    renderBuddy();
} }

// Draws the sidebar and the current screen.
function drawScreen() {
    const r = pick('#root'), rt = currentRoute();
    if (rt == 'privacy' || rt == 'terms') {
        r.innerHTML = legalPage(rt);
        return;
    }
    if (!appState.role) {
        r.innerHTML = `<div class="login" style="background:url(${sceneBackground(chosenCharacter)}) center/cover"><div class="card"><div class="logo" style="padding:0 0 6px">${logoSvg(34)}<span>Master Carriersutra</span></div><p class="sub" style="margin-bottom:14px">Study plan, lectures, notes, tests and a tutor for Class 6 to 10.</p>${serverOnline || window.claude ? '' : '<p class="mu" style="color:var(--bad)">Study server not found. Progress stays on this device and the AI tutor is off. In the project folder run npm start, then open http://localhost:3000</p>'}<div class="tabs"><button class="on" id="t1" onclick="showLoginForm(1)">Student</button><button id="t2" onclick="showLoginForm(2)">Parent</button></div><div id="lf"></div>${footerLinks()}</div></div>`;
        showLoginForm(1);
        return;
    }
    const st = appState.role == 'student', nav = st ? [['dash', 'Dashboard'], ['plan', 'Study plan'], ['videos', 'Lectures'], ['notes', 'Notes'], ['tutor', 'Study buddy'], ['quiz', 'Tests'], ['focus', 'Focus timer'], ['port', 'Portfolio']] : [['dash', 'Overview'], ['plan', 'Timetable'], ['port', 'Portfolio'], ['voice', 'Voice summary']];
    r.innerHTML = `<div class="app"><aside><div class="logo">${logoSvg(30)}<span>Master Carriersutra</span></div>${nav.map(n => `<button class="nav ${currentScreen == n[0] ? 'on' : ''}" onclick="goTo('${n[0]}')">${n[1]}</button>`).join('')}<div class="sp" style="flex:1"></div><button class="nav ${currentScreen == 'settings' ? 'on' : ''}" onclick="goTo('settings')">Settings</button><button class="nav" onclick="logOut()">Log out</button></aside><main id="m"></main></div>`;
    pick('#m').innerHTML = ({ dash: dashboardScreen, plan: studyPlanScreen, videos: lecturesScreen, notes: notesScreen, quiz: testsScreen, focus: focusTimerScreen, settings: settingsScreen, port: portfolioScreen, voice: parentVoiceScreen })[currentScreen]() + footerLinks();
    if (playEnterAnimation) {
        pick('#m').classList.add('enter');
        playEnterAnimation = false;
    }
    const c = pick('#chat');
    c && (c.scrollTop = c.scrollHeight);
}

// Opens a screen.
function goTo(v) { if (v == 'tutor') {
    buddyState.open = true;
    renderBuddy();
    return;
} currentScreen = v; currentQuiz = null; playingLecture = null; editing = null; playEnterAnimation = true; render(); scrollTo(0, 0); }

let playingLecture = null, playEnterAnimation = false;
