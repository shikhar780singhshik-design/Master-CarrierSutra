/**
 * buddy/buddy-voice.js
 * How the buddy speaks: cloud voice first, device voice as a backup.
 */
"use strict";

// Finds the best voice installed on this device for the chosen language.
function chooseBrowserVoice() { const L = currentLanguage()[0].replace('_', '-').toLowerCase(), vs = speechSynthesis.getVoices(), n = x => x.lang.replace('_', '-').toLowerCase(), pr = a => a.find(x => /natural|neerja|swara|online/i.test(x.name)) || a.find(x => /female|google|heera|veena/i.test(x.name)) || a[0]; return pr(vs.filter(x => n(x) == L)) || pr(vs.filter(x => n(x).startsWith(L.slice(0, 2)))) || (L.startsWith('en') ? vs.find(x => /^en/i.test(x.lang)) : null); }

// Speaks a line: with the cloud voice if the server has one, otherwise with the device voice.
function speakAloud(t) { if (!buddyState.voice)
    return; if (navigator.userActivation && !navigator.userActivation.hasBeenActive) {
    buddyState.pend = t;
    return;
} if (serverOnline && cloudVoiceReady && sessionToken)
    speakWithCloudVoice(t);
else
    speakWithBrowserVoice(t); }

// Speaks using a voice installed on this device.
function speakWithBrowserVoice(t) {
    try {
        const ss = window.speechSynthesis;
        if (!ss)
            return;
        ss.cancel();
        const v = chooseBrowserVoice();
        if (!v && !currentLanguage()[0].startsWith('en'))
            return;
        const e = pick('#pipc'), txt = t.replace(/[*_#`]/g, '').replace(/\s+/g, ' ').trim(), ch = [];
        let c = '';
        for (const x of txt.match(/[^.!?]+[.!?]*/g) || [txt]) {
            if ((c + x).length > 170 && c) {
                ch.push(c);
                c = x;
            }
            else
                c += x;
        }
        if (c)
            ch.push(c);
        ch.forEach((x, i) => { const u = new SpeechSynthesisUtterance(x.trim()); u.lang = v ? v.lang : currentLanguage()[0]; if (v)
            u.voice = v; u.rate = .96 * preference('speed', 1); u.pitch = 1.08; if (i == 0)
            u.onstart = () => e && e.classList.add('talk'); if (i == ch.length - 1)
            u.onend = u.onerror = () => e && e.classList.remove('talk'); ss.speak(u); });
    }
    catch (x) { }
}

if (window.speechSynthesis) {
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => renderChatPanel();
}

let speechRunId = 0, cloudVoiceError = '';

// Stops anything being spoken.
function stopSpeech() { speechRunId++; if (buddyState.audio) {
    buddyState.audio.pause();
    buddyState.audio = null;
} if (window.speechSynthesis)
    speechSynthesis.cancel(); const e = pick('#pipc'); e && e.classList.remove('talk'); }

// Cuts a long reply into short pieces that voices handle well.
function splitIntoChunks(t, max) { const out = []; let c = ''; for (const x of t.replace(/\s+/g, ' ').match(/[^.!?।]+[.!?।]*/g) || [t]) {
    if ((c + x).length > max && c) {
        out.push(c.trim());
        c = x;
    }
    else
        c += x;
} if (c.trim())
    out.push(c.trim()); return out; }

// Speaks using the server's Google or Azure voice.
async function speakWithCloudVoice(t) {
    stopSpeech();
    const me = speechRunId, e = pick('#pipc');
    let played = false;
    try {
        for (const part of splitIntoChunks(t, 280)) {
            if (me != speechRunId)
                return;
            const r = await fetch(API_BASE + '/api/tts', { method: 'POST', headers: authHeaders(), body: JSON.stringify({ text: part, lang: currentLanguage()[0] }) });
            if (!r.ok) {
                const d = await r.json().catch(() => ({}));
                cloudVoiceError = d.detail || 'the voice service is not responding';
                throw new Error('tts');
            }
            cloudVoiceError = '';
            const url = URL.createObjectURL(await r.blob());
            if (me != speechRunId)
                return;
            e && e.classList.add('talk');
            await new Promise((done, fail) => { const a = new Audio(url); a.playbackRate = preference('speed', 1); buddyState.audio = a; a.onended = done; a.onerror = fail; a.play().catch(fail); });
            played = true;
            URL.revokeObjectURL(url);
        }
    }
    catch (x) {
        if (x && x.name == 'NotAllowedError')
            cloudVoiceError = 'the browser blocked sound. Tap the page once, then press Test voice';
        renderChatPanel();
        if (me == speechRunId && !played)
            speakWithBrowserVoice(t);
    }
    finally {
        if (me == speechRunId && e)
            e.classList.remove('talk');
    }
}

const VOICE_SAMPLES = ['Hello! I am your study buddy.', 'नमस्ते! मैं तुम्हारा स्टडी दोस्त हूँ।', 'Namaste! Main tumhara study dost hoon.', 'नमस्कार! मी तुमचा अभ्यासाचा मित्र आहे.', 'নমস্কার! আমি তোমার পড়ার বন্ধু।', 'வணக்கம்! நான் உன் படிப்பு நண்பன்.', 'నమస్కారం! నేను నీ చదువు స్నేహితుడిని.', 'નમસ્તે! હું તમારો અભ્યાસ મિત્ર છું.', 'ನಮಸ್ಕಾರ! ನಾನು ನಿನ್ನ ಓದಿನ ಸ್ನೇಹಿತ.', 'നമസ്കാരം! ഞാൻ നിന്റെ പഠന കൂട്ടുകാരനാണ്.', 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ ਪੜ੍ਹਾਈ ਦਾ ਦੋਸਤ ਹਾਂ।', 'ନମସ୍କାର! ମୁଁ ତୁମର ପଢ଼ା ସାଙ୍ଗ।'];

// Plays a sample sentence so the student can check the voice.
function testVoice() { buddyState.voice = true; cloudVoiceError = ''; stopSpeech(); speakAloud(VOICE_SAMPLES[(appState.p && appState.p.lang) || 0]); setTimeout(renderChatPanel, 2500); }

// The line that tells which voice is in use, or why none is.
function voiceStatusText() {
    const name = currentLanguage()[1].split(' (')[0];
    if (!buddyState.voice)
        return 'Voice is off.';
    if (serverOnline && cloudVoiceReady && sessionToken)
        return cloudVoiceError ? 'Cloud voice problem (' + cloudVoiceError + '). Using this device voice instead.' : 'Voice: cloud voice, ' + name;
    try {
        const has = speechSynthesis.getVoices().some(x => x.lang.replace('_', '-').toLowerCase().startsWith(currentLanguage()[0].slice(0, 2).toLowerCase()));
        return has ? 'Voice: this device, ' + name : 'No ' + name + ' voice on this device, so text only. Add a Google or Azure voice key on the server to hear every language.';
    }
    catch (e) {
        return 'Voice is not supported in this browser.';
    }
}

// Reads text aloud.
function readOutLoud(t) { speakAloud(t); }
