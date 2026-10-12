/**
 * screens/lectures.js
 * Lecture videos that play inside the app.
 */
"use strict";

// Works out how to play a pasted link inside the app (YouTube, Vimeo or a video file).
function embedFor(url) {
    let u;
    try {
        u = new URL(url);
    }
    catch (e) {
        return null;
    }
    const h = u.hostname.replace(/^www\./, '');
    let id = null;
    if (h == 'youtu.be')
        id = u.pathname.slice(1);
    else if (/(^|\.)youtube\.com$/.test(h)) {
        id = u.searchParams.get('v') || (u.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]{6,})/) || [])[1];
        const list = u.searchParams.get('list');
        if (!id && list)
            return { kind: 'frame', src: 'https://www.youtube-nocookie.com/embed/videoseries?list=' + encodeURIComponent(list) };
    }
    if (id && /^[\w-]{6,}$/.test(id))
        return { kind: 'frame', src: 'https://www.youtube-nocookie.com/embed/' + id + '?rel=0&modestbranding=1' };
    if (h == 'vimeo.com' || h == 'player.vimeo.com') {
        const m = u.pathname.match(/(\d{6,})/);
        if (m)
            return { kind: 'frame', src: 'https://player.vimeo.com/video/' + m[1] };
    }
    if (u.protocol == 'https:' && /\.(mp4|webm|ogg)$/i.test(u.pathname))
        return { kind: 'file', src: url };
    return null;
}

// The video player shown on the Lectures screen.
function lecturePlayerHtml() {
    if (!playingLecture)
        return '';
    const v = (appState.links[playingLecture.k] || [])[playingLecture.j];
    if (!v)
        return '';
    if (!/^https?:\/\//i.test(v.url))
        return '';
    const e = embedFor(v.url);
    const body = !e ? `<p class="mu">This website cannot be played inside the app. <a href="${escapeHtml(v.url)}" target="_blank" rel="noopener noreferrer" style="color:var(--ac)">Open it in a new tab</a>.</p>`
        : e.kind == 'file' ? `<video controls playsinline src="${escapeHtml(e.src)}"></video>`
            : `<div class="vwrap"><iframe src="${escapeHtml(e.src)}" title="${escapeHtml(v.title)}" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`;
    return `<div class="card" style="margin-bottom:14px"><div class="row"><b>${escapeHtml(v.title)}</b><button class="btn s g" onclick="closeVideo()">Close</button></div>${body}</div>`;
}

// Plays a saved lecture.
function playLecture(k, j) { const v = appState.links[k][j]; playingLecture = { k, j }; if (!v.seen) {
    v.seen = true;
    awardXp(5);
}
else
    saveState(); render(); scrollTo(0, 0); }

// Closes the player.
function closeVideo() { playingLecture = null; render(); }

// The Lectures screen.
function lecturesScreen() {
    const A = selectedTabs.vt == 'A';
    return `<h1>Video lectures</h1><p class="sub">Panel A is for long, detailed lectures. Panel B is for short, summarised ones. Paste a YouTube or Vimeo link, or a direct .mp4 link, and it plays right here in the app.</p>
 <div class="tabs"><button class="${A ? 'on' : ''}" onclick="selectedTabs.vt='A';render()">Panel A: Long lectures</button><button class="${A ? '' : 'on'}" onclick="selectedTabs.vt='B';render()">Panel B: Short summaries</button></div>
 ${lecturePlayerHtml()}<div class="grid">${SUBJ.map((s, i) => { const k = s + selectedTabs.vt, L = appState.links[k] || []; return `<div class="card"><h2>${s}</h2>${L.length ? L.map((v, j) => `<div class="row" style="padding:5px 0"><span>${escapeHtml(v.title)}${v.seen ? ' <span class="tag ok">Watched</span>' : ''}</span><span><button class="btn s" onclick="playLecture('${k}',${j})">Play</button> <button class="btn s g" onclick="removeLectureLink('${k}',${j})">Remove</button></span></div>`).join('') : '<p class="mu">No videos added.</p>'}<input id="vt${i}" placeholder="Title" style="margin-bottom:6px"><input id="vu${i}" placeholder="https://" style="margin-bottom:8px"><button class="btn s" onclick="addLectureLink('${k}',${i})">Add video</button></div>`; }).join('')}</div>`;
}

// Saves a pasted lecture link.
function addLectureLink(k, i) { const t = pick('#vt' + i).value.trim(), u = pick('#vu' + i).value.trim(); if (!t || !/^https?:\/\//.test(u)) {
    alert('Enter a title and a link starting with http or https.');
    return;
} (appState.links[k] = appState.links[k] || []).push({ title: t, url: u }); saveState(); render(); }

// Removes a saved lecture link.
function removeLectureLink(k, j) { appState.links[k].splice(j, 1); playingLecture = null; saveState(); render(); }
