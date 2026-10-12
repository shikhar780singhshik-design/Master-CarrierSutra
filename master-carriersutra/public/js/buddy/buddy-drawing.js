/**
 * buddy/buddy-drawing.js
 * Drawing the buddy, its speech bubble and the chat panel.
 */
"use strict";

// Shows a speech bubble next to the buddy and speaks the line.
function buddySays(t) { buddyState.say = t; renderBuddyFigure(); clearTimeout(bubbleTimer); bubbleTimer = setTimeout(() => { buddyState.say = null; renderBuddyFigure(); }, Math.min(22000, 5000 + t.length * 55)); speakAloud(t); }

// Draws the buddy and its speech bubble.
function renderBuddyFigure() {
    const e = pick('#pipc');
    if (!e)
        return;
    if (appState.role == 'parent' || currentRoute()) {
        e.style.display = 'none';
        return;
    }
    e.style.display = '';
    const st = appState.role == 'student', b = buddyState.say || (st ? '' : "Hi! I'm your study buddy. Fill in your details and give me a name.");
    e.innerHTML = `${b ? `<div class='bub'>${escapeHtml(b.length > 260 ? b.slice(0, 257) + '...' : b)}</div>` : ''}<button class='face' onclick='toggleChat()' aria-label='Chat with ${escapeHtml(buddyName())}'>${buddyFigure()}</button>`;
}

// Draws the chat panel.
function renderChatPanel() { const el = pick('#pcp'); if (!el)
    return; el.innerHTML = buddyState.open && appState.role == 'student' && !currentRoute() ? chatPanelHtml() : ''; const c = pick('#pc'); if (c)
    c.scrollTop = c.scrollHeight; }

// Redraws both the buddy and the chat panel.
function renderBuddy() { renderBuddyFigure(); renderChatPanel(); }

// Opens or closes the chat panel.
function toggleChat() { if (appState.role != 'student')
    return; buddyState.open = !buddyState.open; buddyState.last = Date.now(); renderChatPanel(); const q = pick('#q'); if (q && buddyState.open)
    q.focus(); }

// Switches the spoken voice on or off.
function toggleVoice() { savePreference('voice', !buddyState.voice); }

// Lets the student rename the buddy.
function renameBuddy() { const n = prompt('What would you like to call your study buddy?', buddyName()); if (n && n.trim()) {
    appState.p.tutor = n.trim().slice(0, 20);
    saveState();
    renderBuddy();
} }

// The HTML of the chat panel.
function chatPanelHtml() { return `<div class='cp'><div class='hd'><span class='hav'>${CHARACTERS[appState.p.buddy || 0]()}</span><b style='flex:1'>${escapeHtml(buddyName())}</b><button class='btn s g' onclick='renameBuddy()'>Rename</button><select aria-label='Language' onchange='changeLanguage(this.value)' style='width:auto;margin:0;padding:4px'>${LANGUAGES.map((l, k) => `<option value='${k}' ${(appState.p.lang || 0) == k ? 'selected' : ''}>${l[1].split(' (')[0]}</option>`).join('')}</select><button class='btn s g' onclick='toggleVoice()'>Voice ${buddyState.voice ? 'on' : 'off'}</button><button class='btn s g' onclick='testVoice()'>Test voice</button><button class='btn s g' onclick='toggleChat()'>Close</button></div><div class='mu' style='padding:6px 12px 0'>${voiceStatusText()}</div><div class='chat' id='pc'>${appState.chat.map(m => `<div class='m ${m.u ? 'u' : ''}'>${escapeHtml(m.t)}</div>`).join('')}${waitingForAi ? `<div class='m'>${escapeHtml(buddyName())} is typing...</div>` : ''}</div><div class='chips'>${QUICK_BUTTONS.map((c, i) => `<button class='btn s g' onclick='useQuickButton(${i})'>${c[0]}</button>`).join('')}</div><div class='ft'><input id='q' placeholder='Type your question' autocomplete='off' onkeydown="if(event.key=='Enter')sendChatMessage()"><button class='btn g' onclick='listenToStudent()'>Speak</button><button class='btn' onclick='sendChatMessage()' ${waitingForAi ? 'disabled' : ''}>Send</button></div><div class='mu' style='padding:0 10px 8px'>Do not share phone numbers, addresses or passwords here.</div></div>`; }

// Quick chat buttons: [label, message sent].
const QUICK_BUTTONS = [['Explain simply', 'Explain the last thing we talked about in a simpler way.'], ['Tell me a joke', 'Tell me a clean, funny joke related to studying.'], ['Quiz me', 'Ask me one question on what we just discussed.'], ['Memory trick', 'Give me a fun trick or rhyme to remember this.'], ['Real example', 'Give me a real life example from India.']];

// Sends one of the quick messages.
function useQuickButton(i) { const q = pick('#q'); if (q) {
    q.value = QUICK_BUTTONS[i][1];
    sendChatMessage();
} }
