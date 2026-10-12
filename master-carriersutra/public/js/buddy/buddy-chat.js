/**
 * buddy/buddy-chat.js
 * The buddy's personality, and sending and receiving chat messages.
 */
"use strict";

// Lets the student speak instead of typing.
function listenToStudent() { const R = window.SpeechRecognition || window.webkitSpeechRecognition; if (!R) {
    alert('Speech input is not supported in this browser. Please type instead.');
    return;
} const r = new R(); r.lang = 'en-IN'; r.onresult = e => { pick('#q').value = e.results[0][0].transcript; sendChatMessage(); }; r.onerror = () => { }; r.start(); }

// The buddy's personality and teaching rules, sent with every message. Edit this to change how it behaves.
const buddyInstructions = () => {
    const j = preference('jokes', 'some'), joke = j == 'lots' ? 'Crack a clean, gentle joke or pun in most replies, about the topic when you can.' : j == 'none' ? 'Do not tell jokes. Stay warm and calm.' : 'Add a light, clean joke or pun every two or three replies.';
    return `Instructions: You are ${buddyName()}, a cartoon study buddy and close friend of ${appState.p.name} (${describeStudent()}). Be a kid buddy of about the student's age: playful, excited, caring, with short simple sentences. ${joke} Jokes must be kind and must never make fun of the student, anyone's family, religion, region or looks.
How to teach: explain step by step in simple words with everyday Indian examples such as cricket, chai, trains, festivals and school life. Match the ${appState.p.board} board and Class ${appState.p.cls} syllabus. For maths and science show the steps. Give a tiny memory trick or rhyme when it helps. After explaining, give a two line summary, then ask ONE small question to check understanding or find out what they enjoy. If their answer to your earlier question is wrong, correct it kindly, explain why, and let them try again. Always praise effort and never shame a mistake. Offer a practice question when they seem ready.
Rules: answer every study question fully and correctly, never refuse and never invent facts. If you are unsure, say what you know and what to double check. If the student seems stressed or sad, be kind and suggest talking to a parent, teacher or trusted adult. Never ask for or accept personal details such as phone numbers, addresses or passwords. Keep everything age appropriate. Reply only in ${currentLanguage()[1]} using natural everyday words a school child uses. Replies are 2 to 5 sentences unless the student asks for more. No emojis and no markdown symbols.\n\nStudent says: `;
};

// Sends the student's message to the AI and shows the reply.
async function sendChatMessage() {
    const i = pick('#q'), t = i ? i.value.trim() : '';
    if (!t || waitingForAi)
        return;
    stopSpeech();
    buddyState.waiting = false;
    buddyState.last = Date.now();
    appState.chat.push({ u: 1, t });
    waitingForAi = true;
    renderChatPanel();
    let h = appState.chat.slice(1).slice(-12).map(m => ({ role: m.u ? 'user' : 'assistant', content: m.t }));
    while (h.length && h[0].role != 'user')
        h.shift();
    h[0].content = buddyInstructions() + h[0].content;
    let r;
    try {
        r = await askAi(h);
    }
    catch (e) {
        r = e.message == 'OFFLINE' ? 'My study server is not running yet. In the project folder run npm start, then open http://localhost:3000 and I can answer you.' : (e.message && e.message != 'Failed to fetch' ? e.message : 'I could not reach my brain just now. Please try again in a moment.');
    }
    appState.chat.push({ u: 0, t: r });
    waitingForAi = false;
    awardXp(2);
    renderChatPanel();
    buddySays(r);
    const q = pick('#q');
    if (q && buddyState.open)
        q.focus();
}

// The buddy reacts to a test result.
function reactToScore(p) { const n = appState.p.name; buddyAction(p >= 50 ? 'cheer' : 'wave'); translateForStudent(p >= 75 ? `Wow ${n}, ${p} percent! That is brilliant. Keep it up!` : p >= 50 ? `Nice work ${n}. A little more practice and you will ace it.` : `That is okay ${n}. Tough ones help us learn. Ask me about it and we will try again together.`).then(buddySays); }

// Greets the student in their language.
function greetStudent(g) { setTimeout(async () => { const x = await translateForStudent(g); if (appState.chat[0] && !appState.chat[0].u)
    appState.chat[0].t = x; saveState(); buddyAction('wave'); buddySays(x); renderChatPanel(); }, 400); }
