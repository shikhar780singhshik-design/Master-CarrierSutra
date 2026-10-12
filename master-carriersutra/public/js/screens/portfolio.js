/**
 * screens/portfolio.js
 * The career portfolio.
 */
"use strict";

// Career portfolio: strong subjects and possible directions.
function portfolioScreen() {
    const r = subjectsByStrength(), ok = allTests().length > 0, w = r.slice(-1)[0];
    return `<h1>Portfolio</h1><p class="sub">A counsellor style view of strong subjects, suitable streams and what needs work. It becomes more reliable as more tests are taken.</p>${ok ? '' : '<div class="card" style="margin-bottom:14px">No tests taken yet, so no subject can be rated.</div>'}
 <div class="grid"><div class="card"><h2>Subjects</h2>${r.map(([s, v]) => `<div style="margin:10px 0"><div class="row"><span>${s}</span><span class="tag ${levelOf(v)[1]}">${v == null ? 'Not tested' : v + '%, ' + levelOf(v)[0]}</span></div>${progressBar(v)}</div>`).join('')}</div>
 <div class="card"><h2>Possible directions</h2>${ok ? r.slice(0, 2).map(([s]) => `<p><b>Strong in ${s}</b><br>${CAREERS[s].join('<br>')}</p>`).join('') + `<h2>Needs work</h2><p>${w[0]}${w[1] == null ? '' : ', currently ' + w[1] + '%'}. Give it extra time before choosing a stream.</p>` : '<p class="mu">Take at least one test to see suggestions.</p>'}</div></div>`;
}
