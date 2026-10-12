/**
 * screens/notes.js
 * Notes: board notes from the web, your own notes, and AI written notes.
 */
"use strict";

// ---- notes: board notes from the web, your own notes, and AI written notes
const OFFICIAL_SOURCES = { CBSE: [['NCERT textbooks and solutions', 'https://ncert.nic.in/textbook.php'], ['CBSE Academic: syllabus and sample papers', 'https://cbseacademic.nic.in/'], ['DIKSHA: free lessons', 'https://diksha.gov.in/']], RBSE: [['Rajasthan Board of Secondary Education', 'https://rajeduboard.rajasthan.gov.in/'], ['NCERT textbooks and solutions', 'https://ncert.nic.in/textbook.php'], ['DIKSHA: free lessons', 'https://diksha.gov.in/']], ICSE: [['CISCE: syllabus and papers', 'https://www.cisce.org/'], ['NCERT textbooks and solutions', 'https://ncert.nic.in/textbook.php'], ['DIKSHA: free lessons', 'https://diksha.gov.in/']], 'State board': [['NCERT textbooks and solutions', 'https://ncert.nic.in/textbook.php'], ['DIKSHA: free lessons', 'https://diksha.gov.in/'], ['Your own state board website', null]] };

let editing = null;

// Keys of the saved notes in the current tab.
const noteKeys = () => Object.keys(appState.notes || {}).filter(k => k.startsWith(selectedTabs.nt + '|')).reverse();

// Deletes a saved web or AI note.
function deleteSavedNote(i) { const k = noteKeys()[i]; if (k && confirm('Delete this note?')) {
    delete appState.notes[k];
    saveState();
    render();
} }

// Deletes a note the student wrote.
function deleteMyNote(id) { if (confirm('Delete this note?')) {
    appState.myNotes = (appState.myNotes || []).filter(x => x.id != id);
    saveState();
    render();
} }

// Saves a note the student wrote.
function saveMyNote() {
    const title = pick('#mt').value.trim(), text = pick('#mx').value.trim();
    if (!title || !text) {
        alert('Add a title and some text.');
        return;
    }
    if (editing)
        appState.myNotes = (appState.myNotes || []).map(n => n.id == editing ? { ...n, title, text, subject: pick('#ms').value, t: Date.now() } : n);
    else {
        appState.myNotes = [...(appState.myNotes || []), { id: 'n' + Date.now().toString(36), title, text, subject: pick('#ms').value, t: Date.now() }];
        awardXp(3);
    }
    editing = null;
    saveState();
    render();
}

// The "My notes" tab.
function myNotesScreen() {
    const list = appState.myNotes || [], e = list.find(x => x.id == editing);
    return `<div class="card" style="margin-bottom:14px"><h2>${e ? 'Edit note' : 'Write a note'}</h2><div class="grid"><div><label>Title</label><input id="mt" maxlength="120" value="${e ? escapeHtml(e.title) : ''}"></div><div><label>Subject</label><select id="ms">${[...SUBJ, 'General'].map(s => `<option ${e && e.subject == s ? 'selected' : ''}>${s}</option>`).join('')}</select></div></div><label>Your note</label><textarea id="mx" rows="8" style="font-family:inherit">${e ? escapeHtml(e.text) : ''}</textarea><button class="btn" onclick="saveMyNote()">${e ? 'Save changes' : 'Save note'}</button>${e ? ' <button class="btn g" onclick="editing=null;render()">Cancel</button>' : ''}</div>`
        + (list.length ? [...list].reverse().map(n => `<div class="card" style="margin-bottom:12px"><div class="row"><h2>${escapeHtml(n.title)} <span class="tag">${escapeHtml(n.subject)}</span></h2><span><button class="btn s g" onclick="editing='${escapeHtml(n.id)}';render();scrollTo(0,0)">Edit</button> <button class="btn s g" onclick="deleteMyNote('${escapeHtml(n.id)}')">Delete</button></span></div><div class="note">${escapeHtml(n.text)}</div></div>`).join('') : '<p class="mu">You have not written any notes yet.</p>');
}

// The Notes screen.
function notesScreen() {
    const t = selectedTabs.nt, web = t == 'web';
    const head = `<h1>Notes</h1><p class="sub">Find notes for your board, write your own, or ask for detailed or last-minute notes.</p><div class="tabs">${[['web', 'Board notes'], ['mine', 'My notes'], ['long', 'Detailed (AI)'], ['short', 'Last minute (AI)']].map(([k, l]) => `<button class="${t == k ? 'on' : ''}" onclick="selectedTabs.nt='${k}';render()">${l}</button>`).join('')}</div>`;
    if (t == 'mine')
        return head + myNotesScreen();
    const form = `<div class="card" style="margin-bottom:14px"><div class="grid"><div><label>Subject</label><select id="ns">${SUBJ.map(s => `<option>${s}</option>`).join('')}</select></div><div><label>Topic or chapter</label><input id="nt" placeholder="For example: Light, reflection and refraction"></div></div><button class="btn" id="nb" onclick="${web ? 'findNotes()' : 'writeNotesWithAi()'}">${web ? 'Find best notes' : 'Write notes'}</button>${web ? ` <button class="btn g" id="nb2" onclick="starterNotes()">Add starter notes for my class</button><p class="mu" style="margin-top:10px">Searches official sources for ${escapeHtml(appState.p.board)} Class ${appState.p.cls}, then explains them in simple words and lists the links it used.</p>` : ''}</div>`;
    const src = web ? `<div class="card" style="margin-bottom:14px"><h2>Official sources for ${escapeHtml(appState.p.board)}</h2>${(OFFICIAL_SOURCES[appState.p.board] || OFFICIAL_SOURCES['State board']).map(([n, u]) => u ? `<div style="padding:4px 0"><a href="${u}" target="_blank" rel="noopener noreferrer" style="color:var(--ac)">${n}</a></div>` : `<div class="mu" style="padding:4px 0">${n}</div>`).join('')}</div>` : '';
    const list = noteKeys().map((k, i) => `<div class="card" style="margin-bottom:12px"><div class="row"><h2>${escapeHtml(k.split('|').slice(1).join(': '))}</h2><button class="btn s g" onclick="deleteSavedNote(${i})">Delete</button></div><div class="note">${escapeHtml(appState.notes[k])}</div></div>`).join('');
    return head + form + src + `<div id="nout">${list || '<p class="mu">Nothing saved here yet.</p>'}</div>`;
}

// Asks the AI to search official sites and write notes for the student's board and class.
async function fetchNotes(s, t, label) { const r = await askAi(`Find good study notes for a ${appState.p.board} board student in Class ${appState.p.cls}. Subject: ${s}. Topic: ${t}. Search the web and prefer official sources such as NCERT, the board's own website and DIKSHA. Then write clear notes in your own words: short headings, key definitions, formulas or dates, one worked example and 3 practice questions. Do not copy text word for word. Finish with a line starting "Sources:" and the web addresses you used. Plain text only, no emojis, no markdown symbols.`); appState.notes['web|' + s + '|' + (label || t)] = r; saveState(); }

// Finds notes for one topic.
async function findNotes() {
    const s = pick('#ns').value, t = pick('#nt').value.trim(), b = pick('#nb');
    if (!t) {
        alert('Enter a topic or chapter.');
        return;
    }
    b.disabled = true;
    b.textContent = 'Searching...';
    try {
        await fetchNotes(s, t);
    }
    catch (e) {
        alert(e.message == 'OFFLINE' ? 'The study server is not running. Start it with npm start.' : 'Could not fetch notes right now. Please try again.');
    }
    render();
}

// Collects starter notes for every subject.
async function starterNotes() {
    const b = pick('#nb2');
    b.disabled = true;
    b.textContent = 'Collecting notes...';
    let failed = 0;
    for (const s of SUBJ) {
        if (appState.notes['web|' + s + '|Key topics of the year'])
            continue;
        try {
            await fetchNotes(s, 'the whole Class ' + appState.p.cls + ' syllabus: a short summary of each chapter', 'Key topics of the year');
            render();
        }
        catch (e) {
            failed++;
        }
    }
    if (failed)
        alert(failed + ' subject(s) could not be fetched. Check that the server and AI key are set up, then try again.');
    render();
}

// Asks the AI to write detailed or last-minute notes.
async function writeNotesWithAi() {
    const s = pick('#ns').value, t = pick('#nt').value.trim();
    if (!t) {
        alert('Enter a topic.');
        return;
    }
    const L = selectedTabs.nt == 'long', b = pick('#nb');
    b.disabled = true;
    b.textContent = 'Writing...';
    try {
        const r = await askAi(`Write ${L ? 'detailed study notes with clear headings, definitions, examples and a few practice questions' : 'a one-page last-minute revision sheet with key points, formulas or dates, and common mistakes'} for a student. ${describeStudent()}. Subject: ${s}. Topic: ${t}. Use plain text only, no emojis, no markdown symbols. Follow the ${appState.p.board} syllabus as closely as you can.`);
        appState.notes[selectedTabs.nt + '|' + s + '|' + t] = r;
        saveState();
    }
    catch (e) {
        alert('The AI service is not available right now. Try again in a moment.');
    }
    render();
}
