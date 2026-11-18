/**
 * screens/tests.js
 * Daily, weekly and monthly tests.
 */
"use strict";

// The Tests screen and the quiz.
function testsScreen() {
    if (waitingForAi)
        return '<h1>Preparing your test</h1><p class="sub">Writing questions for you.</p>';
    if (!currentQuiz)
        return `<h1>Tests</h1><p class="sub">Daily pop quizzes, weekly tests and monthly tests. Every result is saved to the dashboard and changes the study plan.</p><div class="card" style="margin-bottom:14px"><label>Topic (optional, leave empty for the whole subject)</label><input id="qt" placeholder="For example: Fractions"></div><div class="card" style="margin-bottom:14px"><label for="quiz-count">Questions per test</label><select id="quiz-count"><option value="">Use test default</option>${Array.from({ length: 10 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('')}</select></div><div class="grid">${[['Daily pop quiz', 3, 'Daily'], ['Weekly test', 5, 'Weekly'], ['Monthly test', 8, 'Monthly']].map(t => `<div class="card"><h2>${t[0]}</h2><p class="mu">${t[1]} questions by default</p>${SUBJ.map(s => `<button class="btn s g" style="margin:3px 3px 3px 0" onclick="startQuiz('${s}',${t[1]},'${t[2]}')">${s}</button>`).join('')}</div>`).join('')}</div>`;
    if (currentQuiz.done) {
        const p = Math.round(currentQuiz.ok / currentQuiz.qs.length * 100);
        return `<div class="card"><h1>${p}%</h1><p>${currentQuiz.s}, ${currentQuiz.t}: ${currentQuiz.ok} of ${currentQuiz.qs.length} correct.</p><button class="btn" onclick="goTo('quiz')">Back to tests</button> <button class="btn g" onclick="goTo('dash')">Dashboard</button></div>`;
    }
    const q = currentQuiz.qs[currentQuiz.i];
    return `<div class="card"><div class="row"><b>${currentQuiz.s}, ${currentQuiz.t}</b><span class="mu">${currentQuiz.i + 1} of ${currentQuiz.qs.length}</span></div>${progressBar(currentQuiz.i / currentQuiz.qs.length * 100)}<h2 style="margin-top:16px">${escapeHtml(q[0])}</h2>${q[1].map((o, j) => `<button class="opt ${currentQuiz.a != null ? (j == q[2] ? 'ok' : j == currentQuiz.a ? 'bad' : '') : ''}" ${currentQuiz.a != null ? 'disabled' : ''} onclick="answerQuestion(${j})">${escapeHtml(o)}</button>`).join('')}${currentQuiz.a != null ? `<button class="btn" onclick="nextQuestion()">${currentQuiz.i + 1 < currentQuiz.qs.length ? 'Next' : 'Finish'}</button>` : ''}</div>`;
}

const previousQuizQuestions = new Map();

function mathsPracticeBank() {
    return Array.from({ length: 12 }, (_, i) => {
        const x = i + 3;
        return [
            [`What is 25% of ${4 * x}?`, x],
            [`Solve 3x + 5 = ${3 * x + 5}. What is x?`, x],
            [`What is the square root of ${x * x}?`, x],
            [`What is ¾ of ${4 * x}?`, 3 * x],
        ];
    }).flat().map(([question, answer]) => {
        const options = shuffleQuizItems([answer - 2, answer - 1, answer, answer + 1]);
        return [question, options.map(String), options.indexOf(answer)];
    });
}

function shuffleQuizItems(items) {
    const result = items.slice();
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

// Starts a quiz (AI written, with a backup bank).
async function startQuiz(s, n, t) {
    const count = Number(pick('#quiz-count')?.value);
    if (Number.isInteger(count) && count >= 1 && count <= 10) n = count;
    const tp = (pick('#qt') || {}).value || '';
    let qs;
    waitingForAi = true;
    render();
    try {
        const r = await askAi(`Create ${n} multiple choice questions for a student. ${describeStudent()}. Subject: ${s}. ${tp ? 'Topic: ' + tp + '.' : ''} Mix easy and medium difficulty. Reply with ONLY a JSON array, no other text. Each item: {"q":"question","o":["a","b","c","d"],"a":index of correct option 0 to 3}.`, true);
        qs = r.filter(x => typeof x?.q === 'string' && x.q.trim() &&
            Array.isArray(x.o) && x.o.length === 4 && x.o.every(o => typeof o === 'string' && o.trim()) &&
            Number.isInteger(x.a) && x.a >= 0 && x.a < 4).map(x => [x.q, x.o, x.a]);
    } catch {
        qs = [];
    }
    const bank = s === 'Mathematics' ? mathsPracticeBank() : [...BANK[s], ...extraQuizQuestions(s)];
    const seen = new Set(previousQuizQuestions.get(s));
    const questionKey = question => question.trim().toLowerCase();
    qs = [...qs, ...shuffleQuizItems(bank)].filter(([question]) => {
        const key = questionKey(question);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    }).slice(0, n);
    previousQuizQuestions.set(s, qs.map(([question]) => questionKey(question)));
    waitingForAi = false;
    currentQuiz = { s, t, qs, i: 0, ok: 0, a: null };
    render();
}

// Marks an answer.
function answerQuestion(j) { currentQuiz.a = j; if (j == currentQuiz.qs[currentQuiz.i][2]) {
    currentQuiz.ok++;
    buddyAction('cheer');
} render(); }

// Moves on, and records the score at the end.
function nextQuestion() { currentQuiz.a = null; currentQuiz.i++; if (currentQuiz.i >= currentQuiz.qs.length) {
    currentQuiz.done = 1;
    (appState.sc[currentQuiz.s] = appState.sc[currentQuiz.s] || []).push({ s: currentQuiz.s, t: currentQuiz.t, p: Math.round(currentQuiz.ok / currentQuiz.qs.length * 100), d: Date.now() });
    awardXp(10 + currentQuiz.ok * 10);
    reactToScore(Math.round(currentQuiz.ok / currentQuiz.qs.length * 100));
} render(); }
