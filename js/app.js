/* OpenMind prototype app. Plain JavaScript, no build step.
   Data is stored only in this browser (localStorage), which is what a parent would expect from an offline-first product. */
(() => {
  const C = window.OM_CONTENT, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const KEY = 'openmind.v1', DAY = 864e5, today = () => new Date().toISOString().slice(0, 10);
  const L = (o) => (o && (o[S.lang] || o.en)) || '';
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const DEF = () => ({
    profile: null, lang: 'en',
    buddy: { name: 'Vivi', color: 'violet', ears: 'dog', accessory: 'none' },
    stats: { questions: 0, childWords: 0, viviWords: 0, minutes: {}, daily: {}, explained: 0, games: {}, skills: { think: 0, speak: 0, learn: 0, connect: 0 }, days: [] },
    memory: {}, jar: [], log: [], moods: [],
    parent: { limit: 30, liveAI: false, voice: true, camera: true, extra: 0, bedtime: false, bedtimeAt: '20:30', weeklyCard: true, alerts: true, backup: false, notify: [], packs: ['chess'], consentAt: null },
    devices: { vivi: { battery: 75, on: true, fw: '1.4.2' }, scribe: { battery: 92, on: true, fw: '2.1.0' }, shutter: true, lastSync: null, owned: ['vivi', 'scribe'] },
    ui: { theme: 'light', view: 'desktop' }
  });
  let S;
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}'); const d = DEF();
    S = Object.assign(d, saved);
    ['stats', 'parent', 'devices', 'ui', 'buddy'].forEach(k => { S[k] = Object.assign(DEF()[k], saved[k] || {}); });
  } catch (e) { S = DEF(); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } };
  const T = k => (C.UI[S.lang] && C.UI[S.lang][k]) || C.UI.en[k];
  const skill = (k, n = 1) => { S.stats.skills[k] = (S.stats.skills[k] || 0) + n; save(); };
  const words = s => (s.trim().match(/\S+/g) || []).length;
  function logLine(who, text) {
    S.log.push({ t: Date.now(), who, text }); if (S.log.length > 200) S.log.shift();
    const dd = S.stats.daily[today()] = S.stats.daily[today()] || { q: 0, cw: 0, vw: 0 };
    if (who === 'child') { S.stats.childWords += words(text); dd.cw += words(text); if (Engine.isQuestion(text)) { S.stats.questions++; dd.q++; } }
    else { S.stats.viviWords += words(text); dd.vw += words(text); }
    if (!S.stats.days.includes(today())) S.stats.days.push(today());
    save();
  }
  Vivi.setVoice(S.parent.voice); Vivi.setVoiceName(S.parent.voiceName || '');

  // ---------- router ----------
  const app = $('#app');
  let cleanup = [];
  const onLeave = f => cleanup.push(f);
  function go(path) { if (location.hash === path) route(); else location.hash = path; }
  window.addEventListener('hashchange', route);
  function route() {
    cleanup.forEach(f => { try { f(); } catch (e) { } }); cleanup = []; Vivi.stopSpeaking(); Vivi.stopListening();
    const h = location.hash.replace(/^#\/?/, '') || '';
    const [area, view, sub] = h.split('/');
    document.body.dataset.area = area || 'start';
    renderGbar(area);
    if (document.body.classList.contains('phone-view')) app.scrollTop = 0; else window.scrollTo(0, 0);
    if (!area) return startView();
    if (area === 'parent') return parentView(view || 'home');
    if (area === 'child') {
      if (!S.profile) return onboard();
      if (overLimit()) return limitView();
      const v = { talk: talkView, learn: learnView, play: playView, speak: speakView, feel: feelView, revise: reviseView, buddy: buddyView }[view];
      return v ? v(sub) : homeView();
    }
    startView();
  }

  // ---------- shared pieces ----------
  const stage = (cls = '', size = 220) => `<div class="vivi-stage ${cls}" tabindex="0" aria-label="Tap ${esc(S.buddy.name)}">${Vivi.svg(S.buddy, { size })}</div>`;
  function topbar(title, back = '#/child') {
    const left = minutesLeft();
    return `<header class="topbar">
      <a class="icon-btn" href="${back}" aria-label="${T('back')}">←</a>
      <h1>${title}</h1>
      <div class="tb-right">
        <span class="time-left" title="Minutes left today">${left} min left</span>
        <button class="icon-btn" id="voice" aria-label="Voice on or off">${S.parent.voice ? '🔊' : '🔇'}</button>
      </div></header>`;
  }
  function wireTop() {
    const l = $('#lang'); if (l) l.onclick = () => { S.lang = S.lang === 'en' ? 'hi' : 'en'; save(); route(); };
    const v = $('#voice'); if (v) v.onclick = () => { S.parent.voice = !S.parent.voice; Vivi.setVoice(S.parent.voice); save(); v.textContent = S.parent.voice ? '🔊' : '🔇'; };
  }
  function tickle(st) {
    if (!st) return;
    st.onclick = () => {
      const lines = S.lang === 'hi' ? ['Hee hee! Gudgudi hoti hai!', 'Arre! Mujhe sawaal poochho!', 'Yay, high five!'] : ['Hee hee! That tickles!', 'Ooh! Ask me a question!', 'Boop! High five!'];
      st.classList.remove('wiggle'); void st.offsetWidth; st.classList.add('wiggle');
      Vivi.speak(lines[Math.floor(Math.random() * lines.length)], { lang: S.lang });
    };
  }
  // mic + text input row used across rooms
  function inputRow(id, placeholder) {
    return `<div class="input-row" id="${id}">
      <button class="mic" aria-label="Speak">🎙️</button>
      <input class="input" placeholder="${esc(placeholder || T('typeHere'))}" aria-label="Your answer">
      <button class="btn primary send">${T('send')}</button></div>`;
  }
  function wireInput(id, onSubmit) {
    const row = $('#' + id), inp = $('input', row), mic = $('.mic', row);
    const submit = () => { const v = inp.value.trim(); if (!v) return; inp.value = ''; onSubmit(v); };
    $('.send', row).onclick = submit; inp.onkeydown = e => { if (e.key === 'Enter') submit(); };
    mic.onclick = () => {
      if (!Vivi.canListen) { toast('Voice input works in Chrome or Edge. You can type instead.'); return; }
      if (mic.classList.contains('on')) { Vivi.stopListening(); return; }
      Vivi.stopSpeaking(); mic.classList.add('on');
      Vivi.listen({ lang: S.lang, onInterim: t => inp.value = t, onFinal: t => { inp.value = ''; onSubmit(t); }, onEnd: () => mic.classList.remove('on') });
    };
    return { focus: () => inp.focus(), row };
  }
  function toast(msg) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 3200); }

  // ---------- time limits (sessions that end) ----------
  const usedToday = () => S.stats.minutes[today()] || 0;
  const minutesLeft = () => Math.max(0, S.parent.limit + (S.parent.extraDay === today() ? S.parent.extra : 0) - usedToday());
  const overLimit = () => minutesLeft() <= 0;
  setInterval(() => {
    if (document.body.dataset.area !== 'child' || document.hidden) return;
    S.stats.minutes[today()] = usedToday() + 1; save();
    const tl = $('.time-left'); if (tl) tl.textContent = minutesLeft() + ' min left';
    if (overLimit()) route();
  }, 60000);
  function limitView() {
    app.innerHTML = `<main class="center-page">${stage('', 200)}
      <h2>That's today's OpenMind time!</h2>
      <p class="lead">Go and tell someone at home one thing you learned today. See you tomorrow, ${esc(S.profile.name)}!</p>
      <div class="row"><a class="btn" href="#/">Done</a><button class="btn ghost" id="more">Grown-up: add 15 minutes</button></div></main>`;
    Vivi.speak(`That's today's time! Go tell someone at home one thing you learned.`, { lang: 'en' });
    $('#more').onclick = () => gate(() => { S.parent.extra = (S.parent.extraDay === today() ? S.parent.extra : 0) + 15; S.parent.extraDay = today(); save(); go('#/child'); });
  }

  // ---------- start: who is using it ----------
  function startView() {
    app.innerHTML = `<main class="start">
      <div class="start-hero">${stage('big', 260)}
        <div><p class="brand">OpenMind</p><h1 class="start-title">${S.lang === 'hi' ? 'Seekhna jo sunta hai, dekhta hai, aur sawaal poochhta hai.' : 'Learning that listens, looks and asks back.'}</h1></div></div>
      <h2 class="who">${T('who')}</h2>
      <div class="role-row">
        <a class="role child" href="#/child"><span class="role-emoji">🧒</span><b>${T('child')}</b><small>${S.lang === 'hi' ? 'Vivi se baat karo, khelo, seekho' : 'Talk to Vivi, play and learn'}</small></a>
        <button class="role parent" id="toParent"><span class="role-emoji">🧑‍💼</span><b>${T('parent')}</b><small>${S.lang === 'hi' ? 'Progress dekho, settings badlo' : 'See progress and set limits'}</small></button>
      </div>
    </main>`;
    $('#toParent').onclick = () => gate(() => go('#/parent'));
    tickle($('.vivi-stage'));
  }

  function gate(ok) {
    const a = 6 + Math.floor(Math.random() * 4), b = 6 + Math.floor(Math.random() * 4);
    const m = document.createElement('div'); m.className = 'modal';
    m.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="Grown-ups only"><h3>Grown-ups only</h3><p>What is ${a} × ${b}?</p>
      <input class="input" id="gateIn" type="text" inputmode="numeric" autocomplete="off" aria-label="Answer"><div class="row"><button class="btn ghost" id="gx">Cancel</button><button class="btn ghost" id="gskip">Skip for now</button><button class="btn primary" id="go">Continue</button></div></div>`;
    document.body.appendChild(m);
    const inp = $('#gateIn', m); inp.focus();
    const tryIt = () => { if (+inp.value === a * b) { m.remove(); ok(); } else { inp.value = ''; inp.placeholder = 'Try again'; } };
    $('#go', m).onclick = tryIt; inp.onkeydown = e => { if (e.key === 'Enter') tryIt(); };
    $('#gx', m).onclick = () => m.remove(); $('#gskip', m).onclick = () => { m.remove(); ok(); };
  }

  // ---------- onboarding ----------
  function onboard() {
    let pick = { ...S.buddy };
    app.innerHTML = `<main class="onboard">
      <div class="ob-preview">${stage('', 200)}</div>
      <div class="ob-form">
        <h2>Hi! I'm your new thinking buddy.</h2>
        <label>What's your name?<input class="input" id="nm" placeholder="Your name"></label>
        <div class="row"><label>Age<select class="input" id="ag">${[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(a => `<option ${a === 7 ? 'selected' : ''}>${a}</option>`).join('')}</select></label>
        <label>Class<select class="input" id="cl">${['LKG', 'UKG', 1, 2, 3, 4, 5, 6, 7, 8].map(c => `<option ${c === 3 ? 'selected' : ''}>${c}</option>`).join('')}</select></label>
        <label>Language<select class="input" id="lg"><option value="en">English</option><option value="hi" ${S.lang === 'hi' ? 'selected' : ''}>Hindi + English</option></select></label></div>
        <p class="label">Pick my colour</p><div class="swatches">${Object.entries(Vivi.COLORS).map(([k, v]) => `<button class="sw ${pick.color === k ? 'on' : ''}" data-c="${k}" style="background:${v}" aria-label="${k}"></button>`).join('')}</div>
        <button class="btn primary big" id="start">Let's go</button>
      </div></main>`;
    $$('.sw').forEach(b => b.onclick = () => { pick.color = b.dataset.c; $$('.sw').forEach(x => x.classList.toggle('on', x === b)); $('.ob-preview').innerHTML = `<div class="vivi-stage">${Vivi.svg(pick, { size: 200 })}</div>`; });
    $('#start').onclick = () => {
      const name = $('#nm').value.trim() || 'Friend';
      S.profile = { name, age: +$('#ag').value, cls: $('#cl').value }; S.lang = $('#lg').value; S.buddy = pick; save(); go('#/child');
    };
  }

  // ---------- child home ----------
  function homeView() {
    const due = dueTopics().length;
    const greet = S.lang === 'hi' ? `Namaste ${S.profile.name}! Aaj kya sochein?` : `Hi ${S.profile.name}! What shall we think about today?`;
    app.innerHTML = `${topbar(`${esc(S.buddy.name)} + ${esc(S.profile.name)}`, '#/')}
    <main class="home">
      <section class="home-stage">${stage('', 240)}<p class="bubble">${esc(greet)}</p></section>
      <section class="tiles">
        <a class="tile t-talk" href="#/child/talk"><span>💬</span><b>${T('talk')} ${esc(S.buddy.name)}</b><small>Ask anything. Show me things on camera.</small></a>
        <a class="tile t-learn" href="#/child/learn"><span>📚</span><b>${T('learn')}</b><small>Your class topics, one question at a time</small></a>
        <a class="tile t-play" href="#/child/play"><span>🧩</span><b>${T('play')}</b><small>Brain games</small></a>
        <a class="tile t-speak" href="#/child/speak"><span>🎤</span><b>${T('speak')}</b><small>Debate, stories, speeches</small></a>
        <a class="tile t-feel" href="#/child/feel"><span>💛</span><b>${T('feel')}</b><small>How are you today?</small></a>
        <a class="tile t-revise" href="#/child/revise"><span>🔁</span><b>${T('revise')}</b><small>${due ? due + ' topic' + (due > 1 ? 's' : '') + ' to revisit' : 'All caught up'}</small>${due ? `<i class="badge">${due}</i>` : ''}</a>
        <a class="tile t-buddy" href="#/child/buddy"><span>🤖</span><b>${T('buddy')}</b><small>Dress me up, make me copy you</small></a>
        <a class="tile t-chess" href="#/child/play/chess"><span>♞</span><b>Chess coach</b><small>Find the best move</small></a>
      </section></main>`;
    wireTop(); tickle($('.vivi-stage'));
    setTimeout(() => Vivi.speak(greet, { lang: S.lang }), 400);
  }

  // ---------- talk ----------
  let history = [];
  let pending = null;
  let chipsHook = () => {};
  function talkView() {
    if (!pending) { Engine.reset(); history = []; }
    app.innerHTML = `${topbar(`${T('talk')} ${esc(S.buddy.name)}`)}
    <main class="talk">
      <section class="talk-stage">
        ${stage('', 230)}
        <div class="cam" hidden><video id="cam" playsinline muted autoplay></video><span class="cam-label">You</span></div>
        <div class="stage-actions">
          <button class="btn" id="camBtn">📷 Video call</button>
          <button class="btn" id="showBtn" hidden>👀 Show ${esc(S.buddy.name)}</button>
          <button class="btn ghost" id="demoBtn">▶ Hindi demo</button>
          <button class="btn ghost" id="newBtn">↺ New conversation</button>
        </div>
      </section>
      <section class="chat">
        <div class="msgs" id="msgs" aria-live="polite"></div>
        <div class="suggest"><span class="suggest-label" id="sugLabel">Try saying</span><div class="chips" id="chips"></div></div>
        ${inputRow('talkIn')}
      </section></main>`;
    wireTop(); tickle($('.vivi-stage'));
    const msgs = $('#msgs');
    const add = (who, text) => {
      const d = document.createElement('div'); d.className = 'msg ' + who; d.innerHTML = `<p>${esc(text)}</p>`; msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
      history.push({ role: who === 'child' ? 'user' : 'assistant', content: text });
    };
    let busy = false;
    async function send(text, opts = {}) {
      if (busy && !opts.force) return; busy = true;
      $$('#chips .chip').forEach(c => c.disabled = true);
      add('child', text); logLine('child', text);
      if (opts.speakChild) await Vivi.speak(text, { lang: S.lang, child: true });
      const typing = document.createElement('div'); typing.className = 'msg vivi typing'; typing.innerHTML = '<p><i></i><i></i><i></i></p>'; msgs.appendChild(typing); msgs.scrollTop = msgs.scrollHeight;
      const r = await Engine.reply(text, { lang: S.lang, childName: S.profile.name, buddyName: S.buddy.name, age: S.profile.age, liveAI: S.parent.liveAI, history });
      await new Promise(z => setTimeout(z, 500)); typing.remove();
      add('vivi', r.text); logLine('vivi', r.text); Vivi.mood(r.mood);
      handleEvent(r.event); chips();
      await Vivi.speak(r.text, { lang: S.lang });
      busy = false;
    }
    wireInput('talkIn', t => send(t));
    function chips() {
      const box = $('#chips'); if (!box) return;
      const list = Engine.suggestions(S.lang); const mid = !!(Engine.state().topic || Engine.state().teach || Engine.state().riddle || Engine.state().object || Engine.state().awaitObject || Engine.state().unknownTurns);
      $('#sugLabel').textContent = mid ? 'Tap a reply' : 'Start a conversation';
      box.innerHTML = list.map(c => `<button class="chip">${esc(c)}</button>`).join('');
      $$('.chip', box).forEach(c => c.onclick = () => { if (!busy) send(c.textContent); });
    }
    chipsHook = chips; chips();
    // camera
    let stream = null;
    $('#camBtn').onclick = async () => {
      if (stream) { stream.getTracks().forEach(t => t.stop()); stream = null; $('.cam').hidden = true; $('#showBtn').hidden = true; $('#camBtn').textContent = '📷 Video call'; return; }
      if (!S.parent.camera) return toast('A grown-up has turned the camera off in settings.');
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
        $('#cam').srcObject = stream; $('.cam').hidden = false; $('#showBtn').hidden = false; $('#camBtn').textContent = '✕ End call';
        Vivi.speak(S.lang === 'hi' ? 'Hello! Main tumhe dekh sakta hoon. Mujhe kuch dikhao!' : 'Hello! I can see you now. Show me something!', { lang: S.lang });
      } catch (e) { toast('Camera blocked. Allow camera access in your browser to video-call ' + S.buddy.name + '.'); }
    };
    onLeave(() => stream && stream.getTracks().forEach(t => t.stop()));
    $('#showBtn').onclick = () => {
      const v = $('#cam'), c = document.createElement('canvas'), w = 64, h = 48; c.width = w; c.height = h;
      const x = c.getContext('2d'); x.drawImage(v, v.videoWidth * .3, v.videoHeight * .3, v.videoWidth * .4, v.videoHeight * .4, 0, 0, w, h);
      const d = x.getImageData(0, 0, w, h).data; let r = 0, g = 0, b = 0; for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; }
      const n = d.length / 4; const res = Engine.seeFrame([r / n, g / n, b / n], S.lang);
      add('vivi', res.text); logLine('vivi', res.text); Vivi.mood('curious'); chips(); Vivi.speak(res.text, { lang: S.lang }); skill('learn');
    };
    $('#newBtn').onclick = () => { Vivi.stopSpeaking(); Engine.reset(); msgs.innerHTML = ''; history = []; add('vivi', S.lang === 'hi' ? 'Chalo kuch naya sochte hain! Kya poochna hai?' : "Let's think about something new! What would you like to ask?"); chips(); };
    // scripted demo for presentations (Hindi, matches the video script)
    $('#demoBtn').onclick = async () => {
      if (busy) return; Engine.reset(); msgs.innerHTML = ''; const prev = S.lang; S.lang = 'hi';
      const lines = ['Vivi, aasmaan neela kyun hota hai?', 'Orange... ya laal?', 'Haan, shayad sooraj ki roshni se?', 'Har jagah, aasmaan mein?', 'Sooraj ki roshni mein saare rang hote hain, hawa neela rang bikhar deti hai, aur woh hamari aankhon tak aata hai.'];
      $('#demoBtn').disabled = true;
      for (const l of lines) { if (!document.body.contains(msgs)) break; await send(l, { speakChild: true, force: true }); await new Promise(z => setTimeout(z, 600)); }
      S.lang = prev; save(); const b = $('#demoBtn'); if (b) b.disabled = false; chips();
    };
    // pending action from Learn
    if (pending) {
      const p = pending; pending = null; Engine.reset();
      const topic = C.TOPICS.find(t => t.id === p.id);
      const r = p.type === 'teach' ? Engine.startTeach(topic, S.lang) : Engine.startTopic(topic, S.lang);
      setTimeout(() => { add('vivi', r.text); logLine('vivi', r.text); chips(); Vivi.speak(r.text, { lang: S.lang }); }, 300);
    } else if (!msgs.children.length) {
      const hi = S.lang === 'hi' ? `Poochho jo bhi mann mein hai, ${S.profile.name}! Main jawab nahi dunga, hum saath mein dhoondhenge.` : `Ask me anything, ${S.profile.name}! I won't just give you answers. We'll figure them out together.`;
      add('vivi', hi);
    }
  }
  function handleEvent(ev) {
    if (!ev) return;
    if (ev.type === 'step') skill('think');
    if (ev.type === 'explained') {
      S.stats.explained = (S.stats.explained || 0) + 1;
      skill('speak', 2); skill('learn', ev.stars);
      const m = S.memory[ev.topic] || { level: 0 };
      m.stars = Math.max(m.stars || 0, ev.stars); m.last = Date.now(); m.missed = ev.missed;
      m.next = Date.now() + (ev.stars >= 2 ? 3 : 1) * DAY; S.memory[ev.topic] = m; save();
      toast(ev.stars >= 2 ? '⭐ Saved! ' + S.buddy.name + ' will ask you again in 3 days.' : 'Saved. We\'ll try this again tomorrow.');
    }
    if (ev.type === 'jar') { S.jar.unshift({ q: ev.q, t: Date.now() }); S.jar = S.jar.slice(0, 30); save(); toast('🫙 Added to your Curiosity Jar'); }
    if (ev.type === 'riddle' && ev.ok) skill('think');
  }

  // ---------- learn ----------
  function learnView() {
    let cls = 'all', subj = 'all';
    app.innerHTML = `${topbar(T('learn'))}<main class="learn">
      <p class="lead">Pick a topic from your class. ${esc(S.buddy.name)} will ask you questions until you can explain it yourself. Or flip it, and teach ${esc(S.buddy.name)}!</p>
      <div class="filters"><div class="chips" id="fc">${['all', 3, 4, 5].map(c => `<button class="chip ${c === 'all' ? 'on' : ''}" data-c="${c}">${c === 'all' ? 'All classes' : 'Class ' + c}</button>`).join('')}</div>
      <div class="chips" id="fs">${['all', 'Science', 'EVS', 'Maths', 'English'].map(c => `<button class="chip ${c === 'all' ? 'on' : ''}" data-s="${c}">${c === 'all' ? 'All subjects' : c}</button>`).join('')}</div></div>
      <div class="topic-grid" id="tg"></div></main>`;
    wireTop();
    const draw = () => {
      $('#tg').innerHTML = C.TOPICS.filter(t => (cls === 'all' || t.classes.includes(+cls)) && (subj === 'all' || t.subject === subj)).map(t => {
        const m = S.memory[t.id]; const stars = m ? '★'.repeat(m.stars || 0) + '☆'.repeat(3 - (m.stars || 0)) : '☆☆☆';
        return `<article class="topic"><span class="t-icon">${t.icon}</span><div><h3>${esc(L(t.title))}</h3><p class="meta">${t.subject}, Class ${t.classes.join(', ')} <span class="stars" aria-label="${m ? m.stars : 0} stars">${stars}</span></p></div>
          <div class="row"><button class="btn primary" data-go="${t.id}">Explore</button><button class="btn" data-teach="${t.id}">Teach ${esc(S.buddy.name)}</button></div></article>`;
      }).join('');
      $$('[data-go]').forEach(b => b.onclick = () => { pending = { type: 'topic', id: b.dataset.go }; go('#/child/talk'); });
      $$('[data-teach]').forEach(b => b.onclick = () => { pending = { type: 'teach', id: b.dataset.teach }; go('#/child/talk'); });
    };
    $$('#fc .chip').forEach(b => b.onclick = () => { cls = b.dataset.c; $$('#fc .chip').forEach(x => x.classList.toggle('on', x === b)); draw(); });
    $$('#fs .chip').forEach(b => b.onclick = () => { subj = b.dataset.s; $$('#fs .chip').forEach(x => x.classList.toggle('on', x === b)); draw(); });
    draw();
  }

  // ---------- play ----------
  function playView(id) {
    if (id) return gameView(id);
    const cats = ['All', 'Memory', 'Focus', 'Logic', 'Plan', 'Numbers'];
    app.innerHTML = `${topbar(T('play'))}<main class="play"><p class="lead">Each game trains one thinking skill. When you finish, ${esc(S.buddy.name)} will ask how you did it.</p>
      <div class="chips" id="gc">${cats.map(c => `<button class="chip ${c === 'All' ? 'on' : ''}" data-c="${c}">${c === 'Plan' ? 'Planning' : c}</button>`).join('')}</div>
      <div class="game-grid" id="gg"></div></main>`;
    wireTop();
    const draw = cat => { $('#gg').innerHTML = Games.LIST.filter(g => cat === 'All' || g.cat === cat).map(g => { const s = S.stats.games[g.id]; return `<a class="game" href="#/child/play/${g.id}"><span>${g.icon}</span><b>${g.name}</b><small class="skill">${g.skill}</small><small>${g.blurb}</small>${s ? `<i class="best">Best ${s.best}</i>` : g.fresh ? '<i class="new">New</i>' : ''}</a>`; }).join(''); };
    $$('#gc .chip').forEach(b => b.onclick = () => { $$('#gc .chip').forEach(x => x.classList.toggle('on', x === b)); draw(b.dataset.c); });
    draw('All');
  }
  function gameView(id) {
    const g = Games.LIST.find(x => x.id === id);
    app.innerHTML = `${topbar(g.icon + ' ' + g.name, '#/child/play')}<main class="game-page"><div class="game-side">${stage('', 150)}<p class="bubble small" id="gsay">${g.blurb}</p></div><section class="game-root" id="gr"></section></main>`;
    wireTop(); tickle($('.vivi-stage'));
    const say = t => { $('#gsay').textContent = t; Vivi.speak(t, { lang: 'en' }); };
    Games.run(id, $('#gr'), {
      say,
      done: (score, question) => {
        const s = S.stats.games[id] || { best: 0, plays: 0 }; s.best = Math.max(s.best, score); s.plays++; S.stats.games[id] = s; skill('think', 2); save();
        Vivi.mood('happy'); say(question);
        const box = document.createElement('div'); box.className = 'result';
        box.innerHTML = `<h3>Score ${score}</h3><p>${esc(question)}</p>${inputRow('gameIn', 'Tell ' + S.buddy.name + ' how you did it')}<div class="row"><a class="btn" href="#/child/play">All games</a><button class="btn primary" id="again">Play again</button></div>`;
        $('#gr').appendChild(box);
        $('#again').onclick = () => route();
        wireInput('gameIn', t => { logLine('child', t); skill('speak'); const r = words(t) > 6 ? 'Great explaining! Saying your strategy out loud makes it stick.' : 'Nice! Can you tell me a little more about how you did it?'; logLine('vivi', r); say(r); });
      }
    });
  }

  // ---------- speak ----------
  function speakView(sub) {
    if (sub === 'debate') return debateView(); if (sub === 'story') return storyView(); if (sub === 'talk') return timerView(); if (sub === 'bridge') return bridgeView();
    app.innerHTML = `${topbar(T('speak'))}<main class="speak"><p class="lead">The more you speak, the more you learn. Pick a challenge.</p>
      <div class="game-grid">
        <a class="game" href="#/child/speak/debate"><span>⚖️</span><b>Debate dojo</b><small class="skill">Reasoning, arguing kindly</small><small>Take a side, give reasons, answer back.</small></a>
        <a class="game" href="#/child/speak/story"><span>📖</span><b>Story chain</b><small class="skill">Imagination, fluency</small><small>You and ${esc(S.buddy.name)} build a story together.</small></a>
        <a class="game" href="#/child/speak/talk"><span>⏱️</span><b>30-second talk</b><small class="skill">Public speaking</small><small>Speak on a topic. See your filler words.</small></a>
        <a class="game" href="#/child/speak/bridge"><span>🌉</span><b>English bridge</b><small class="skill">Spoken English</small><small>Say it in Hindi, then in English.</small></a>
      </div></main>`;
    wireTop();
  }
  function scoreArgument(t) {
    const s = ' ' + t.toLowerCase() + ' ';
    const claim = /\b(should|shouldn.?t|must|i think|i believe|in my opinion|i feel|i agree|i disagree|hona chahiye|mujhe lagta)\b/.test(s);
    const reason = /\b(because|since|so that|as a result|kyunki|isliye|that.?s why)\b/.test(s);
    const example = /\b(for example|for instance|like when|such as|e\.g|jaise|example|once|my friend|i saw)\b/.test(s);
    return { claim, reason, example, n: words(t) };
  }
  function debateView() {
    let d = null, side = null;
    app.innerHTML = `${topbar('⚖️ Debate dojo', '#/child/speak')}<main class="activity"><div class="act-side">${stage('', 150)}<p class="bubble small" id="say">Pick a motion to debate.</p></div><section class="act-main" id="am"></section></main>`;
    wireTop(); const am = $('#am'); const say = t => { $('#say').textContent = t; Vivi.speak(t, { lang: 'en' }); };
    am.innerHTML = `<h3>Choose a motion</h3>` + C.DEBATES.map((x, i) => `<button class="option" data-i="${i}">${esc(L(x.motion))}</button>`).join('');
    $$('.option', am).forEach(b => b.onclick = () => { d = C.DEBATES[+b.dataset.i]; chooseSide(); });
    function chooseSide() {
      am.innerHTML = `<h3>"${esc(L(d.motion))}"</h3><p>Which side are you on?</p><div class="row"><button class="btn primary big" id="f">I agree</button><button class="btn big" id="a">I disagree</button></div>`;
      say('Which side are you on? There is no wrong side, only weak or strong reasons.');
      $('#f').onclick = () => { side = 'for'; argue(); }; $('#a').onclick = () => { side = 'against'; argue(); };
    }
    function argue() {
      am.innerHTML = `<h3>Your argument</h3><p class="hint">Try this shape: <b>I think</b> (your point) <b>because</b> (your reason). <b>For example</b> (something real).</p>${inputRow('dIn', 'Make your argument')}<div id="fb"></div>`;
      say('Make your argument. Say what you think, why, and give an example.');
      wireInput('dIn', t => {
        logLine('child', t); const s = scoreArgument(t);
        const counter = (side === 'for' ? d.against : d.for)[Math.floor(Math.random() * 2)];
        $('#fb').innerHTML = feedback(s) + `<div class="counter"><b>${esc(S.buddy.name)} argues back:</b> "${esc(counter)}"</div><p>How would you answer that?</p>${inputRow('rIn', 'Your rebuttal')}`;
        say(`Good point! But here's the other side: ${counter} How would you answer that?`);
        wireInput('rIn', r => {
          logLine('child', r); const rs = scoreArgument(r); const engages = /\b(but|however|even so|lekin|par|that.?s true|i understand)\b/i.test(r);
          const total = (s.claim ? 2 : 0) + (s.reason ? 2 : 0) + (s.example ? 2 : 0) + (rs.reason ? 2 : 0) + (engages ? 2 : 0);
          skill('speak', 3); skill('think', 2); S.stats.games.debate = { best: Math.max((S.stats.games.debate || {}).best || 0, total * 10), plays: ((S.stats.games.debate || {}).plays || 0) + 1 }; save();
          am.innerHTML = `<div class="result"><h3>Debate score: ${total}/10</h3><ul class="checks">
            <li class="${s.claim ? 'ok' : ''}">Clear point of view</li><li class="${s.reason ? 'ok' : ''}">Gave a reason ("because...")</li><li class="${s.example ? 'ok' : ''}">Used an example</li>
            <li class="${engages ? 'ok' : ''}">Answered the other side ("I see that, but...")</li><li class="${rs.reason ? 'ok' : ''}">Backed up your rebuttal</li></ul>
            <p>${total >= 8 ? 'You argued like a pro. Strong debaters listen to the other side, and you did!' : 'Next time, try starting your reply with "I see your point, but..." and add one reason.'}</p>
            <div class="row"><button class="btn primary" id="again">New motion</button><a class="btn" href="#/child/speak">Done</a></div></div>`;
          say(total >= 8 ? 'Wow, that was a strong debate!' : 'Good effort! Want to try another motion?');
          $('#again').onclick = () => route();
        });
      });
    }
    const feedback = s => `<ul class="checks"><li class="${s.claim ? 'ok' : ''}">Point of view</li><li class="${s.reason ? 'ok' : ''}">Reason</li><li class="${s.example ? 'ok' : ''}">Example</li></ul>`;
  }
  function storyView() {
    const start = C.STORY_STARTS[Math.floor(Math.random() * C.STORY_STARTS.length)]; const story = [start]; let round = 0;
    app.innerHTML = `${topbar('📖 Story chain', '#/child/speak')}<main class="activity"><div class="act-side">${stage('', 150)}<p class="bubble small" id="say"></p></div>
      <section class="act-main"><div class="story" id="st"></div><div id="si">${inputRow('sIn', 'What happens next?')}</div></section></main>`;
    wireTop(); const say = t => { $('#say').textContent = t; Vivi.speak(t, { lang: 'en' }); };
    const draw = () => $('#st').innerHTML = story.map((l, i) => `<p class="${i % 2 ? 'mine' : ''}">${esc(l)}</p>`).join('');
    draw(); say(start + ' What happens next?');
    wireInput('sIn', t => {
      logLine('child', t); story.push(t); skill('speak'); round++;
      if (round >= 4) {
        const end = 'And that is how the adventure ended, with everyone a little wiser. The end!'; story.push(end); draw();
        $('#si').innerHTML = `<div class="row"><button class="btn primary" id="read">🔊 Read our story</button><button class="btn" id="again">New story</button></div>`;
        say('What a story! Want me to read the whole thing aloud?');
        $('#read').onclick = () => Vivi.speak(story.join(' '), { lang: 'en' }); $('#again').onclick = () => route(); return;
      }
      const w = (t.match(/[A-Za-z]{4,}/g) || ['door']).sort((a, b) => b.length - a.length)[0].toLowerCase();
      const tw = C.STORY_TWISTS[Math.floor(Math.random() * C.STORY_TWISTS.length)].replace('{w}', w);
      story.push(tw); draw(); say(tw);
    });
  }
  function timerView() {
    const topic = L(C.SPEAK_TOPICS[Math.floor(Math.random() * C.SPEAK_TOPICS.length)]);
    app.innerHTML = `${topbar('⏱️ 30-second talk', '#/child/speak')}<main class="activity"><div class="act-side">${stage('', 150)}<p class="bubble small" id="say">${esc(topic)}</p></div>
      <section class="act-main"><h3>${esc(topic)}</h3><div class="timer" id="tm">30</div><p class="live" id="live"></p>
      <div class="row"><button class="btn primary big" id="go">🎙️ Start talking</button></div><p class="hint">No microphone? <button class="link" id="typeIt">Type your talk instead</button></p><div id="res"></div></section></main>`;
    wireTop(); Vivi.speak(topic, { lang: 'en' });
    let text = '', t = 30, iv;
    const finish = () => {
      clearInterval(iv); Vivi.stopListening();
      const w = words(text); const fillers = (text.toLowerCase().match(/\b(um+|uh+|like|basically|actually|matlab|you know|so so)\b/g) || []);
      const wpm = Math.round(w / ((30 - t) || 30) * 60);
      skill('speak', 2); logLine('child', text);
      $('#res').innerHTML = `<div class="result"><h3>${w} words</h3><ul class="checks"><li class="${w >= 40 ? 'ok' : ''}">Kept talking (${w} words)</li><li class="${fillers.length <= 2 ? 'ok' : ''}">Filler words: ${fillers.length}${fillers.length ? ' (' + [...new Set(fillers)].join(', ') + ')' : ''}</li><li class="${wpm >= 80 && wpm <= 160 ? 'ok' : ''}">Pace: about ${wpm} words a minute</li></ul>
        <p>${fillers.length > 2 ? 'Tip: when you need to think, pause silently instead of saying "um". Pauses sound confident!' : 'Smooth speaking! Next time, try ending with one strong sentence.'}</p><button class="btn primary" id="again">Try another topic</button></div>`;
      Vivi.speak(fillers.length > 2 ? 'Nice talk! Try pausing instead of saying um.' : 'That was smooth! Great job.', { lang: 'en' });
      $('#again').onclick = () => route();
    };
    $('#go').onclick = () => {
      if (!Vivi.canListen) return toast('Voice works in Chrome or Edge. You can type your talk instead.');
      $('#go').disabled = true; text = '';
      Vivi.listen({ lang: S.lang, continuous: true, onInterim: x => { text = x; $('#live').textContent = x; } });
      iv = setInterval(() => { t--; $('#tm').textContent = t; if (t <= 0) finish(); }, 1000);
      onLeave(() => clearInterval(iv));
    };
    $('#typeIt').onclick = () => { $('#res').innerHTML = `<textarea class="input" id="ta" rows="4" placeholder="Write what you would say"></textarea><button class="btn primary" id="done">Check my talk</button>`; $('#done').onclick = () => { text = $('#ta').value; t = 0; finish(); }; };
  }
  function bridgeView() {
    let i = 0, score = 0;
    app.innerHTML = `${topbar('🌉 English bridge', '#/child/speak')}<main class="activity"><div class="act-side">${stage('', 150)}<p class="bubble small" id="say">Say it in English!</p></div><section class="act-main" id="bm"></section></main>`;
    wireTop(); const say = t => { $('#say').textContent = t; Vivi.speak(t, { lang: 'en' }); };
    const normW = s => s.toLowerCase().replace(/[^a-z' ]/g, '').split(/\s+/).filter(Boolean);
    const show = () => {
      const b = C.BRIDGE[i];
      $('#bm').innerHTML = `<p class="label">Card ${i + 1} of ${C.BRIDGE.length}</p><div class="hindi-card">${esc(b.hi)}</div><p>How would you say this in English?</p>${inputRow('bIn', 'Say it in English')}<div id="bf"></div>`;
      wireInput('bIn', t => {
        logLine('child', t); const w = normW(t);
        let best = b.en[0], bestScore = 0;
        b.en.forEach(e => { const ew = normW(e); const hit = ew.filter(x => w.includes(x)).length / ew.length; if (hit > bestScore) { bestScore = hit; best = e; } });
        const ok = bestScore >= 0.7; if (ok) score++; skill('speak');
        const missing = normW(best).filter(x => !w.includes(x));
        $('#bf').innerHTML = `<div class="result"><h3>${ok ? '✅ Great English!' : 'Almost there!'}</h3><p>You said: "${esc(t)}"</p>${ok ? '' : `<p>Try: "<b>${esc(best.charAt(0).toUpperCase() + best.slice(1))}</b>"${missing.length ? ` (missing: ${esc(missing.join(', '))})` : ''}</p>`}<p class="hint">${esc(b.tip)}</p><button class="btn primary" id="nx">${i + 1 < C.BRIDGE.length ? 'Next card' : 'Finish'}</button></div>`;
        say(ok ? 'Great English! ' + b.tip : 'Almost! Try saying: ' + best);
        $('#nx').onclick = () => { i++; if (i >= C.BRIDGE.length) { $('#bm').innerHTML = `<div class="result"><h3>${score} of ${C.BRIDGE.length} cards</h3><p>Every sentence you say out loud makes the next one easier.</p><a class="btn primary" href="#/child/speak">Done</a></div>`; say(`You got ${score} cards! Keep speaking!`); } else show(); };
      });
    };
    show();
  }

  // ---------- feelings ----------
  function feelView() {
    app.innerHTML = `${topbar(T('feel'))}<main class="activity"><div class="act-side">${stage('', 170)}<p class="bubble small" id="say">How are you feeling right now?</p></div>
      <section class="act-main" id="fm"><h3>How are you feeling?</h3><div class="moods">${C.MOODS.map(m => `<button class="mood" data-m="${m.id}"><span>${m.face}</span>${esc(L(m.label))}</button>`).join('')}</div><div id="fr"></div></section></main>`;
    wireTop(); tickle($('.vivi-stage'));
    const say = t => { $('#say').textContent = t; Vivi.speak(t, { lang: 'en' }); };
    Vivi.speak('How are you feeling right now?', { lang: 'en' });
    $$('.mood').forEach(b => b.onclick = () => {
      const m = C.MOODS.find(x => x.id === b.dataset.m); S.moods.push({ m: m.id, t: Date.now() }); skill('connect'); save();
      $$('.mood').forEach(x => x.classList.toggle('on', x === b)); say(L(m.reply));
      const breathe = ['angry', 'worried', 'sad'].includes(m.id);
      $('#fr').innerHTML = (breathe ? `<div class="breathe"><div class="ring" id="ring"></div><p id="bt">Breathe in...</p><button class="btn" id="bs">Breathe with me</button></div>` : '') +
        `${inputRow('feelIn', 'Tell me about it (only if you want)')}<p class="hint">Then try a <button class="link" id="sc">"What would you do?"</button> challenge.</p>`;
      if (breathe) $('#bs').onclick = () => { let n = 0; const r = $('#ring'); $('#bs').remove(); const step = () => { if (!$('#ring')) return; const inn = n % 2 === 0; r.className = 'ring ' + (inn ? 'in' : 'out'); $('#bt').textContent = inn ? 'Breathe in... 4 seconds' : 'And out... 4 seconds'; n++; if (n < 6) setTimeout(step, 4000); else { $('#bt').textContent = 'Well done. Feeling a little calmer?'; } }; step(); };
      wireInput('feelIn', t => { logLine('child', t); say('Thank you for telling me. Your feelings matter. If something is really bothering you, please share it with a grown-up you trust too.'); });
      $('#sc').onclick = scenario;
    });
    function scenario() {
      const s = C.SCENARIOS[Math.floor(Math.random() * C.SCENARIOS.length)];
      $('#fm').innerHTML = `<h3>What would you do?</h3><p class="lead">${esc(L(s.s))}</p>${s.options.map((o, i) => `<button class="option" data-i="${i}">${esc(L(o))}</button>`).join('')}<div id="sr"></div>`;
      say(L(s.s));
      $$('.option').forEach(b => b.onclick = () => {
        const best = +b.dataset.i === s.best; b.classList.add(best ? 'good' : 'meh'); skill('connect');
        $('#sr').innerHTML = `<div class="result"><p>${esc(L(s.why))}</p><p><b>How do you think the other person felt?</b></p>${inputRow('scIn', 'I think they felt...')}</div>`;
        say((best ? 'Kind choice! ' : 'Hmm, think about how that would feel. ') + L(s.why) + ' How do you think the other person felt?');
        wireInput('scIn', t => { logLine('child', t); skill('connect'); say('Thinking about how others feel is called empathy. You are getting really good at it!'); $('#sr').insertAdjacentHTML('beforeend', `<button class="btn primary" id="nx">Another one</button>`); $('#nx').onclick = scenario; });
      });
    }
  }

  // ---------- revise (spaced repetition) ----------
  const dueTopics = () => Object.entries(S.memory).filter(([, m]) => m.next && m.next <= Date.now() && (m.level || 0) < 3).map(([id]) => id);
  function reviseView() {
    const due = dueTopics();
    app.innerHTML = `${topbar(T('revise'))}<main class="revise"><div class="act-side">${stage('', 150)}<p class="bubble small" id="say"></p></div><section class="act-main" id="rm"></section></main>`;
    wireTop(); const say = t => { $('#say').textContent = t; Vivi.speak(t, { lang: S.lang }); };
    const mapHtml = () => `<h3>Your learning map</h3><div class="mastery">${C.TOPICS.map(t => { const m = S.memory[t.id]; const lv = m ? (m.level || 0) : -1; const lab = lv < 0 ? 'Not started' : lv >= 3 ? 'Mastered' : 'Review ' + (lv + 1) + ' of 3'; return `<div class="m-item lv${lv}"><span>${t.icon}</span><b>${esc(L(t.title))}</b><small>${lab}${m && m.next && lv < 3 ? ', next ' + new Date(m.next).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}</small></div>`; }).join('')}</div>`;
    if (!due.length) { $('#rm').innerHTML = `<p class="lead">Nothing to revise right now. Topics come back after 3, 10 and 30 days, so your brain remembers them for good.</p>` + mapHtml(); say(S.lang === 'hi' ? 'Abhi kuch dohrana nahi hai. Shabaash!' : 'You are all caught up!'); return; }
    let i = 0;
    const show = () => {
      if (i >= due.length) { $('#rm').innerHTML = `<div class="result"><h3>Revision done!</h3><p>Remembering after a gap is what makes learning stick.</p></div>` + mapHtml(); say('Revision done! Your memory is getting stronger.'); return; }
      const t = C.TOPICS.find(x => x.id === due[i]);
      $('#rm').innerHTML = `<p class="label">${i + 1} of ${due.length} · ${esc(L(t.title))}</p><h3>${esc(L(t.review.q))}</h3>${inputRow('rvIn', 'Your answer')}<div id="rf"></div>`;
      say(L(t.review.q));
      wireInput('rvIn', a => {
        logLine('child', a); const ok = Engine.has(a, t.review.kw); const m = S.memory[t.id];
        if (ok) { m.level = (m.level || 0) + 1; m.next = Date.now() + [3, 10, 30][Math.min(m.level, 2)] * DAY; skill('learn'); } else { m.level = 0; m.next = Date.now() + DAY; }
        save();
        $('#rf').innerHTML = `<div class="result"><h3>${ok ? '✅ You remembered!' : 'Let\'s refresh this one.'}</h3><p>${ok ? (m.level >= 3 ? 'Mastered! This topic is yours now.' : `I'll check again in ${[3, 10, 30][Math.min(m.level, 2)]} days.`) : 'No worries. I\'ll bring it back tomorrow, or explore it again now.'}</p><div class="row">${ok ? '' : `<button class="btn" id="re">Explore again</button>`}<button class="btn primary" id="nx">Next</button></div></div>`;
        say(ok ? 'You remembered! Brilliant.' : "That's okay. We'll go over it again.");
        $('#nx').onclick = () => { i++; show(); }; const re = $('#re'); if (re) re.onclick = () => { pending = { type: 'topic', id: t.id }; go('#/child/talk'); };
      });
    };
    show();
  }

  // ---------- buddy ----------
  function buddyView() {
    const b = S.buddy;
    app.innerHTML = `${topbar(T('buddy'))}<main class="buddy">
      <section class="buddy-stage">${stage('', 250)}<p class="bubble small" id="say">Tap me, dress me up, or hold the button and talk. I'll copy you!</p>
        <button class="btn primary big copy" id="copy">🎙️ Hold and talk</button></section>
      <section class="buddy-edit">
        <label class="label">Name<input class="input" id="bn" value="${esc(b.name)}" maxlength="14"></label>
        <p class="label">Colour</p><div class="swatches">${Object.entries(Vivi.COLORS).map(([k, v]) => `<button class="sw ${b.color === k ? 'on' : ''}" data-c="${k}" style="background:${v}" aria-label="${k}"></button>`).join('')}</div>
        <p class="label">Ears</p><div class="chips">${Vivi.EARS.map(e => `<button class="chip ${b.ears === e ? 'on' : ''}" data-e="${e}">${{ dog: '🐶 Floppy', cat: '🐱 Pointy', bunny: '🐰 Bunny', antenna: '📡 Antenna' }[e]}</button>`).join('')}</div>
        <p class="label">Wear something</p><div class="chips">${Vivi.ACCESSORIES.map(a => `<button class="chip ${b.accessory === a ? 'on' : ''}" data-a="${a}">${{ none: 'Nothing', bow: '🎀 Bow', cap: '🧢 Cap', glasses: '👓 Glasses', crown: '👑 Crown', headphones: '🎧 Headphones' }[a]}</button>`).join('')}</div>
        <p class="hint">Like a robot friend from your favourite cartoon, your buddy is yours to design. Everything you teach it stays in its memory.</p>
      </section></main>`;
    wireTop();
    const redraw = () => { save(); $('.buddy-stage .vivi-stage').innerHTML = Vivi.svg(S.buddy, { size: 250 }); };
    tickle($('.vivi-stage'));
    $('#bn').oninput = e => { S.buddy.name = e.target.value || 'Vivi'; save(); };
    $$('[data-c]').forEach(x => x.onclick = () => { S.buddy.color = x.dataset.c; $$('[data-c]').forEach(y => y.classList.toggle('on', y === x)); redraw(); });
    $$('[data-e]').forEach(x => x.onclick = () => { S.buddy.ears = x.dataset.e; $$('[data-e]').forEach(y => y.classList.toggle('on', y === x)); redraw(); });
    $$('[data-a]').forEach(x => x.onclick = () => { S.buddy.accessory = x.dataset.a; $$('[data-a]').forEach(y => y.classList.toggle('on', y === x)); redraw(); Vivi.speak(x.dataset.a === 'none' ? 'Back to simple!' : 'Ooh, I look great!', { lang: 'en' }); });
    const cb = $('#copy'); let rec = false;
    const start = async e => { e.preventDefault(); if (rec) return; try { await Vivi.startCopycat(); rec = true; cb.classList.add('on'); cb.textContent = 'Listening... let go to hear me'; } catch (err) { toast('Allow the microphone so ' + S.buddy.name + ' can copy you.'); } };
    const stop = async () => { if (!rec) return; rec = false; cb.classList.remove('on'); cb.textContent = '🎙️ Hold and talk'; await Vivi.stopCopycat(); skill('speak'); };
    cb.addEventListener('pointerdown', start); cb.addEventListener('pointerup', stop); cb.addEventListener('pointerleave', stop);
  }

  // ---------- global bar: mode, language, view, theme (on every screen) ----------
  const LOGO = `<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 4a16 16 0 0 0 0 32z" fill="#3B2F6E"/><path d="M20 4a16 16 0 0 1 0 32z" fill="#F7CF6E"/><circle cx="13" cy="17" r="2" fill="#F7CF6E"/><path d="M10 24q4 4 8 0" stroke="#F7CF6E" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M24 13q4 1 3 5m-3 3q5 0 4 5" stroke="#3B2F6E" stroke-width="2" fill="none" stroke-linecap="round"/></svg>`;
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  function applyUI() {
    const dark = S.ui.theme === 'dark' || (S.ui.theme === 'auto' && mq.matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.body.classList.toggle('phone-view', S.ui.view === 'mobile' && window.innerWidth > 760);
  }
  mq.addEventListener && mq.addEventListener('change', applyUI);
  window.addEventListener('resize', applyUI);
  function renderGbar(area) {
    const g = $('#gbar');
    const inParent = area === 'parent';
    g.innerHTML = `<a class="g-brand" href="#/" aria-label="OpenMind home">${LOGO}<b>OpenMind</b></a><span class="g-proto">Prototype · demo data</span><span class="g-spacer"></span>
      <button class="mode-switch" id="gMode" title="Switch between the child app and the parent app">${inParent ? '🧒 Child' : '👪 Parent'} ⇄</button>
      <div class="seg" role="group" aria-label="Language"><button data-l="en" class="${S.lang === 'en' ? 'on' : ''}">EN</button><button data-l="hi" class="${S.lang === 'hi' ? 'on' : ''}">हिं</button></div>
      <div class="seg g-view" role="group" aria-label="View"><button data-v="mobile" class="${S.ui.view === 'mobile' ? 'on' : ''}">📱<span class="lbl">Mobile</span></button><button data-v="desktop" class="${S.ui.view !== 'mobile' ? 'on' : ''}">🖥️<span class="lbl">Desktop</span></button></div>
      <div class="seg" role="group" aria-label="Theme">${[['light', '☀️', 'Light'], ['dark', '🌙', 'Dark'], ['auto', '◐', 'Auto']].map(([k, i, l]) => `<button data-t="${k}" class="${S.ui.theme === k ? 'on' : ''}" aria-label="${l}">${i}<span class="lbl">${l}</span></button>`).join('')}</div>`;
    $('#gMode').onclick = () => inParent ? go('#/child') : gate(() => go('#/parent'));
    $$('[data-l]', g).forEach(b => b.onclick = () => { S.lang = b.dataset.l; save(); route(); });
    $$('[data-v]', g).forEach(b => b.onclick = () => { S.ui.view = b.dataset.v; save(); applyUI(); route(); });
    $$('[data-t]', g).forEach(b => b.onclick = () => { S.ui.theme = b.dataset.t; save(); applyUI(); renderGbar(area); });
  }
  applyUI();

  // ---------- parent app ----------
  const PTABS = [['home', '🏠', 'Home'], ['insights', '📊', 'Insights'], ['activity', '💬', 'Activity'], ['devices', '🧸', 'Toy Hub'], ['store', '🛍️', 'Store'], ['settings', '⚙️', 'Settings']];
  const kid = () => S.profile || { name: 'your child', age: '', cls: '' };
  const fmtDay = d => d.toLocaleDateString('en-IN', { weekday: 'short' });
  function week() {
    return [...Array(7)].map((_, i) => { const d = new Date(Date.now() - (6 - i) * DAY); const k = d.toISOString().slice(0, 10); const dd = S.stats.daily[k] || {}; return { k, l: fmtDay(d), m: S.stats.minutes[k] || 0, q: dd.q || 0, cw: dd.cw || 0, vw: dd.vw || 0 }; });
  }
  const sw = (id, on, label) => `<label class="switch" title="${esc(label || '')}"><input type="checkbox" id="${id}" ${on ? 'checked' : ''} aria-label="${esc(label || id)}"><span></span></label>`;
  function donut(val, max, label) {
    const r = 46, c = 2 * Math.PI * r, f = Math.min(1, val / Math.max(1, max));
    return `<svg class="donut" viewBox="0 0 110 110" role="img" aria-label="${label}"><circle cx="55" cy="55" r="${r}" fill="none" stroke="var(--surface-2)" stroke-width="12"/><circle cx="55" cy="55" r="${r}" fill="none" stroke="${val > max ? 'var(--berry)' : 'var(--leaf)'}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${c * f} ${c}" transform="rotate(-90 55 55)"/><text x="55" y="60" text-anchor="middle" font-size="20">${val} min</text></svg>`;
  }
  function weekStats() {
    const w = week(); const q = w.reduce((a, d) => a + d.q, 0), cw = w.reduce((a, d) => a + d.cw, 0), vw = w.reduce((a, d) => a + d.vw, 0);
    const share = cw + vw ? Math.round(cw / (cw + vw) * 100) : (S.stats.childWords + S.stats.viviWords ? Math.round(S.stats.childWords / (S.stats.childWords + S.stats.viviWords) * 100) : 0);
    return { w, q: q || S.stats.questions, share, mins: w.reduce((a, d) => a + d.m, 0) };
  }
  function moodSplit() {
    const recent = S.moods.filter(m => m.t > Date.now() - 7 * DAY); const n = recent.length || 1;
    const c = k => Math.round(recent.filter(m => k.includes(m.m)).length / n * 100);
    return { n: recent.length, joy: c(['happy']), calm: c(['okay']), low: c(['sad', 'worried', 'angry']) };
  }
  function dinnerQ() {
    const name = kid().name;
    const work = Object.entries(S.memory).find(([, m]) => m.missed && m.missed.length);
    if (work) { const t = C.TOPICS.find(x => x.id === work[0]); return { q: `${name}, can you teach us: ${L(t.title)}`, why: `${name} explained most of this to ${S.buddy.name} but missed one idea: "${work[1].missed[0]}". Listen for it. Teaching the family is the best revision there is.` }; }
    if (S.jar.length) return { q: `${name} wondered: "${S.jar[0].q}" What does everyone at the table think?`, why: 'Straight from the Curiosity Jar. No one needs to know the answer. Guessing together is the point.' };
    return { q: `What was the best question you asked Vivi this week?`, why: 'One question a week, drawn from what your child actually worked on.' };
  }
  function alerts() {
    const out = [], due = dueTopics();
    if (due.length) out.push(['🔁', `${due.length} topic${due.length > 1 ? 's' : ''} ready for revision`, 'Revision on day 3, 10 and 30 makes it stick.', 'activity']);
    Object.entries(S.memory).filter(([, m]) => m.missed && m.missed.length).slice(0, 2).forEach(([id, m]) => { const t = C.TOPICS.find(x => x.id === id); out.push(['🧩', `${L(t.title)} needs one more idea`, `Working on: ${m.missed.join(', ')}`, 'activity']); });
    const over = week().filter(d => d.m > S.parent.limit).length; if (over) out.push(['⏱️', `Over the daily limit on ${over} day${over > 1 ? 's' : ''}`, 'Usually because you added extra time. That is fine.', 'settings']);
    if (S.jar.length) out.push(['🫙', `New in the Curiosity Jar`, `"${S.jar[0].q}"`, 'activity']);
    const low = Math.min(S.devices.vivi.battery, S.devices.scribe.battery); if (low < 30) out.push(['🔋', 'A device needs charging', 'Charge it overnight.', 'devices']);
    return out;
  }

  function parentView(tab) {
    if (!PTABS.some(t => t[0] === tab)) tab = 'home';
    const k = kid(); const nAlerts = alerts().length;
    const content = { home: pHome, insights: pInsights, activity: pActivity, devices: pDevices, store: pStore, settings: pSettings }[tab]();
    const avatar = `<span class="av">${Vivi.svg(S.buddy, { size: 40 })}</span>`;
    app.innerHTML = `<div class="p-shell">
      <aside class="p-side"><div class="p-kid">${avatar}<div><b>${esc(k.name)}</b><small>${k.age ? `Age ${k.age} · Class ${esc(k.cls)}` : 'Child profile'}</small></div></div>
        ${PTABS.map(([id, ic, n]) => `<a class="p-nav ${id === tab ? 'on' : ''}" href="#/parent/${id}"><span class="ic">${ic}</span>${n}${id === 'home' && nAlerts ? `<span class="dot">${nAlerts}</span>` : ''}</a>`).join('')}
        <div class="grow"></div><a class="btn" href="#/child">🧒 Open child mode</a></aside>
      <main class="p-main"><div class="p-kid-mobile">${avatar}<div><b>${esc(k.name)}</b><small class="muted"> · Parent app</small></div></div>${content.html}</main>
      <nav class="p-bottom" aria-label="Parent sections">${PTABS.map(([id, ic, n]) => `<a href="#/parent/${id}" class="${id === tab ? 'on' : ''}"><span class="ic">${ic}</span>${n}</a>`).join('')}</nav>
    </div>`;
    content.wire && content.wire();
  }

  // ---- Home ----
  function pHome() {
    const k = kid(), ws = weekStats(), used = usedToday(), lim = S.parent.limit, md = moodSplit(), dq = dinnerQ(), al = alerts();
    const hr = new Date().getHours(), greet = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
    const mastered = Object.values(S.memory).filter(m => (m.level || 0) >= 3 || (m.stars || 0) >= 2).length;
    const fav = (() => { const t = Object.entries(S.memory).sort((a, b) => (b[1].stars || 0) - (a[1].stars || 0))[0]; return t ? L(C.TOPICS.find(x => x.id === t[0]).title).replace(/[?.]$/, '') : 'not yet'; })();
    const cardText = `${k.name} asked ${ws.q} questions this week on OpenMind! Talk share: ${ws.share}%. Favourite topic: ${fav}`;
    return {
      html: `<div class="p-head"><div><h1>${greet}</h1><p>${esc(k.name)}'s day so far</p></div><span class="muted small">Last sync: ${S.devices.lastSync ? new Date(S.devices.lastSync).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) : 'not yet today'}</span></div>
      <div class="cards c4 qa-row">
        <button class="qa a" id="qaStory"><span class="ic">📖</span><b>Start a story</b><small>send to Vivi now</small></button>
        <button class="qa b" id="qaLesson"><span class="ic">🌱</span><b>Start a lesson</b><small>pick a topic</small></button>
        <button class="qa c" id="qaCalm"><span class="ic">💛</span><b>Calm time</b><small>2-minute reset</small></button>
        <button class="qa d" id="qaSync"><span class="ic">🔄</span><b>Sync now</b><small>${S.devices.lastSync ? 'synced' : 'wifi off'}</small></button>
      </div>
      <div class="cards c2" style="margin-top:14px">
        <section class="card"><h3>Today</h3><div class="ringbox">${donut(used, lim, `${used} of ${lim} minutes used`)}<div><p class="muted" style="margin:0">Limit: ${lim} min</p>${used >= lim ? '<span class="pillwarn">Limit reached</span>' : `<span class="pillok">${lim - used} min left</span>`}<p style="margin:8px 0 0">Talk share <b>${ws.share}%</b>, ${ws.share >= 70 ? 'right on the 70% target.' : 'aiming for 70%.'}</p></div></div></section>
        <section class="card"><h3>Mood ring</h3><p class="muted small">How ${esc(k.name)} has felt this week${md.n ? ` (${md.n} check-ins)` : ''}</p><div class="moodring"><div><b style="color:var(--leaf)">${md.joy}%</b><span>Happy</span></div><div><b style="color:#2F7FC1">${md.calm}%</b><span>Okay</span></div><div><b style="color:var(--violet-d)">${md.low}%</b><span>Low</span></div></div></section>
      </div>
      <p class="sec-title">Ask this at dinner</p>
      <section class="card dinner"><q>${esc(dq.q)}</q><p class="muted small" style="margin:0">${esc(dq.why)}</p></section>
      <div class="cards c4" style="margin-top:14px">
        <div class="card kpi"><b>${ws.q}</b><span>questions this week</span></div>
        <div class="card kpi"><b>${ws.share}%</b><span>of the talking was ${esc(k.name)}</span></div>
        <div class="card kpi"><b>${mastered}</b><span>topics learned well</span></div>
        <div class="card kpi"><b>${S.stats.days.length}</b><span>days active</span></div>
      </div>
      <div class="cards c2" style="margin-top:14px">
        <section class="card sunday"><h3>Sunday card</h3><div class="sc"><div class="sc-q">${ws.q}</div><div><b>questions this week</b><p>${esc(k.name)} did ${ws.share}% of the talking. Favourite topic: ${esc(fav)}</p></div></div>
          <a class="btn primary" target="_blank" rel="noopener" href="https://wa.me/?text=${encodeURIComponent(cardText)}">Share on WhatsApp</a></section>
        <section class="card"><h3>Needs you</h3>${al.length ? al.map(a => `<div class="alert"><span class="ic">${a[0]}</span><div><b>${esc(a[1])}</b><br><small class="muted">${esc(a[2])}</small></div><a class="btn small" href="#/parent/${a[3]}">View</a></div>`).join('') : '<p class="muted">All good. Nothing needs you right now.</p>'}</section>
      </div>`,
      wire: () => {
        $('#qaStory').onclick = () => { toast('📖 Story sent. Vivi will start it the next time ' + kid().name + ' says hello.'); };
        $('#qaLesson').onclick = () => lessonPicker();
        $('#qaCalm').onclick = () => { toast('💛 Vivi will guide a 2-minute breathing break now.'); };
        $('#qaSync').onclick = () => { S.devices.lastSync = Date.now(); save(); toast('🔄 Synced with Vivi and Scribe'); route(); };
      }
    };
  }
  function lessonPicker() {
    const m = document.createElement('div'); m.className = 'modal';
    m.innerHTML = `<div class="sheet" role="dialog" aria-modal="true" aria-label="Start a lesson"><h3>Start a lesson</h3><p class="muted small">Vivi will open this topic in child mode.</p>${C.TOPICS.map(t => `<button class="option" data-t="${t.id}">${t.icon} ${esc(L(t.title))}</button>`).join('')}<button class="btn ghost" id="lx">Cancel</button></div>`;
    document.body.appendChild(m);
    $$('[data-t]', m).forEach(b => b.onclick = () => { m.remove(); pending = { type: 'topic', id: b.dataset.t }; go('#/child/talk'); });
    $('#lx', m).onclick = () => m.remove();
  }

  // ---- Insights ----
  function pInsights() {
    const k = kid(), ws = weekStats(), w = ws.w;
    const maxM = Math.max(S.parent.limit, ...w.map(d => d.m)), maxQ = Math.max(5, ...w.map(d => d.q));
    const score = { happy: 3, okay: 2, worried: 1, sad: 1, angry: 1 };
    const moodDays = w.map(d => { const ms = S.moods.filter(m => new Date(m.t).toISOString().slice(0, 10) === d.k); return ms.length ? ms.reduce((a, m) => a + score[m.m], 0) / ms.length : null; });
    const pts = moodDays.map((v, i) => v == null ? null : [20 + i * 76, 110 - (v - 1) * 45]).filter(Boolean);
    const sk = S.stats.skills, maxS = Math.max(10, ...Object.values(sk));
    const meas = [['Child talk share', ws.share, 70, `${ws.share}% (target 70%)`], ['Questions asked', ws.q, 30, `${ws.q} this week`], ['Lessons finished', Object.keys(S.memory).length, C.TOPICS.length, `${Object.keys(S.memory).length} of ${C.TOPICS.length}`], ['Explanations recorded', S.stats.explained || 0, 10, `${S.stats.explained || 0} this week`]];
    return {
      html: `<div class="p-head"><div><h1>Insights</h1><p>${esc(k.name)}'s week</p></div></div>
      <div class="cards c2">
        <section class="card"><h3>Weekly activity</h3><div class="bars7">${w.map(d => `<div class="b7"><div class="pair"><i style="height:${Math.round(d.m / maxM * 100)}%" class="${d.m > S.parent.limit ? 'over' : ''}" title="${d.m} min"></i><i class="q" style="height:${Math.round(d.q / maxQ * 100)}%" title="${d.q} questions"></i></div><span>${d.l}</span></div>`).join('')}</div>
          <div class="legend"><span><i style="background:var(--leaf)"></i>Minutes</span><span><i style="background:#8FB8D9"></i>Questions asked</span><span><i style="background:var(--berry)"></i>Over the limit</span></div></section>
        <section class="card"><h3>Mood trend</h3>${pts.length ? `<svg class="spark" viewBox="0 0 500 130" preserveAspectRatio="none" role="img" aria-label="Mood over the week">${[20, 65, 110].map(y => `<line x1="0" x2="500" y1="${y}" y2="${y}" stroke="var(--border)" stroke-dasharray="4 6"/>`).join('')}<polyline points="${pts.map(p => p.join(',')).join(' ')}" fill="none" stroke="var(--leaf)" stroke-width="3"/>${pts.map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="6" fill="var(--surface)" stroke="var(--leaf)" stroke-width="3"/>`).join('')}</svg><div class="legend"><span>Top line: happy</span><span>Bottom line: low</span></div>` : '<p class="muted">No mood check-ins yet this week.</p>'}</section>
      </div>
      <p class="sec-title">What we actually measure</p>
      <section class="card">${meas.map(([n, v, t, lab]) => `<div class="measure"><div class="top">${n}<span>${lab}</span></div><div class="track"><i style="width:${Math.min(100, Math.round(v / t * 100))}%"></i></div></div>`).join('')}
        <p class="muted small" style="margin:10px 0 0">We don't rank children or reward screen time. We report how much your child said, asked and could explain.</p></section>
      <div class="cards c2" style="margin-top:14px">
        <section class="card"><h3>Skills growing</h3>${[['think', 'Thinking', '🧠'], ['speak', 'Speaking', '🎤'], ['learn', 'Learning', '📚'], ['connect', 'Feelings and empathy', '💛']].map(([id, n, i]) => `<div class="bar"><span>${i} ${n}</span><div><i style="width:${Math.round((sk[id] || 0) / maxS * 100)}%"></i></div><b>${sk[id] || 0}</b></div>`).join('')}</section>
        <section class="card"><h3>Games and the skills they build</h3><ul class="list">${Games.LIST.filter(g => S.stats.games[g.id]).map(g => `<li><span class="lt"><span>${g.icon}</span><span><b>${g.name}</b><small>${g.skill}</small></span></span><span class="muted">best ${S.stats.games[g.id].best} · ${S.stats.games[g.id].plays}×</span></li>`).join('') || '<li class="muted">No games played yet.</li>'}${S.stats.games.debate ? `<li><span class="lt"><span>⚖️</span><span><b>Debate dojo</b><small>Reasoning</small></span></span><span class="muted">best ${S.stats.games.debate.best}</span></li>` : ''}</ul></section>
      </div>`
    };
  }

  // ---- Activity ----
  function pActivity() {
    const k = kid();
    const due = dueTopics();
    return {
      html: `<div class="p-head"><div><h1>Activity</h1><p>What ${esc(k.name)} learned, wondered and said</p></div></div>
      <div class="cards c2">
        <section class="card"><h3>Learning map</h3><ul class="list">${C.TOPICS.map(t => { const m = S.memory[t.id]; const st = !m ? '<span class="muted">Not started</span>' : (m.level || 0) >= 3 ? '<span class="pillok">Mastered</span>' : `<span class="stars">${'★'.repeat(m.stars || 0)}${'☆'.repeat(3 - (m.stars || 0))}</span>`; return `<li><span class="lt"><span>${t.icon}</span><span><b>${esc(L(t.title))}</b><small>${m && m.missed && m.missed.length ? 'Working on: ' + esc(m.missed.join(', ')) : m && m.next ? (due.includes(t.id) ? 'Ready to revise' : 'Next revision ' + new Date(m.next).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })) : t.subject}</small></span></span>${st}</li>`; }).join('')}</ul></section>
        <section class="card"><h3>Curiosity jar</h3><p class="muted small">Questions ${esc(k.name)} asked that are worth exploring together.</p><ul class="list">${S.jar.length ? S.jar.slice(0, 10).map(j => `<li><span class="lt">🫙 <b>${esc(j.q)}</b></span><span class="muted small">${new Date(j.t).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span></li>`).join('') : '<li class="muted">Empty for now.</li>'}</ul></section>
      </div>
      <p class="sec-title">Recent conversations</p>
      <section class="card"><div class="transcript">${S.log.slice(-30).map(l => `<p class="${l.who}"><b>${l.who === 'child' ? esc(k.name) : esc(S.buddy.name)}:</b> ${esc(l.text)}<time>${new Date(l.t).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' })}</time></p>`).join('') || '<p class="muted">No conversations yet.</p>'}</div></section>
      <p class="sec-title">Moods</p><section class="card"><div class="moodrow">${S.moods.slice(-14).map(m => `<span title="${m.m}">${(C.MOODS.find(x => x.id === m.m) || {}).face || ''}</span>`).join('') || '<span class="muted small">No check-ins yet.</span>'}</div></section>`
    };
  }

  // ---- Toy Hub ----
  function pDevices() {
    const k = kid(), d = S.devices;
    const dev = (id, icon, name, info) => { const x = d[id]; return `<div class="dev"><span class="di">${icon}</span><div><b>${name}</b><small><span class="status-dot" style="${x.on ? '' : 'background:var(--muted)'}"></span>Assigned to ${esc(k.name)} · ${x.on ? 'Connected' : 'Offline'} · v${x.fw}</small><small>${info}</small></div><div style="display:grid;gap:6px;justify-items:end"><span class="batt" style="--b:${x.battery}%"><i></i>${x.battery}%</span><button class="btn small" data-ring="${id}">${id === 'vivi' ? '🔔 Ring' : '📲 Find'}</button></div></div>`; };
    return {
      html: `<div class="p-head"><div><h1>Toy Hub</h1><p>Your OpenMind devices</p></div><button class="btn" id="fwc">Check for updates</button></div>
      <div class="cards c2">
        <section class="card"><h3>Connected</h3>
          ${dev('vivi', `<span style="display:block;width:44px;margin-top:10px">${Vivi.svg(S.buddy, { size: 44 })}</span>`, esc(S.buddy.name), 'Voice only, no camera')}
          ${dev('scribe', '📗', 'Scribe', 'Locked learning tablet with camera and stylus')}
          <div class="dev"><span class="di">📱</span><div><b>This phone</b><small>OpenMind app · parent and child modes</small></div><span class="pillok">Active</span></div>
          <a class="dev" href="#/parent/store" style="text-decoration:none;color:inherit"><span class="di">✨</span><div><b style="color:var(--violet-d)">Add a device</b><small>Board-Game Kit, Vivi Jr and Circle are coming</small></div><span>›</span></a>
        </section>
        <section class="card"><h3>Device controls</h3>
          <div class="ctl"><span class="ci">⏱️</span><div><b>Session length</b><small>${S.parent.limit} minutes a day, then it stops</small></div><select class="input" id="dlim" style="width:auto">${[15, 20, 30, 45, 60].map(m => `<option ${m === S.parent.limit ? 'selected' : ''}>${m}</option>`).join('')}</select></div>
          <div class="ctl"><span class="ci">🎙️</span><div><b>Microphone</b><small>On-device only. ${S.parent.liveAI ? 'Live AI is on: text of new questions goes to the cloud.' : 'Nothing uploaded.'}</small></div><a class="btn small" href="#/parent/settings">Change</a></div>
          <div class="ctl"><span class="ci">📷</span><div><b>Camera</b><small>${S.devices.shutter ? 'Physical shutter closed now' : 'Shutter open, light is on'} · Vivi has no camera</small></div>${sw('dcam', !S.devices.shutter, 'Camera open')}</div>
          <div class="ctl"><span class="ci">🌐</span><div><b>Language</b><small>${S.lang === 'hi' ? 'Hindi + English' : 'English'}</small></div><select class="input" id="dlang" style="width:auto"><option value="en">English</option><option value="hi" ${S.lang === 'hi' ? 'selected' : ''}>Hindi + English</option></select></div>
          <div class="ctl"><span class="ci">📦</span><div><b>Offline packs</b><small>18.4 of 32 GB · 500 stories, 24 apps, ${S.parent.packs.length} extra pack${S.parent.packs.length === 1 ? '' : 's'}</small><div class="storage"><i style="width:58%"></i></div></div><a class="btn small" href="#/parent/store">Packs</a></div>
        </section>
      </div>
      <section class="card memory-note" style="margin-top:14px"><b>One memory across every device.</b> What ${esc(k.name)} tells ${esc(S.buddy.name)} on Monday comes back as a revision card on Scribe on Thursday.</section>`,
      wire: () => {
        $$('[data-ring]').forEach(b => b.onclick = () => { if (b.dataset.ring === 'vivi') { Vivi.speak("I'm here! I'm right here!", { lang: 'en' }); toast('🔔 ' + S.buddy.name + ' is playing a sound'); } else toast('📲 Scribe is ringing'); });
        $('#fwc').onclick = () => toast('All devices are up to date');
        $('#dlim').onchange = e => { S.parent.limit = +e.target.value; save(); route(); };
        $('#dcam').onchange = e => { S.devices.shutter = !e.target.checked; S.parent.camera = e.target.checked; save(); route(); };
        $('#dlang').onchange = e => { S.lang = e.target.value; save(); route(); };
      }
    };
  }

  // ---- Store ----
  const PRODUCTS = [
    { id: 'vivi', cat: 'devices', pic: 'vivi', name: 'Vivi', desc: 'The voice-only learning companion. Asks back in 12 languages.', price: '₹2,999' },
    { id: 'scribe', cat: 'devices', pic: '📗', name: 'Scribe', desc: 'Locked learning tablet with camera and stylus. No browser, no feed.', price: '₹7,999', sub: 'EMI ₹799 × 10' },
    { id: 'outfits', cat: 'devices', pic: '🎀', name: 'Vivi outfit pack', desc: 'Cap, bow, glasses and a raincoat for the plush. Unlock matching looks in the app.', price: '₹399' },
    { id: 'boardgame', cat: 'soon', pic: '♟️', name: 'Board-Game Kit', desc: 'Chess, Ludo and Snakes & Ladders with question cards. Vivi recognises the board and coaches each move.', price: '₹1,499' },
    { id: 'vivijr', cat: 'soon', pic: '🐣', name: 'Vivi Jr', desc: 'For ages 2 to 4. Rhymes, first words and "what is this?" games in the mother tongue.', price: '₹1,999' },
    { id: 'maker', cat: 'soon', pic: '🔧', name: 'Maker Kit', desc: 'Build-it science projects. Vivi asks what you predict before every experiment.', price: '₹1,299' },
    { id: 'cards', cat: 'soon', pic: '🃏', name: 'Story Cards', desc: 'Tap a card on Vivi to start a story. Every story ends with questions.', price: '₹499' },
    { id: 'circle', cat: 'soon', pic: '🫶', name: 'Circle', desc: 'A small home hub for family quiz nights and moderated peer circles.', price: '₹2,499' },
    { id: 'chess', cat: 'packs', pic: '♞', name: 'Chess Academy', desc: '120 positions from beginner to club level, with a coach that asks why.', price: 'Included' },
    { id: 'english', cat: 'packs', pic: '🗣️', name: 'Spoken English Plus', desc: 'Daily speaking missions, role-plays and pronunciation feedback.', price: 'Included' },
    { id: 'vedic', cat: 'packs', pic: '🧮', name: 'Vedic Maths Pro', desc: '40 mental-maths tricks taught by explaining them back.', price: 'Included' },
    { id: 'regional', cat: 'packs', pic: '🌏', name: 'Regional languages', desc: 'Marathi, Tamil, Telugu and Bengali voices and stories.', price: 'Included' },
    { id: 'exam', cat: 'packs', pic: '🎓', name: 'Class 5 foundation', desc: 'Science, maths and EVS topics mapped to the school year.', price: 'Included' }
  ];
  function pStore(filter) {
    const until = new Date(Date.now() + 2 * 365 * DAY).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
    const cats = [['all', 'All'], ['devices', 'Devices'], ['soon', 'Coming soon'], ['packs', 'Learning packs'], ['plans', 'Plans']];
    const card = p => {
      const owned = p.cat === 'devices' && S.devices.owned.includes(p.id), notify = S.parent.notify.includes(p.id), got = S.parent.packs.includes(p.id);
      const tag = owned ? '<span class="tag owned">Owned</span>' : p.cat === 'soon' ? '<span class="tag soon">Coming soon</span>' : p.cat === 'packs' ? '<span class="tag incl">Included in your plan</span>' : '';
      const btn = owned ? `<a class="btn small" href="#/parent/devices">Manage</a>` : p.cat === 'soon' ? `<button class="btn small ${notify ? '' : 'primary'}" data-notify="${p.id}">${notify ? "✓ We'll tell you" : 'Notify me'}</button>` : p.cat === 'packs' ? `<button class="btn small ${got ? '' : 'primary'}" data-pack="${p.id}">${got ? '✓ Downloaded' : 'Download'}</button>` : `<button class="btn small primary" data-buy="${p.id}">Add to cart</button>`;
      return `<article class="prod" data-cat="${p.cat}">${tag}<div class="pic">${p.pic === 'vivi' ? Vivi.svg(S.buddy, { size: 90 }) : p.pic}</div><b>${esc(p.name)}</b><span class="muted small">${esc(p.desc)}</span><span class="price">${p.price}${p.sub ? ` <small class="muted">· ${p.sub}</small>` : ''}</span>${btn}</article>`;
    };
    return {
      html: `<div class="p-head"><div><h1>Store</h1><p>Devices, learning packs and what's coming next</p></div></div>
      <section class="plan"><div><b>OpenMind Family</b><p>Included with your Vivi until ${until}. After that ₹199 a month, and everything you've downloaded keeps working even if you stop.</p></div><a class="btn" href="#store-plans" id="seePlans">See plans</a></section>
      <div class="chips" id="sc" style="margin:16px 0">${cats.map(([id, n]) => `<button class="chip ${id === 'all' ? 'on' : ''}" data-f="${id}">${n}</button>`).join('')}</div>
      <div id="sgrid"><div class="store-grid">${PRODUCTS.map(card).join('')}</div>
      <div id="store-plans"><p class="sec-title">Plans</p><div class="cards c3">
        <section class="card"><h3>Free</h3><p class="price" style="font-family:var(--head);font-weight:800;font-size:1.4rem;color:var(--violet-d)">₹0</p><p class="muted small">Core apps on any phone. 10 Vivi questions a day.</p></section>
        <section class="card" style="border:2px solid var(--violet)"><h3>Family</h3><p class="price" style="font-family:var(--head);font-weight:800;font-size:1.4rem;color:var(--violet-d)">₹199/month</p><p class="muted small">Everything, for every child in the home. Free for 2 years with Vivi or Scribe.</p><span class="pillok">You have this</span></section>
        <section class="card"><h3>Family yearly</h3><p class="price" style="font-family:var(--head);font-weight:800;font-size:1.4rem;color:var(--violet-d)">₹1,999/year</p><p class="muted small">Two months free compared with monthly.</p></section>
      </div></div></div>
      <p class="store-note">Prototype: prices are indicative and checkout is not live yet. Most packs will be part of the Family plan; devices and kits are sold separately as the ecosystem grows.</p>`,
      wire: () => {
        $$('#sc .chip').forEach(b => b.onclick = () => {
          $$('#sc .chip').forEach(x => x.classList.toggle('on', x === b)); const f = b.dataset.f;
          $$('.prod').forEach(p => p.hidden = !(f === 'all' || p.dataset.cat === f)); $('#store-plans').hidden = !(f === 'all' || f === 'plans');
          $('.store-grid').hidden = f === 'plans';
        });
        $('#seePlans').onclick = e => { e.preventDefault(); $('[data-f="plans"]').click(); };
        $$('[data-notify]').forEach(b => b.onclick = () => { const id = b.dataset.notify, n = S.parent.notify; const i = n.indexOf(id); i < 0 ? n.push(id) : n.splice(i, 1); save(); toast(i < 0 ? "We'll let you know the day it launches" : 'Removed from your list'); route(); });
        $$('[data-pack]').forEach(b => b.onclick = () => { const id = b.dataset.pack, n = S.parent.packs; if (!n.includes(id)) { n.push(id); save(); toast('📦 Downloading to Vivi and Scribe for offline use'); route(); } });
        $$('[data-buy]').forEach(b => b.onclick = () => toast('🛒 Checkout opens at launch. Saved to your wishlist.'));
      }
    };
  }

  // ---- Settings ----
  function pSettings() {
    const k = kid();
    return {
      html: `<div class="p-head"><div><h1>Settings</h1><p>Controls, privacy and preferences</p></div></div>
      <div class="cards c2">
        <section class="card"><h3>Child profile</h3>
          <div class="set-row"><div><b>Name</b></div><input class="input" id="sn" value="${esc(k.name === 'your child' ? '' : k.name)}" placeholder="Name"></div>
          <div class="set-row"><div><b>Age</b></div><select class="input" id="sa">${[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(a => `<option ${+k.age === a ? 'selected' : ''}>${a}</option>`).join('')}</select></div>
          <div class="set-row"><div><b>Class</b></div><select class="input" id="sk">${['LKG', 'UKG', 1, 2, 3, 4, 5, 6, 7, 8].map(c => `<option ${String(k.cls) === String(c) ? 'selected' : ''}>${c}</option>`).join('')}</select></div>
          <div class="row" style="margin-top:10px"><button class="btn primary" id="ssave">Save profile</button></div></section>
        <section class="card"><h3>Time and limits</h3>
          <div class="set-row"><div><b>Daily limit</b><small>The session ends on its own</small></div><select class="input" id="lim">${[15, 20, 30, 45, 60].map(m => `<option ${m === S.parent.limit ? 'selected' : ''}>${m}</option>`).join('')}</select></div>
          <div class="set-row"><div><b>Bedtime lock</b><small>No OpenMind after ${S.parent.bedtimeAt}</small></div>${sw('bed', S.parent.bedtime, 'Bedtime lock')}</div>
          <div class="set-row"><div><b>Weekly Sunday card</b><small>Sent on WhatsApp every Sunday at 7 pm</small></div>${sw('wcard', S.parent.weeklyCard, 'Weekly card')}</div>
          <div class="set-row"><div><b>"Needs you" alerts</b><small>Revision due, topics to revisit</small></div>${sw('al', S.parent.alerts, 'Alerts')}</div></section>
        <section class="card"><h3>Voice and language</h3>
          <div class="set-row"><div><b>Language</b></div><select class="input" id="pl"><option value="en">English</option><option value="hi" ${S.lang === 'hi' ? 'selected' : ''}>Hindi + English</option></select></div>
          <div class="set-row"><div><b>Vivi speaks out loud</b></div>${sw('pv', S.parent.voice, 'Voice')}</div>
          <div class="voicebox" style="margin-top:10px"><label><b>Vivi's voice</b><select class="input" id="vsel"><option value="">Best available (automatic)</option><option value="__browser__" ${S.parent.voiceName === '__browser__' ? 'selected' : ''}>This device's voices only</option>${Vivi.voiceList().map(v => `<option value="${esc(v.name)}" ${S.parent.voiceName === v.name ? 'selected' : ''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('')}</select></label>
            <button class="btn" id="vtest">▶ Test voice</button><p class="muted small" id="vstat"></p></div></section>
        <section class="card"><h3>AI, camera and privacy</h3>
          <div class="set-row"><div><b>Live AI for new questions</b><small id="aiStatus">Off: Vivi uses offline lessons only</small></div>${sw('pa', S.parent.liveAI, 'Live AI')}</div>
          <div class="set-row"><div><b>Camera</b><small>Video call and "Show Vivi" on this device</small></div>${sw('pc', S.parent.camera, 'Camera')}</div>
          <div class="set-row"><div><b>Encrypted cloud backup</b><small>Restore progress on a new device</small></div>${sw('bk', S.parent.backup, 'Backup')}</div>
          <div class="set-row"><div><b>Parental consent</b><small>${S.parent.consentAt ? 'Given on ' + new Date(S.parent.consentAt).toLocaleDateString('en-IN') : 'Needed under the DPDP Act, 2023'}</small></div>${S.parent.consentAt ? '<span class="pillok">Given</span>' : '<button class="btn small primary" id="consent">Give consent</button>'}</div>
          <p class="muted small" style="margin:10px 0 0">Data stays on this device. Live AI sends only the conversation text, never your child's name or contact details. No ads, ever.</p></section>
        <section class="card full"><h3>Your data</h3><div class="row"><button class="btn" id="exp">⬇ Download all data</button><button class="btn" id="demo">Load demo week</button><button class="btn ghost danger" id="reset">Erase all data</button></div></section>
      </div>`,
      wire: () => {
        $('#ssave').onclick = () => { S.profile = { ...(S.profile || {}), name: $('#sn').value.trim() || 'Friend', age: +$('#sa').value, cls: $('#sk').value }; save(); toast('Profile saved'); route(); };
        $('#lim').onchange = e => { S.parent.limit = +e.target.value; save(); };
        $('#bed').onchange = e => { S.parent.bedtime = e.target.checked; save(); };
        $('#wcard').onchange = e => { S.parent.weeklyCard = e.target.checked; save(); };
        $('#al').onchange = e => { S.parent.alerts = e.target.checked; save(); };
        $('#pl').onchange = e => { S.lang = e.target.value; save(); renderGbar('parent'); };
        $('#pv').onchange = e => { S.parent.voice = e.target.checked; Vivi.setVoice(S.parent.voice); save(); };
        const vstat = () => { const pr = Vivi.premiumStatus(); $('#vstat').textContent = pr.on ? `Natural Indian voice is on (${pr.provider}). Using: ${Vivi.currentVoiceName(S.lang)}.` : `Using this device's voice: ${Vivi.currentVoiceName(S.lang)}. For a natural human voice, add SARVAM_API_KEY (or OPENAI_API_KEY) in Vercel.`; };
        Vivi.initPremium().then(() => $('#vstat') && vstat()); vstat();
        $('#vsel').onchange = e => { S.parent.voiceName = e.target.value; Vivi.setVoiceName(e.target.value); save(); vstat(); };
        $('#vtest').onclick = () => Vivi.speak(S.lang === 'hi' ? 'Namaste! Main Vivi hoon. Chalo saath mein kuch naya seekhte hain!' : "Hi! I'm Vivi. Shall we find out something amazing together?", { lang: S.lang });
        $('#pa').onchange = e => { S.parent.liveAI = e.target.checked; save(); checkAI(); };
        if (S.parent.liveAI) checkAI();
        $('#pc').onchange = e => { S.parent.camera = e.target.checked; S.devices.shutter = !e.target.checked; save(); };
        $('#bk').onchange = e => { S.parent.backup = e.target.checked; save(); toast(e.target.checked ? 'Backup on' : 'Backup off'); };
        const c = $('#consent'); if (c) c.onclick = () => { S.parent.consentAt = Date.now(); save(); route(); };
        $('#exp').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' })); a.download = 'openmind-data.json'; a.click(); };
        $('#demo').onclick = () => { loadDemo(); toast('Demo week loaded'); go('#/parent/home'); };
        $('#reset').onclick = () => { if (confirm('Erase all OpenMind data on this device?')) { const ui = S.ui; S = DEF(); S.ui = ui; save(); go('#/'); } };
      }
    };
  }
  async function checkAI() {
    const s = $('#aiStatus'); if (!s) return;
    if (!S.parent.liveAI) { s.textContent = 'Off: Vivi uses offline lessons only'; return; }
    s.textContent = 'Checking the server...';
    try { const r = await fetch('/api/chat'); const d = await r.json(); s.textContent = d.configured ? 'Connected' : 'Server has no API key yet, using offline lessons'; }
    catch (e) { s.textContent = 'No server found, using offline lessons'; }
  }
  function loadDemo() {
    const now = Date.now();
    S.profile = S.profile && S.profile.name && S.profile.name !== 'Friend' ? S.profile : { name: 'Aarav', age: 7, cls: '3' };
    S.stats.questions = 31; S.stats.childWords = 1460; S.stats.viviWords = 690; S.stats.explained = 6;
    S.stats.skills = { think: 34, speak: 41, learn: 22, connect: 9 };
    S.stats.games = { chess: { best: 83, plays: 3 }, memory: { best: 84, plays: 5 }, stroop: { best: 70, plays: 3 }, sudoku: { best: 100, plays: 2 }, ninja: { best: 75, plays: 4 }, robot: { best: 100, plays: 2 }, debate: { best: 80, plays: 2 } };
    S.stats.minutes = {}; S.stats.daily = {};
    [[22, 4], [28, 6], [18, 3], [30, 7], [25, 5], [12, 2], [14, 4]].forEach(([m, q], i) => { const k = new Date(now - (6 - i) * DAY).toISOString().slice(0, 10); S.stats.minutes[k] = m; S.stats.daily[k] = { q, cw: 200 + q * 15, vw: 95 + q * 5 }; });
    S.stats.days = Object.keys(S.stats.minutes);
    S.memory = { sky: { stars: 3, level: 1, next: now - 36e5, last: now - 3 * DAY, missed: [] }, rain: { stars: 2, level: 0, next: now - 2 * 36e5, last: now - 3 * DAY, missed: ['vapour cools into clouds'] }, plants: { stars: 3, level: 2, next: now + 6 * DAY, last: now - 4 * DAY, missed: [] }, fractions: { stars: 1, level: 0, next: now + DAY, last: now - DAY, missed: ['bottom number = total parts', 'top number = parts taken'] } };
    S.jar = [{ q: 'Why do cats purr?', t: now - DAY }, { q: 'How do aeroplanes stay up in the sky?', t: now - 2 * DAY }, { q: 'Why is the sea salty?', t: now - 3 * DAY }];
    S.moods = ['happy', 'okay', 'happy', 'worried', 'happy', 'okay', 'happy'].map((m, i) => ({ m, t: now - (6 - i) * DAY }));
    S.devices.lastSync = now - 2 * 36e5;
    S.parent.consentAt = S.parent.consentAt || now - 20 * DAY;
    S.log = [
      { who: 'child', text: 'Vivi, aasmaan neela kyun hota hai?' }, { who: 'vivi', text: 'Accha sawaal! Pehle tum batao, shaam ko aasmaan kis rang ka dikhta hai?' },
      { who: 'child', text: 'Orange... ya laal?' }, { who: 'vivi', text: 'Bilkul! Toh rang badal raha hai. Kya yeh sooraj ki roshni se juda ho sakta hai?' },
      { who: 'child', text: 'I think homework should be banned because we need time to play. For example, I have no time for cricket.' },
      { who: 'vivi', text: "Good point! But here's the other side: homework helps you practise what you learned in class. How would you answer that?" },
      { who: 'child', text: 'I see your point, but we can practise in class because the teacher is there.' },
      { who: 'vivi', text: 'You argued like a pro. Strong debaters listen to the other side, and you did!' }
    ].map((l, i) => ({ ...l, t: now - (30 - i * 3) * 6e4 }));
    save();
  }

  if (!location.hash) location.hash = '#/';
  route();
})();
