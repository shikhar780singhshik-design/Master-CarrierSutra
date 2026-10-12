// Opens every screen of the app against a fake page, so mistakes show up here instead of in your browser.
// It loads the same script files, in the same order, as public/index.html. Run it with: npm test
const vm = require('vm'), fs = require('fs'), path = require('path');
const publicDir = path.join(__dirname, '..', 'public');
const html = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="([^"]+)"/g)].map((m) => m[1]);

// ---- a very small pretend browser
const elements = {}, written = [];
const makeElement = () => new Proxy(
  { innerHTML: '', style: { setProperty() {} }, classList: { add() {}, remove() {}, toggle() {}, contains: () => false }, dataset: {}, value: '', textContent: '', checked: false },
  { get: (t, k) => (k in t ? t[k] : () => {}), set: (t, k, v) => { t[k] = v; if (k === 'innerHTML') written.push(String(v)); return true; } });
const find = (selector) => elements[selector] || (elements[selector] = makeElement());
const saved = {};
const context = {
  console, JSON, Math, Date, Promise, URL, Intl, encodeURIComponent, decodeURIComponent, Blob: class {}, Image: class {},
  setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
  localStorage: { getItem: (k) => saved[k] || null, setItem: (k, v) => { saved[k] = v; }, removeItem: (k) => { delete saved[k]; } },
  location: { hash: '', hostname: 'localhost', port: '3000', protocol: 'http:' }, navigator: {}, matchMedia: () => ({ matches: false }),
  innerWidth: 1200, innerHeight: 800, scrollTo() {}, alert() {}, confirm: () => true, prompt: () => 'x',
  fetch: () => Promise.reject(new Error('Failed to fetch')),
  document: { querySelector: find, querySelectorAll: () => [], addEventListener() {}, createElement: makeElement, body: { style: { setProperty() {} } }, documentElement: { dataset: {}, style: { setProperty() {} }, classList: { toggle() {} } }, hidden: false },
};
context.window = context;
vm.createContext(context);
const run = (code) => vm.runInContext(code, context);
for (const file of scripts) vm.runInContext(fs.readFileSync(path.join(publicDir, file), 'utf8'), context, { filename: file });

// ---- tiny test runner
let failures = 0;
const check = (name, fn) => { try { fn(); console.log('ok   ', name); } catch (e) { failures++; console.log('FAIL ', name, '->', e.message); } };
const expect = (condition, message) => { if (!condition) throw new Error(message); };
const open = (screen) => run(`currentScreen='${screen}'; render()`);

check('every script file loads', () => expect(scripts.length >= 24, 'only ' + scripts.length + ' scripts'));
check('login screen', () => run('render()'));
run("appState.role='student'; appState.p={name:'Asha',cls:9,age:14,board:'CBSE',school:'X',tutor:'Gulu',buddy:1,lang:3}; appState.chat=[{u:0,t:'Hi'}]");
for (const screen of ['dash', 'plan', 'videos', 'notes', 'quiz', 'focus', 'port', 'settings']) check('student ' + screen, () => open(screen));
for (const tab of ['web', 'mine', 'long', 'short']) check('notes tab ' + tab, () => run(`currentScreen='notes'; selectedTabs.nt='${tab}'; render()`));
check('buddy draws', () => { run('renderBuddy(); buddySays("Hello"); placeBuddy(300,300,true)'); expect(run('chatPanelHtml()').includes('Test voice'), 'panel incomplete'); });

check('own study plan: add, tick, remove', () => {
  Object.assign(find('#pd'), { value: 'Mon' }); Object.assign(find('#pt'), { value: '17:30' }); Object.assign(find('#ps'), { value: 'Science' }); Object.assign(find('#pn'), { value: 'Ch 4' });
  run('addPlanSession()'); expect(run('appState.myPlan.length') === 1, 'not added');
  expect(run("fullPlan().find(d=>d[0]=='Mon')[1].some(x=>x.mine&&x.time=='17:30')"), 'missing from the plan');
  run('togglePlanSessionDone(appState.myPlan[0].id)'); expect(run('appState.myPlan[0].done') === run('todayString()'), 'not ticked');
  run('removePlanSession(appState.myPlan[0].id)'); expect(run('appState.myPlan.length') === 0, 'not removed');
});
check('own notes: save, edit, delete', () => {
  Object.assign(find('#mt'), { value: 'Photosynthesis' }); Object.assign(find('#mx'), { value: 'Plants make food' }); Object.assign(find('#ms'), { value: 'Science' });
  run("currentScreen='notes'; selectedTabs.nt='mine'; saveMyNote()"); expect(run('appState.myNotes.length') === 1, 'not saved');
  run('editing=appState.myNotes[0].id; render()'); run('deleteMyNote(appState.myNotes[0].id)');
});
check('settings changes stick', () => {
  for (const c of ["savePreference('theme','ocean')", "savePreference('text',1.15)", "savePreference('calm',true)", "savePreference('jokes','lots')", "savePreference('goal',50)", "saveProfileField('lang',1)", "saveProfileField('buddy',2)", "saveProfileField('tutor','Raja')", "saveProfileField('cls',10)", "setPlanMode('mine')", 'clearChat()', "currentScreen='settings'; render()"]) run(c);
  expect(run("preference('theme')") === 'ocean', 'theme not kept');
});
check('buddy prompt mentions jokes and the board', () => { const p = run('buddyInstructions()'); expect(/joke/i.test(p) && /CBSE/.test(p), 'prompt incomplete'); });
check('video links are understood', () => { expect(run("embedFor('https://youtu.be/dQw4w9WgXcQ')"), 'no embed'); expect(run("embedFor('http://x.com/a.mp4')") === null, 'insecure link accepted'); });

// every button on every screen must call a function that exists
check('every button handler points to a real function', () => {
  written.length = 0;
  for (const screen of ['dash', 'plan', 'videos', 'notes', 'quiz', 'focus', 'port', 'settings']) open(screen);
  for (const tab of ['web', 'mine']) run(`currentScreen='notes'; selectedTabs.nt='${tab}'; render()`);
  run('renderBuddy(); logOut(); render()'); run("appState.role='parent'; appState.p={name:'A',cls:9,age:14,board:'CBSE',school:'X',buddy:0,lang:0}");
  for (const screen of ['dash', 'plan', 'port', 'voice', 'settings']) open(screen);
  run("appState.role='student'; appState.p={name:'Asha',cls:9,age:14,board:'CBSE',school:'X',tutor:'G',buddy:1,lang:0}; renderBuddy()");
  const builtin = new Set(['if', 'scrollTo', 'confirm', 'alert', 'Number', 'parseInt', 'cancel', 'slice', 'trim', 'toString']);
  const missing = new Set();
  for (const page of written) for (const [, , body] of page.matchAll(/\bon(?:click|change|keydown)=(["'])((?:(?!\1)[^])*)\1/g)) {
    for (const [, name] of body.matchAll(/(?<![\w.$])([A-Za-z_$][\w$]*)\(/g)) if (!builtin.has(name) && run(`typeof ${name}`) !== 'function') missing.add(name);
  }
  expect(missing.size === 0, 'handlers calling missing functions: ' + [...missing].join(', '));
});
run("appState.role='parent'; appState.p={name:'A',cls:9,age:14,board:'CBSE',school:'X',buddy:0,lang:0}");
for (const screen of ['dash', 'plan', 'port', 'voice', 'settings']) check('parent ' + screen, () => open(screen));
check('signing out clears the account (signed in mode)', () => { run("serverOnline=true; sessionToken='x'; logOut()"); expect(run('appState.p') === null, 'profile kept'); expect(run('appState.myNotes.length') === 0, 'notes leaked'); });

console.log(failures ? failures + ' FAILED' : 'ALL PASSED');
process.exit(failures ? 1 : 0);
