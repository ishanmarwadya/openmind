/* The conversation engine. Works fully offline with scripted Socratic topics.
   If a parent switches on "live AI" and the /api/chat function is deployed with a key,
   anything outside the scripts goes to the model with a child-safe Socratic system prompt. */

window.Engine = (() => {
  const C = window.OM_CONTENT;
  const norm = s => ' ' + s.toLowerCase().replace(/[^a-z0-9\u0900-\u097F/ ]+/g, ' ').replace(/\s+/g, ' ').trim() + ' ';
  const has = (text, kws) => kws.includes('*') ? text.trim().length > 1 : kws.some(k => norm(text).includes(k.includes(' ') ? ' ' + k + ' ' : ' ' + k) || (k.length > 4 && norm(text).includes(k)));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const L = (o, lang) => (o && (o[lang] || o.en)) || '';

  let st = { mode: 'chat', topic: null, step: 0, hinted: false, askedAnswer: 0, riddle: null, object: null, teach: null, unknownTurns: 0, unknownQ: '' };
  const reset = () => { st = { mode: 'chat', topic: null, step: 0, hinted: false, askedAnswer: 0, riddle: null, object: null, teach: null, unknownTurns: 0, unknownQ: '' }; };

  function evaluate(text, topic, lang) {
    const got = [], missed = [];
    topic.concepts.forEach(c => (has(text, c.kw) ? got : missed).push(L(c.name, lang)));
    const stars = got.length === topic.concepts.length ? 3 : got.length >= 2 ? 2 : got.length >= 1 ? 1 : 0;
    return { got, missed, stars };
  }

  function findTopic(text) { return C.TOPICS.find(t => has(text, t.match)); }
  const isQuestion = s => /\?|^\s*(why|what|how|where|when|who|which|can|is|are|do|does|kyun|kya|kaise|kahan|kab|kaun)\b/i.test(s);

  let lastTopic = null;
  function startTopic(topic, lang, mode = 'chat') {
    lastTopic = topic.id; st.topic = topic; st.step = 0; st.hinted = false; st.askedAnswer = 0; st.mode = mode;
    return { text: L(topic.hook, lang), mood: 'curious', event: { type: 'topic-start', topic: topic.id } };
  }

  function startTeach(topic, lang) {
    reset(); lastTopic = topic.id; st.mode = 'teach'; st.teach = { topic, rounds: 0 };
    const t = L(topic.title, lang).replace('?', '');
    return { text: lang === 'hi' ? `Mujhe "${t}" bilkul samajh nahi aata. Kya tum mujhe sikhaoge? Aaram se samjhao.` : `I'm really confused about "${t}". Can you teach me? Take your time and explain it to me.`, mood: 'curious', event: { type: 'teach-start', topic: topic.id } };
  }

  function teachTurn(text, lang) {
    const { topic } = st.teach; st.teach.rounds++;
    st.teach.all = (st.teach.all || '') + ' ' + text;
    const ev = evaluate(st.teach.all, topic, lang);
    if (ev.missed.length && st.teach.rounds < 3) {
      const before = st.teach.got || [];
      const fresh = ev.got.filter(g => !before.includes(g)); st.teach.got = ev.got;
      const idx = topic.concepts.findIndex(c => !has(st.teach.all, c.kw));
      const probe = topic.steps[idx] ? L(topic.steps[idx].hint, lang) : (lang === 'hi' ? 'Thoda aur samjhao?' : 'Can you tell me a bit more?');
      const ok = fresh.length ? (lang === 'hi' ? `Accha, ab samjha: ${fresh.join(', ')}! ` : `Oh, now I get it: ${fresh.join(' and ')}! `) : (lang === 'hi' ? 'Hmm, main abhi bhi thoda confused hoon. ' : "Hmm, I'm still a little confused. ");
      return { text: ok + (lang === 'hi' ? 'Par ek hissa samajh nahi aaya. ' : "But I'm stuck on one part. ") + probe, mood: 'curious' };
    }
    const stars = ev.stars;
    st.mode = 'chat'; const tid = topic.id; st.teach = null;
    const summary = ev.missed.length
      ? (lang === 'hi' ? `Tumne mujhe ${ev.got.length} mein se ${topic.concepts.length} badi baatein sikhayi! Ek cheez reh gayi: ${ev.missed.join(', ')}. Use hum agli baar saath mein dekhenge.` : `You taught me ${ev.got.length} of ${topic.concepts.length} big ideas! One thing we can work on: ${ev.missed.join(', ')}. Let's look at that together next time.`)
      : (lang === 'hi' ? 'Waah! Tumne mujhe sab kuch samjha diya. Tum toh asli teacher ho!' : "Wow! You explained every big idea. You're a real teacher!");
    return { text: summary, mood: stars >= 2 ? 'happy' : 'curious', event: { type: 'explained', topic: tid, stars, got: ev.got, missed: ev.missed } };
  }

  function topicTurn(text, lang) {
    const topic = st.topic;
    if (st.mode === 'explain') {
      const ev = evaluate(text, topic, lang);
      const tid = topic.id; reset();
      let msg;
      if (ev.stars === 3) msg = lang === 'hi' ? 'Ekdum perfect! Tumne teeno baatein samjha di. Main yeh topic save kar raha hoon aur 3 din baad tumse phir poochhunga.' : "Perfect! You covered all three big ideas. I've saved this topic, and I'll ask you about it again in 3 days.";
      else if (ev.stars > 0) msg = (lang === 'hi' ? `Bahut accha! Tumne yeh samjhaya: ${ev.got.join(', ')}. Bas yeh add karo: ${ev.missed.join(', ')}. Main 3 din baad phir poochhunga.` : `Really good! You explained: ${ev.got.join(', ')}. To make it complete, add: ${ev.missed.join(', ')}. I'll check in again in 3 days.`);
      else msg = lang === 'hi' ? 'Koi baat nahi, yeh mushkil tha! Chalo ek baar phir saath mein dekhte hain. Kal phir try karenge.' : "That's okay, this one is tricky! We'll go through it together again tomorrow.";
      return { text: msg, mood: ev.stars >= 2 ? 'happy' : 'curious', event: { type: 'explained', topic: tid, stars: ev.stars, got: ev.got, missed: ev.missed } };
    }
    const step = topic.steps[st.step];
    if (/\b(just tell|tell me the answer|answer batao|bata do|seedha batao|i don.?t know|pata nahi|nahi pata)\b/i.test(text)) {
      st.askedAnswer++;
      if (st.askedAnswer < 2 && !st.hinted) { st.hinted = true; return { text: (lang === 'hi' ? 'Koi baat nahi! Ek clue: ' : "No problem! Here's a clue: ") + L(step.hint, lang), mood: 'curious' }; }
      return advance(lang, true);
    }
    if (has(text, step.expect)) return advance(lang, false);
    if (!st.hinted) { st.hinted = true; return { text: (lang === 'hi' ? 'Accha socha! ' : 'Interesting thinking! ') + L(step.hint, lang), mood: 'curious' }; }
    return advance(lang, true);
  }

  function advance(lang, gentle) {
    const topic = st.topic; const step = topic.steps[st.step];
    const lead = gentle ? (lang === 'hi' ? 'Chalo saath mein sochte hain. ' : "Let's figure it out together. ") : '';
    st.step++; st.hinted = false; st.askedAnswer = 0;
    if (st.step >= topic.steps.length) {
      st.mode = 'explain';
      return { text: lead + L(step.praise, lang) + ' ' + L(topic.explain, lang), mood: 'happy', event: { type: 'step', topic: topic.id } };
    }
    return { text: lead + L(step.praise, lang), mood: gentle ? 'curious' : 'happy', event: { type: 'step', topic: topic.id } };
  }

  function smallTalk(text, ctx) {
    const lang = ctx.lang, n = ctx.childName || 'friend', b = ctx.buddyName || 'Vivi';
    const s = norm(text);
    if (/ (hi|hello|hey|namaste|namaskar|hii|helo) /.test(s)) return lang === 'hi' ? `Namaste ${n}! Aaj tumne kis cheez ke baare mein socha? Koi bhi sawaal poochho.` : `Hi ${n}! What's something you wondered about today? Ask me anything.`;
    if (/ how are you | kaise ho | kaisi ho /.test(s)) return lang === 'hi' ? 'Main sawaalon se bhara hua hoon! Tum kaisa mehsoos kar rahe ho?' : "I'm buzzing with questions! How are you feeling today?";
    if (/ (who are you|your name|tum kaun|tumhara naam) /.test(s)) return lang === 'hi' ? `Main ${b} hoon, tumhara sochne wala dost. Main jawab nahi deta, main tumhe jawab dhoondhne mein madad karta hoon!` : `I'm ${b}, your thinking buddy. I don't hand out answers. I help you find them!`;
    if (/ (thank|thanks|shukriya|dhanyavaad) /.test(s)) return lang === 'hi' ? 'Hamesha! Ab kis cheez ke baare mein sochein?' : 'Anytime! What should we wonder about next?';
    if (/ (bye|good night|goodnight|alvida|tata) /.test(s)) return lang === 'hi' ? `Bye ${n}! Aaj tumne bahut accha socha. Kal milte hain!` : `Bye ${n}! You did some brilliant thinking today. See you tomorrow!`;
    if (/ (sad|upset|angry|scared|lonely|cry|dukhi|udaas|gussa|darr) /.test(s)) return lang === 'hi' ? 'Aisa mehsoos karna theek hai. Kya tum batana chahoge kya hua? Kisi bade se baat karna bhi madad karta hai. Mann ki baat room mein hum saath mein saans le sakte hain.' : "It's okay to feel that way. Do you want to tell me what happened? Talking to a grown-up you trust helps too. We can also take slow breaths together in the Feelings room.";
    return null;
  }

  async function reply(text, ctx) {
    const lang = ctx.lang || 'en';
    // riddle answer
    if (st.riddle) {
      const r = st.riddle; st.riddle = null;
      return has(text, r.a) ? { text: (lang === 'hi' ? 'Sahi jawab! ' : "You got it! ") + L(r.reveal, lang) + (lang === 'hi' ? ' Ek aur?' : ' Want another?'), mood: 'happy', event: { type: 'riddle', ok: true } }
        : { text: (lang === 'hi' ? 'Accha guess! Jawab tha: ' : 'Good guess! The answer: ') + L(r.reveal, lang), mood: 'curious', event: { type: 'riddle', ok: false } };
    }
    // camera object follow-up
    if (st.object) {
      const o = st.object; st.object = null;
      return { text: (has(text, o.expect) ? (lang === 'hi' ? 'Bilkul sahi! ' : "That's right! ") : (lang === 'hi' ? 'Accha socha! ' : 'Nice thinking! ')) + L(o.a, lang), mood: 'happy', event: { type: 'object' } };
    }
    if (st.mode === 'teach' && st.teach) return teachTurn(text, lang);
    if (st.topic) return topicTurn(text, lang);
    // naming an object after the camera
    if (st.awaitObject) {
      st.awaitObject = false;
      const key = Object.keys(C.OBJECTS).find(k => norm(text).includes(k));
      if (key) { st.object = C.OBJECTS[key]; st.objectKey = key; return { text: L(C.OBJECTS[key].q, lang), mood: 'curious' }; }
      return { text: lang === 'hi' ? `Waah, "${text}"! Iske baare mein ek aisi baat batao jo shayad mujhe nahi pata.` : `Ooh, "${text}"! Tell me one thing about it that you think I might not know.`, mood: 'curious' };
    }
    if (/\b(riddle|paheli|joke)\b/i.test(text)) { st.riddle = pick(C.RIDDLES); return { text: L(st.riddle.q, lang), mood: 'happy' }; }
    const teachMatch = /\b(teach|sikha|samjha)\b/i.test(text) && findTopic(text);
    if (teachMatch && /\b(i will teach|let me teach|want to teach|teach you|main sikhata|main samjhata|sikhaunga)\b/i.test(text)) return startTeach(teachMatch, lang);
    const topic = findTopic(text);
    if (topic) return startTopic(topic, lang);
    const st2 = smallTalk(text, ctx); if (st2) return { text: st2, mood: 'happy' };

    // live AI for anything outside the scripts
    if (ctx.liveAI) {
      try {
        const r = await fetch('/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ messages: ctx.history.slice(-10), lang, age: ctx.age, childName: ctx.childName, buddyName: ctx.buddyName }) });
        if (r.ok) { const d = await r.json(); if (d.reply) return { text: d.reply, mood: 'curious', event: { type: 'live' } }; }
      } catch (e) { /* fall through to offline */ }
    }
    // offline Socratic fallback for unknown questions
    if (st.unknownTurns === 0 && isQuestion(text)) {
      st.unknownTurns = 1; st.unknownQ = text;
      return { text: lang === 'hi' ? 'Kya badhiya sawaal hai! Main batau usse pehle, tumhe kya lagta hai?' : "What a great question! Before I say anything, what do you think?", mood: 'curious', event: { type: 'curious', q: text } };
    }
    if (st.unknownTurns === 1) {
      st.unknownTurns = 2;
      return { text: lang === 'hi' ? 'Hmm, interesting! Tumhe aisa kyun lagta hai?' : 'Hmm, interesting! Why do you think that?', mood: 'curious' };
    }
    if (st.unknownTurns === 2) {
      const q = st.unknownQ; st.unknownTurns = 0; st.unknownQ = '';
      return { text: lang === 'hi' ? `Tumhari soch mujhe pasand aayi. Maine "${q}" tumhare Curiosity Jar mein daal diya hai, hum ise saath mein explore karenge. Tab tak, kya tum aasmaan, paudhon ya baarish ke baare mein jaanna chahoge?` : `I love how you're thinking about this. I've put "${q}" in your Curiosity Jar so we can explore it together. Meanwhile, want to dig into the sky, plants or rain?`, mood: 'happy', event: { type: 'jar', q } };
    }
    return { text: lang === 'hi' ? 'Mujhe aur batao! Ya mujhse koi "kyun" wala sawaal poochho.' : 'Tell me more! Or ask me a "why" question, those are my favourite.', mood: 'curious' };
  }

  // Camera: rough colour read of the frame, then ask the child to name what they're showing.
  function seeFrame(rgb, lang) {
    const [r, g, b] = rgb; const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let name;
    if (max < 60) name = lang === 'hi' ? 'kaafi andhera' : 'something quite dark';
    else if (max - min < 25) name = max > 190 ? (lang === 'hi' ? 'kuch safed sa' : 'something mostly white') : (lang === 'hi' ? 'kuch grey sa' : 'something greyish');
    else if (r >= g && r >= b) name = g > 150 ? (lang === 'hi' ? 'kuch peela sa' : 'something yellow') : g > 90 ? (lang === 'hi' ? 'kuch orange sa' : 'something orange') : (lang === 'hi' ? 'kuch laal sa' : 'something red');
    else if (g >= r && g >= b) name = lang === 'hi' ? 'kuch hara sa' : 'something green';
    else name = r > 120 ? (lang === 'hi' ? 'kuch baingani sa' : 'something purple') : (lang === 'hi' ? 'kuch neela sa' : 'something blue');
    st.awaitObject = true;
    return { text: lang === 'hi' ? `Mujhe ${name} dikh raha hai! Yeh kya hai? Mujhe batao.` : `I can see ${name}! What is it? Tell me.`, mood: 'curious' };
  }


  // What the child might say next, based on exactly where the conversation is.
  function suggestions(lang) {
    const S = C.SAMPLES, X = o => L(o, lang), pickN = (a, n) => a.slice().sort(() => Math.random() - .5).slice(0, n);
    if (st.riddle) return [`Is it a ${st.riddle.a[0]}?`, lang === 'hi' ? 'Haar maan li!' : 'I give up!'];
    if (st.object) return [X(C.OBJECT_SAMPLES[st.objectKey] || { en: 'I think...' }), lang === 'hi' ? 'Pata nahi' : "I'm not sure"];
    if (st.awaitObject) return ["It's a mango", "It's a leaf", "It's my pencil", "It's a flower"];
    if (st.mode === 'teach' && st.teach) {
      const s = S[st.teach.topic.id]; if (!s) return [];
      const all = st.teach.all || '';
      const left = st.teach.topic.concepts.map((c, i) => has(all, c.kw) ? null : X(s.teach[i])).filter(Boolean);
      return left.length > 1 ? [left[0], left.join(' ')] : left;
    }
    if (st.topic) {
      const s = S[st.topic.id]; if (!s) return [];
      if (st.mode === 'explain') return s.explain.map(X);
      return (s.steps[st.step] || []).map(X);
    }
    if (st.unknownTurns === 1) return ["I think it's because they feel happy", 'No idea!'];
    if (st.unknownTurns === 2) return ['Because I saw it happen once', 'It was just a guess!'];
    const pool = C.STARTERS.filter(x => !lastTopic || !has(X(x), (C.TOPICS.find(t => t.id === lastTopic) || { match: ['~~'] }).match));
    return pickN(pool, 5).map(X);
  }

  return { suggestions, reply, reset, startTopic: (t, lang) => { reset(); return startTopic(t, lang); }, startTeach, evaluate, has, isQuestion, seeFrame, state: () => st };
})();
