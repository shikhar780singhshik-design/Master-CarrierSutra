/**
 * screens/parent-voice.js
 * The parent's spoken summary and questions about the child.
 */
"use strict";

// The spoken summary for parents.
function childSummary() { const r = subjectsByStrength(), o = overallAverage(); if (o == null)
    return `${appState.p.name} is in Class ${appState.p.cls}, ${appState.p.board} board. No tests have been taken yet, so there are no results to report.`; return `${appState.p.name} is in Class ${appState.p.cls}, ${appState.p.board} board, with an overall test average of ${o} percent. The strongest subject so far is ${r[0][0]}, and ${r.slice(-1)[0][0]} needs the most attention. Based on this, options worth exploring are ${CAREERS[r[0][0]].slice(0, 2).join(' and ')}. The timetable gives extra sessions to the weaker subjects.`; }

// The parent's voice summary screen.
function parentVoiceScreen() {
    return `<h1>Voice summary</h1><p class="sub">A spoken update on ${escapeHtml(appState.p.name)}'s studies and future options. You can also ask the assistant questions about your child's progress.</p><div class="card" style="margin-bottom:14px"><p>${escapeHtml(childSummary())}</p><button class="btn" onclick="readOutLoud(childSummary())">Play summary</button> <button class="btn g" onclick="speechSynthesis&&speechSynthesis.cancel()">Stop</button></div>
 <div class="card"><label>Ask a question</label><input id="pq" placeholder="For example: How can I help with maths at home?"><button class="btn" id="pb" onclick="askAboutChild()">Ask</button><div class="note" id="pa" style="margin-top:12px"></div></div>`;
}

// Lets a parent ask the AI about their child's progress.
async function askAboutChild() {
    const q = pick('#pq').value.trim();
    if (!q)
        return;
    const b = pick('#pb'), o = pick('#pa');
    b.disabled = true;
    o.textContent = 'Thinking...';
    const sc = SUBJ.map(s => s + ': ' + (subjectAverage(s) == null ? 'not tested' : subjectAverage(s) + '%')).join(', ');
    try {
        const r = await askAi(`You are a warm, plain spoken education assistant talking to a parent. Student: ${appState.p.name}, ${describeStudent()}. Test averages: ${sc}. Answer the parent's question honestly and practically in under 150 words, using only the data given for facts about the child. No emojis. Question: ${q}`);
        o.textContent = r;
        readOutLoud(r);
    }
    catch (e) {
        o.textContent = 'The AI service is not available right now.';
    }
    b.disabled = false;
}
