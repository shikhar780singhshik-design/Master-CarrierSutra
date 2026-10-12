/**
 * server/voices.js
 * Turning the buddy's replies into speech with Google, Azure or the test voice.
 */
const { AZURE_KEY, AZURE_REGION, FREE_TEST_VOICE, GOOGLE_TTS_KEY } = require('./config');

const GOOGLE_VOICES = { 'hi-IN': 'hi-IN-Neural2-A', 'en-IN': 'en-IN-Neural2-A' };

const AZURE_VOICES = {
  'en-IN': 'en-IN-NeerjaNeural', 'hi-IN': 'hi-IN-SwaraNeural', 'mr-IN': 'mr-IN-AarohiNeural', 'bn-IN': 'bn-IN-TanishaaNeural',
  'ta-IN': 'ta-IN-PallaviNeural', 'te-IN': 'te-IN-ShrutiNeural', 'gu-IN': 'gu-IN-DhwaniNeural', 'kn-IN': 'kn-IN-SapnaNeural',
  'ml-IN': 'ml-IN-SobhanaNeural', 'pa-IN': 'pa-IN-VaaniNeural', 'or-IN': 'or-IN-SubhasiniNeural',
};

const currentVoiceProblem = () => voiceProblem;

let voiceProblem = '';

 // the latest reason a voice failed, so you can fix it

async function googleSpeech(text, languageCode) {
  if (languageCode === 'or-IN') throw new Error('Google has no Odia voice (add an Azure key for Odia)');
  const call = (voice) => fetch('https://texttospeech.googleapis.com/v1/text:synthesize?key=' + encodeURIComponent(GOOGLE_TTS_KEY), {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ input: { text }, voice, audioConfig: { audioEncoding: 'MP3', speakingRate: 0.97 } }),
    signal: AbortSignal.timeout(20000),
  });
  let reply = await call({ languageCode, name: GOOGLE_VOICES[languageCode], ssmlGender: 'FEMALE' });
  if (!reply.ok) reply = await call({ languageCode, ssmlGender: 'FEMALE' }); // try again with no named voice
  if (!reply.ok) reply = await call({ languageCode });                        // last try: any voice Google has
  if (!reply.ok) {
    let why = '';
    try { why = (await reply.json()).error.message; } catch { /* no details */ }
    throw new Error('Google voice error ' + reply.status + (why ? ': ' + why.slice(0, 140) : ''));
  }
  return Buffer.from((await reply.json()).audioContent, 'base64');
}

async function azureSpeech(text, languageCode) {
  const escaped = text.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]));
  const ssml = "<speak version='1.0' xml:lang='" + languageCode + "'><voice name='" + AZURE_VOICES[languageCode] + "'>" + escaped + '</voice></speak>';
  const reply = await fetch('https://' + AZURE_REGION + '.tts.speech.microsoft.com/cognitiveservices/v1', {
    method: 'POST',
    headers: { 'Ocp-Apim-Subscription-Key': AZURE_KEY, 'Content-Type': 'application/ssml+xml', 'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3', 'User-Agent': 'master-carriersutra' },
    body: ssml,
    signal: AbortSignal.timeout(20000),
  });
  if (!reply.ok) throw new Error('Azure voice error ' + reply.status);
  return Buffer.from(await reply.arrayBuffer());
}

const FREE_CODES = { 'en-IN': 'en', 'hi-IN': 'hi', 'mr-IN': 'mr', 'bn-IN': 'bn', 'ta-IN': 'ta', 'te-IN': 'te', 'gu-IN': 'gu', 'kn-IN': 'kn', 'ml-IN': 'ml', 'pa-IN': 'pa', 'or-IN': 'or' };

async function freeTestSpeech(text, languageCode) {
  const pieces = (text.match(/[^.!?।]+[.!?।]*/g) || [text]).flatMap((s) => s.match(/.{1,180}(\s|$)/g) || [s]).filter((s) => s.trim());
  const buffers = [];
  for (const piece of pieces) {
    const url = 'https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=' + FREE_CODES[languageCode] + '&q=' + encodeURIComponent(piece.trim());
    const reply = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(15000) });
    if (!reply.ok) throw new Error('Free test voice error ' + reply.status);
    buffers.push(Buffer.from(await reply.arrayBuffer()));
  }
  return Buffer.concat(buffers);
}

const voiceProviders = [];

if (GOOGLE_TTS_KEY) voiceProviders.push({ name: 'Google', speak: googleSpeech });

if (AZURE_KEY && AZURE_REGION) voiceProviders.push({ name: 'Azure', speak: azureSpeech });

if (FREE_TEST_VOICE) voiceProviders.push({ name: 'Free test voice', speak: freeTestSpeech });

async function speak(text, languageCode) {
  for (const provider of voiceProviders) {
    try { const audio = await provider.speak(text, languageCode); voiceProblem = ''; return audio; }
    catch (error) { voiceProblem = provider.name + ': ' + error.message; console.warn('[voice]', voiceProblem); }
  }
  throw new Error(voiceProblem || 'No voice service is set up');
}

const SPEECH_LANGUAGES = ['en-IN', 'hi-IN', 'mr-IN', 'bn-IN', 'ta-IN', 'te-IN', 'gu-IN', 'kn-IN', 'ml-IN', 'pa-IN', 'or-IN'];

const GREETING = { 'en-IN': 'Hello', 'hi-IN': 'नमस्ते', 'mr-IN': 'नमस्कार', 'bn-IN': 'নমস্কার', 'ta-IN': 'வணக்கம்', 'te-IN': 'నమస్కారం', 'gu-IN': 'નમસ્તે', 'kn-IN': 'ನಮಸ್ಕಾರ', 'ml-IN': 'നമസ്കാരം', 'pa-IN': 'ਸਤ ਸ੍ਰੀ ਅਕਾਲ', 'or-IN': 'ନମସ୍କାର' };

// Run once at startup so you can see which languages really speak, and why any fail.
async function checkVoices() {
  console.log('Checking voices for every language...');
  for (const code of SPEECH_LANGUAGES) {
    try { await speak(GREETING[code], code); console.log('  ' + code + '  OK'); }
    catch (error) { console.log('  ' + code + '  FAILED  ' + error.message); }
  }
}

module.exports = { SPEECH_LANGUAGES, checkVoices, currentVoiceProblem, speak, voiceProviders };
