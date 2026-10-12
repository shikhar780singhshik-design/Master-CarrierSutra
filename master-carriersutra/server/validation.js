/**
 * server/validation.js
 * Checks and cleans everything the browser sends before it is saved.
 */

// Only keep the fields we expect, and keep them a sensible size.
function cleanProfile(p = {}) {
  const between = (value, low, high, fallback) => Math.min(high, Math.max(low, Number(value) || fallback));
  return {
    name: String(p.name || '').slice(0, 60),
    cls: between(p.cls, 6, 10, 6),
    age: between(p.age, 8, 20, 13),
    board: String(p.board || '').slice(0, 20),
    school: String(p.school || '').slice(0, 80),
    tutor: String(p.tutor || 'Pip').slice(0, 20),
    buddy: between(p.buddy, 0, 3, 0),
    lang: between(p.lang, 0, 11, 0),
  };
}

// Too easy to guess: all one character, or a very common choice.
const isWeak = (x) => /^(.)\1*$/.test(x) || ['123456', '1234567', '12345678', 'password', 'qwerty', '111111'].includes(String(x).toLowerCase());

const SUBJECTS = ['Mathematics', 'Science', 'English', 'Social Science', 'Hindi'];

const DAY = /^\d{4}-\d{2}-\d{2}$/;

const isObject = (x) => x && typeof x === 'object' && !Array.isArray(x);

// Progress comes from the browser, so we rebuild it field by field and throw away anything unexpected.
function cleanState(s = {}) {
  const out = { sc: {}, links: {}, notes: {}, xp: 0, days: [], xpDay: {} };
  for (const subject of SUBJECTS) {
    const tests = Array.isArray(s.sc?.[subject]) ? s.sc[subject] : [];
    out.sc[subject] = tests.slice(-300).map((t) => ({ s: subject, t: String(t?.t || '').slice(0, 12), p: Math.min(100, Math.max(0, Number(t?.p) || 0)), d: Number(t?.d) || 0 }));
  }
  for (const [key, list] of Object.entries(isObject(s.links) ? s.links : {})) {
    if (!SUBJECTS.some((x) => key === x + 'A' || key === x + 'B') || !Array.isArray(list)) continue;
    out.links[key] = list.slice(0, 30)
      .filter((v) => v && /^https?:\/\//i.test(String(v.url)) && String(v.url).length <= 500) // blocks javascript: links
      .map((v) => ({ title: String(v.title || '').slice(0, 120), url: String(v.url), seen: !!v.seen }));
  }
  for (const [key, text] of Object.entries(isObject(s.notes) ? s.notes : {}).slice(0, 40)) {
    if (key.length <= 150) out.notes[key] = String(text).slice(0, 20000);
  }
  out.xp = Math.min(1e7, Math.max(0, Math.floor(Number(s.xp) || 0)));
  out.days = (Array.isArray(s.days) ? s.days : []).filter((d) => DAY.test(String(d))).slice(-400);
  for (const [day, value] of Object.entries(isObject(s.xpDay) ? s.xpDay : {}).slice(-400)) {
    if (DAY.test(day)) out.xpDay[day] = Math.min(1e5, Math.max(0, Math.floor(Number(value) || 0)));
  }
  // Settings, the student's own plan and the student's own notes
  const pr = isObject(s.prefs) ? s.prefs : {};
  const within = (v, low, high, fallback) => Math.min(high, Math.max(low, Number(v) || fallback));
  const short = (v, n) => String(v ?? '').slice(0, n);
  out.prefs = {
    theme: ['night', 'light', 'ocean', 'contrast'].includes(pr.theme) ? pr.theme : 'night',
    text: within(pr.text, 0.9, 1.3, 1), calm: !!pr.calm, voice: pr.voice !== false, speed: within(pr.speed, 0.7, 1.3, 1),
    jokes: ['lots', 'some', 'none'].includes(pr.jokes) ? pr.jokes : 'some', goal: Math.round(within(pr.goal, 10, 200, 30)),
  };
  out.planMode = ['auto', 'mine', 'both'].includes(s.planMode) ? s.planMode : 'both';
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  out.myPlan = (Array.isArray(s.myPlan) ? s.myPlan : []).slice(0, 120).filter((x) => x && days.includes(x.day))
    .map((x) => ({ id: short(x.id, 20), day: x.day, time: /^\d{2}:\d{2}$/.test(String(x.time)) ? x.time : '17:00', subject: short(x.subject, 40), note: short(x.note, 120), done: DAY.test(String(x.done)) ? x.done : '' }));
  out.myNotes = (Array.isArray(s.myNotes) ? s.myNotes : []).slice(0, 100)
    .map((x) => ({ id: short(x?.id, 20), subject: short(x?.subject, 40), title: short(x?.title, 120), text: short(x?.text, 20000), t: Number(x?.t) || 0 }));
  return out;
}

module.exports = { cleanProfile, cleanState, isWeak };
