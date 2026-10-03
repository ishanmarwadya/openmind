/* Vivi: the animated buddy, plus voice in (speech recognition), voice out (speech synthesis)
   and the copy-cat recorder that plays your voice back in a squeaky buddy voice. */

window.Vivi = (() => {
  const COLORS = { violet: '#6A54C0', berry: '#C2417A', ocean: '#2F7FC1', leaf: '#2E9E6B', sun: '#E0A526', ink: '#2E2740' };
  const EARS = ['dog', 'cat', 'bunny', 'antenna'];
  const ACCESSORIES = ['none', 'bow', 'cap', 'glasses', 'crown', 'headphones'];

  function svg(b = {}, opts = {}) {
    const c = COLORS[b.color] || COLORS.violet;
    const body = '#F5EEE2';
    const ears = {
      dog: `<ellipse cx="34" cy="92" rx="18" ry="34" fill="${c}" transform="rotate(14 34 92)"/><ellipse cx="166" cy="92" rx="18" ry="34" fill="${c}" transform="rotate(-14 166 92)"/>`,
      cat: `<path d="M48 52 L58 14 L84 40 Z" fill="${c}"/><path d="M152 52 L142 14 L116 40 Z" fill="${c}"/>`,
      bunny: `<ellipse cx="72" cy="22" rx="13" ry="34" fill="${c}"/><ellipse cx="128" cy="22" rx="13" ry="34" fill="${c}"/><ellipse cx="72" cy="24" rx="6" ry="24" fill="#F7CFE0"/><ellipse cx="128" cy="24" rx="6" ry="24" fill="#F7CFE0"/>`,
      antenna: `<line x1="100" y1="34" x2="100" y2="10" stroke="${c}" stroke-width="5" stroke-linecap="round"/><circle class="v-bulb" cx="100" cy="9" r="8" fill="#B8A8FF"/>`
    }[b.ears || 'dog'];
    const acc = {
      none: '',
      bow: `<g transform="translate(140 34)"><path d="M0 0 L-16 -10 L-16 10 Z" fill="#E4577A"/><path d="M0 0 L16 -10 L16 10 Z" fill="#E4577A"/><circle r="5" fill="#C2417A"/></g>`,
      cap: `<path d="M44 52 Q100 0 156 52 Z" fill="${c}"/><rect x="96" y="44" width="78" height="9" rx="4" fill="${c}"/><circle cx="100" cy="20" r="5" fill="#F7CF6E"/>`,
      glasses: `<g stroke="#F7CF6E" stroke-width="4" fill="none"><circle cx="78" cy="88" r="17"/><circle cx="122" cy="88" r="17"/><line x1="95" y1="88" x2="105" y2="88"/></g>`,
      crown: `<path d="M66 40 L72 14 L86 30 L100 8 L114 30 L128 14 L134 40 Z" fill="#F7CF6E" stroke="#E0A526" stroke-width="3"/>`,
      headphones: `<path d="M38 92 Q38 26 100 26 Q162 26 162 92" stroke="${c}" stroke-width="9" fill="none"/><rect x="26" y="80" width="20" height="34" rx="8" fill="${c}"/><rect x="154" y="80" width="20" height="34" rx="8" fill="${c}"/>`
    }[b.accessory || 'none'];
    const size = opts.size || 220;
    return `<svg class="vivi-svg" viewBox="0 0 200 240" width="${size}" height="${size * 1.2}" role="img" aria-label="${b.name || 'Vivi'}, your buddy">
      <g class="v-bob">
        ${b.ears === 'antenna' || !b.ears ? '' : ''}${ears}
        <rect x="34" y="36" width="132" height="112" rx="52" fill="${body}"/>
        <rect x="52" y="56" width="96" height="70" rx="30" fill="#1E1A2E"/>
        <g class="v-eyes">
          <ellipse class="v-eye" cx="80" cy="86" rx="10" ry="12" fill="#B8A8FF"/>
          <ellipse class="v-eye" cx="120" cy="86" rx="10" ry="12" fill="#B8A8FF"/>
          <circle cx="83" cy="81" r="3" fill="#fff" opacity=".9"/><circle cx="123" cy="81" r="3" fill="#fff" opacity=".9"/>
        </g>
        <path class="v-mouth" d="M88 106 Q100 116 112 106" stroke="#B8A8FF" stroke-width="4" fill="none" stroke-linecap="round"/>
        <circle cx="64" cy="106" r="6" fill="#E4577A" opacity=".35"/><circle cx="136" cy="106" r="6" fill="#E4577A" opacity=".35"/>
        ${acc}
        <rect x="56" y="146" width="88" height="66" rx="32" fill="${body}"/>
        <circle cx="100" cy="176" r="17" fill="${c}"/>
        <path d="M100 160 A16 16 0 0 0 100 192 Z" fill="${c}"/><path d="M100 160 A16 16 0 0 1 100 192 Z" fill="#F7CF6E"/>
        <ellipse cx="46" cy="176" rx="13" ry="20" fill="${body}" transform="rotate(20 46 176)"/>
        <ellipse cx="154" cy="176" rx="13" ry="20" fill="${body}" transform="rotate(-20 154 176)"/>
        <ellipse cx="74" cy="216" rx="22" ry="14" fill="${c}"/><ellipse cx="126" cy="216" rx="22" ry="14" fill="${c}"/>
        <circle cx="74" cy="218" r="6" fill="#B8A8FF"/><circle cx="126" cy="218" r="6" fill="#B8A8FF"/>
      </g>
    </svg>`;
  }

  // ---------- animation ----------
  const MOUTHS = { rest: 'M88 106 Q100 116 112 106', open: 'M88 104 Q100 124 112 104 Q100 110 88 104', wide: 'M86 102 Q100 128 114 102 Q100 108 86 102', o: 'M94 104 Q100 120 106 104 Q100 98 94 104' };
  let talkTimer = null;
  const allMouths = () => document.querySelectorAll('.vivi-stage .v-mouth');
  const stages = () => document.querySelectorAll('.vivi-stage');
  function setMouth(k) { allMouths().forEach(m => m.setAttribute('d', MOUTHS[k])); }
  function startTalking() {
    stopTalking(); let i = 0; const seq = ['open', 'rest', 'wide', 'o', 'rest', 'open'];
    stages().forEach(s => s.classList.add('talking'));
    talkTimer = setInterval(() => setMouth(seq[i++ % seq.length]), 130);
  }
  function stopTalking() { clearInterval(talkTimer); talkTimer = null; setMouth('rest'); stages().forEach(s => s.classList.remove('talking')); }
  function mood(m) { stages().forEach(s => { s.dataset.mood = m; }); if (m) setTimeout(() => stages().forEach(s => { if (s.dataset.mood === m) s.dataset.mood = ''; }), 1800); }
  function blinkLoop() {
    document.querySelectorAll('.vivi-stage .v-eyes').forEach(e => { e.classList.add('blink'); setTimeout(() => e.classList.remove('blink'), 160); });
    setTimeout(blinkLoop, 2500 + Math.random() * 3000);
  }
  setTimeout(blinkLoop, 2000);

  // ---------- voice out ----------
  // 1) Premium: a neural Indian voice from /api/tts (Sarvam Bulbul or OpenAI), if the server has a key.
  // 2) Fallback: the best voice this device has, ranked by quality, spoken at a natural pitch.
  let voices = [], enabled = true, chosenName = '', premium = { on: false, provider: '' }, current = null;
  const loadVoices = () => { voices = window.speechSynthesis ? speechSynthesis.getVoices() : []; };
  if (window.speechSynthesis) { loadVoices(); speechSynthesis.onvoiceschanged = loadVoices; }
  const QUALITY = [/natural/i, /neural/i, /online/i, /enhanced/i, /premium/i, /google/i, /siri/i];
  const NICE = /(neerja|swara|veena|lekha|heera|kalpana|aditi|raveena|priya|isha|rishi|prabhat|madhur)/i;
  function score(v, lang) {
    const l = (v.lang || '').replace('_', '-').toLowerCase(); let s = 0;
    if (lang === 'hi') { if (l === 'hi-in') s += 60; else if (l === 'en-in') s += 35; else if (l.startsWith('en')) s += 10; else return -1; }
    else { if (l === 'en-in') s += 50; else if (l === 'en-gb') s += 32; else if (l === 'en-us') s += 28; else if (l.startsWith('en')) s += 20; else return -1; }
    QUALITY.forEach((r, i) => { if (r.test(v.name)) s += 40 - i * 4; });
    if (NICE.test(v.name)) s += 12;
    if (/compact|espeak|robot|whisper|zarvox|bad news|bells|boing|bubbles|cellos|trinoids|organ|jester|albert|fred|junior|ralph/i.test(v.name)) s -= 80;
    if (v.localService === false) s += 5;   // cloud voices in Chrome/Edge usually sound better
    if (/^microsoft /i.test(v.name) && !/online|natural/i.test(v.name)) s -= 15;   // older Windows desktop voices sound flat
    return s;
  }
  function pickVoice(lang) {
    if (chosenName) { const v = voices.find(v => v.name === chosenName); if (v) return v; }
    let best = null, bs = -1; voices.forEach(v => { const s = score(v, lang); if (s > bs) { bs = s; best = v; } });
    return best;
  }
  const clean = s => s.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/gu, '').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
  const sentences = s => (s.match(/[^.!?।]+[.!?।]*\s*/g) || [s]).map(x => x.trim()).filter(Boolean);
  const cache = new Map();

  async function initPremium() {
    try { const r = await fetch('/api/tts'); if (r.ok) { const d = await r.json(); premium = { on: !!d.configured, provider: d.provider || '' }; } } catch (e) { premium = { on: false, provider: '' }; }
    return premium;
  }
  initPremium();

  function playAudio(src, child) {
    return new Promise(res => {
      const a = new Audio(src); let settled = false;
      const finish = ok => { if (settled) return; settled = true; if (current && current.a === a) current = null; if (!child) stopTalking(); res(ok); };
      current = { a, stop: () => { try { a.pause(); } catch (e) { } finish(true); } };
      a.onplay = () => { if (!child) startTalking(); };
      a.onended = () => finish(true); a.onerror = () => finish(false);
      a.play().catch(() => finish(false));
    });
  }
  async function speakPremium(text, o) {
    const key = (o.child ? 'c' : 'v') + (o.lang || 'en') + text;
    let src = cache.get(key);
    if (!src) {
      const r = await fetch('/api/tts', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text, lang: o.lang || 'en', role: o.child ? 'child' : 'vivi' }) });
      if (!r.ok) return false;
      const d = await r.json(); if (!d.audio) return false;
      src = `data:${d.mime || 'audio/wav'};base64,${d.audio}`; cache.set(key, src);
    }
    return playAudio(src, o.child);
  }
  function speakBrowser(text, o) {
    return new Promise(res => {
      if (!window.speechSynthesis) { if (!o.child) { startTalking(); setTimeout(() => { stopTalking(); res(); }, Math.min(4000, 45 * text.length)); } else res(); return; }
      speechSynthesis.cancel(); try { speechSynthesis.resume(); } catch (e) { }
      const v = pickVoice(o.lang || 'en'); const parts = sentences(text);
      let i = 0, finished = false;
      const done = () => { if (finished) return; finished = true; if (!o.child) stopTalking(); res(); };
      const next = () => {
        if (i >= parts.length || finished) return done();
        const u = new SpeechSynthesisUtterance(parts[i++]);
        if (v) { u.voice = v; u.lang = v.lang; } else u.lang = o.lang === 'hi' ? 'hi-IN' : 'en-IN';
        u.pitch = o.child ? 1.3 : 1.05; u.rate = o.child ? 1.05 : 0.96; u.volume = 1;
        u.onstart = () => { if (!o.child) startTalking(); };
        u.onend = next; u.onerror = next;
        speechSynthesis.speak(u);
      };
      setTimeout(done, 2500 + 95 * text.length);   // safety net if a browser never fires onend
      next();
    });
  }
  async function speak(text, o = {}) {
    if (!text) return;
    stopSpeaking();
    const t = clean(text); if (!t) return;
    if (!enabled) return;
    if (premium.on && chosenName !== '__browser__') { try { if (await speakPremium(t, o)) return; } catch (e) { } }
    return speakBrowser(t, o);
  }
  function stopSpeaking() {
    if (current) { const c = current; current = null; c.stop(); }
    if (window.speechSynthesis) speechSynthesis.cancel();
    stopTalking();
  }
  function voiceList() { return voices.filter(v => score(v, 'en') >= 0 || score(v, 'hi') >= 0).sort((a, b) => score(b, 'en') - score(a, 'en')).map(v => ({ name: v.name, lang: v.lang })); }

  // ---------- voice in ----------
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  const canListen = !!SR;
  let rec = null;
  function listen({ lang = 'en', onInterim, onFinal, onEnd, continuous = false } = {}) {
    if (!SR) return false;
    stopListening();
    rec = new SR(); rec.lang = lang === 'hi' ? 'hi-IN' : 'en-IN'; rec.interimResults = true; rec.continuous = continuous; rec.maxAlternatives = 1;
    let finalText = '';
    rec.onresult = e => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]; if (r.isFinal) finalText += r[0].transcript + ' '; else interim += r[0].transcript;
      }
      onInterim && onInterim((finalText + interim).trim());
    };
    rec.onerror = () => {};
    rec.onend = () => { stages().forEach(s => s.classList.remove('listening')); const t = finalText.trim(); if (t && onFinal) onFinal(t); onEnd && onEnd(t); rec = null; };
    stages().forEach(s => s.classList.add('listening'));
    try { rec.start(); } catch (e) { return false; }
    return true;
  }
  function stopListening() { if (rec) { try { rec.stop(); } catch (e) {} } }

  // ---------- copy-cat (Talking Tom style) ----------
  let mediaRec = null, chunks = [];
  async function startCopycat() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    chunks = []; mediaRec = new MediaRecorder(stream);
    mediaRec.ondataavailable = e => e.data.size && chunks.push(e.data);
    mediaRec.start(); stages().forEach(s => s.classList.add('listening'));
    return mediaRec;
  }
  function stopCopycat() {
    return new Promise(res => {
      if (!mediaRec) return res();
      mediaRec.onstop = () => {
        mediaRec.stream.getTracks().forEach(t => t.stop());
        stages().forEach(s => s.classList.remove('listening'));
        const blob = new Blob(chunks, { type: mediaRec.mimeType || 'audio/webm' });
        const a = new Audio(URL.createObjectURL(blob));
        a.preservesPitch = false; a.mozPreservesPitch = false; a.webkitPreservesPitch = false;
        a.playbackRate = 1.6;
        a.onplay = startTalking; a.onended = () => { stopTalking(); res(); };
        a.play().catch(() => { stopTalking(); res(); });
        mediaRec = null;
      };
      mediaRec.stop();
    });
  }

  return { svg, COLORS, EARS, ACCESSORIES, speak, stopSpeaking, listen, stopListening, canListen, startCopycat, stopCopycat, mood, startTalking, stopTalking,
    setVoice: v => { enabled = v; if (!v) stopSpeaking(); }, voiceOn: () => enabled,
    voiceList, setVoiceName: n => { chosenName = n || ''; }, premiumStatus: () => premium, initPremium,
    currentVoiceName: lang => { if (premium.on && chosenName !== '__browser__') return premium.provider + ' natural voice'; const v = pickVoice(lang || 'en'); return v ? v.name : 'default'; } };
})();
