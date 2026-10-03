/* Brain games. Each game targets one thinking skill (see docs) and reports a score to the app.
   Every game ends with a "why" or "how" question from Vivi, so play turns into talk. */

window.Games = (() => {
  const el = (h) => { const d = document.createElement('div'); d.innerHTML = h.trim(); return d.firstElementChild; };
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  const LIST = [
    { id: 'chess', name: 'Chess coach', skill: 'Planning ahead', cat: 'Plan', icon: '♞', blurb: 'Real game positions. What is your best move?', fresh: true },
    { id: 'memory', name: 'Memory match', skill: 'Working memory', cat: 'Memory', icon: '🃏', blurb: 'Find the pairs in as few moves as you can.' },
    { id: 'simon', name: 'Echo pads', skill: 'Sequence memory', cat: 'Memory', icon: '🎵', blurb: 'Watch the pattern, then tap it back.' },
    { id: 'stroop', name: 'Colour clash', skill: 'Focus and self-control', cat: 'Focus', icon: '🎨', blurb: 'Tap the colour of the ink, not the word.' },
    { id: 'mango', name: 'Mango catch', skill: 'Self-control (ages 4 to 7)', cat: 'Focus', icon: '🥭', blurb: 'Tap the mangoes. Never tap the chillies!', fresh: true },
    { id: 'switch', name: 'Rule switch', skill: 'Flexible thinking', cat: 'Focus', icon: '🔀', blurb: 'Sort by colour, then by shape. Watch the rule!', fresh: true },
    { id: 'sudoku', name: 'Mini sudoku', skill: 'Logic', cat: 'Logic', icon: '🔢', blurb: 'Fill 1 to 4 so no row, column or box repeats.' },
    { id: 'odd', name: 'Odd one out', skill: 'Flexible thinking', cat: 'Logic', icon: '🧩', blurb: 'Spot the one that does not belong, then say why.' },
    { id: 'pattern', name: 'What comes next?', skill: 'Pattern reasoning', cat: 'Logic', icon: '🔷', blurb: 'Crack the rule behind the sequence.' },
    { id: 'hanoi', name: 'Tower puzzle', skill: 'Planning ahead', cat: 'Plan', icon: '🗼', blurb: 'Move the tower, one disc at a time.' },
    { id: 'robot', name: 'Code the robot', skill: 'Computational thinking', cat: 'Plan', icon: '🤖', blurb: 'Give Vivi arrow steps to reach the star.', fresh: true },
    { id: 'ninja', name: 'Number ninja', skill: 'Mental maths', cat: 'Numbers', icon: '🥷', blurb: 'Vedic tricks for fast sums.' },
    { id: 'shop', name: 'Kirana shop', skill: 'Money sense', cat: 'Numbers', icon: '🛒', blurb: 'Run the shop. Give the right change.', fresh: true }
  ];

  function memory(root, api) {
    const faces = shuffle(['🥭', '🐘', '🪁', '🦚', '🌶️', '🛺']).slice(0, 6);
    const deck = shuffle([...faces, ...faces]);
    let open = [], moves = 0, found = 0, lock = false;
    root.innerHTML = `<p class="g-status">Moves: <b id="mv">0</b></p><div class="mem-grid"></div>`;
    const grid = root.querySelector('.mem-grid');
    deck.forEach((f, i) => {
      const c = el(`<button class="mem-card" aria-label="Card ${i + 1}"><span>${f}</span></button>`);
      c.onclick = () => {
        if (lock || c.classList.contains('up')) return;
        c.classList.add('up'); open.push(c);
        if (open.length === 2) {
          moves++; root.querySelector('#mv').textContent = moves; lock = true;
          const [a, b] = open;
          if (a.textContent === b.textContent) { a.classList.add('done'); b.classList.add('done'); open = []; lock = false; found++;
            if (found === faces.length) api.done(Math.max(10, 100 - (moves - 6) * 8), `All pairs in ${moves} moves! What trick did you use to remember where things were?`);
          } else setTimeout(() => { a.classList.remove('up'); b.classList.remove('up'); open = []; lock = false; }, 750);
        }
      };
      grid.appendChild(c);
    });
  }

  function simon(root, api) {
    const cols = ['#6A54C0', '#E4577A', '#2E9E6B', '#E0A526'];
    let seq = [], input = [], busy = false, level = 0;
    root.innerHTML = `<p class="g-status">Level <b id="lv">1</b></p><div class="simon"></div><button class="btn primary" id="go">Start</button>`;
    const pads = cols.map((c, i) => { const p = el(`<button class="pad" style="--c:${c}" aria-label="Pad ${i + 1}"></button>`); root.querySelector('.simon').appendChild(p); return p; });
    const flash = (i, ms = 420) => new Promise(r => { pads[i].classList.add('lit'); setTimeout(() => { pads[i].classList.remove('lit'); setTimeout(r, 160); }, ms); });
    async function play() { busy = true; for (const i of seq) await flash(i); busy = false; input = []; }
    function next() { level++; root.querySelector('#lv').textContent = level; seq.push(Math.floor(Math.random() * 4)); setTimeout(play, 500); }
    pads.forEach((p, i) => p.onclick = async () => {
      if (busy || !seq.length) return; await flash(i, 180); input.push(i);
      if (input[input.length - 1] !== seq[input.length - 1]) { api.done(Math.min(100, (level - 1) * 12), `You remembered ${level - 1} steps! Did you say the colours in your head, or picture them?`); seq = []; return; }
      if (input.length === seq.length) next();
    });
    root.querySelector('#go').onclick = e => { e.target.remove(); seq = []; level = 0; next(); };
  }

  function stroop(root, api) {
    const C = [['RED', '#D33F49'], ['BLUE', '#2F7FC1'], ['GREEN', '#2E9E6B'], ['YELLOW', '#D9A21B']];
    let score = 0, total = 0, time = 30, cur;
    root.innerHTML = `<p class="g-status">Time <b id="tm">30</b>s · Score <b id="sc">0</b></p><div class="stroop-word" id="sw"></div><div class="stroop-btns"></div>`;
    const btns = root.querySelector('.stroop-btns');
    C.forEach(([n, hex]) => { const b = el(`<button class="btn chip" style="background:${hex};color:#fff">${n[0] + n.slice(1).toLowerCase()}</button>`); b.onclick = () => answer(hex); btns.appendChild(b); });
    function nextWord() { const w = C[Math.floor(Math.random() * 4)], ink = C[Math.floor(Math.random() * 4)]; cur = ink[1]; const s = root.querySelector('#sw'); s.textContent = w[0]; s.style.color = ink[1]; }
    function answer(hex) { total++; if (hex === cur) score++; root.querySelector('#sc').textContent = score; nextWord(); }
    nextWord();
    const t = setInterval(() => { time--; const tm = root.querySelector('#tm'); if (!tm) return clearInterval(t); tm.textContent = time; if (time <= 0) { clearInterval(t); api.done(Math.min(100, score * 5), `${score} right out of ${total}! Why do you think it's so hard when the word and the colour don't match?`); } }, 1000);
  }

  function sudoku(root, api) {
    const solved = [[1, 2, 3, 4], [3, 4, 1, 2], [2, 1, 4, 3], [4, 3, 2, 1]];
    const map = shuffle([1, 2, 3, 4]); const sol = solved.map(r => r.map(v => map[v - 1]));
    const givens = new Set(shuffle([...Array(16).keys()]).slice(0, 7));
    root.innerHTML = `<p class="g-status">Tap a square to cycle 1 → 4</p><div class="sudoku"></div><button class="btn primary" id="chk">Check</button>`;
    const g = root.querySelector('.sudoku'); const cells = [];
    for (let i = 0; i < 16; i++) {
      const r = Math.floor(i / 4), c = i % 4; const given = givens.has(i);
      const b = el(`<button class="sq ${given ? 'given' : ''}" data-v="${given ? sol[r][c] : 0}">${given ? sol[r][c] : ''}</button>`);
      if ((c === 1) ) b.classList.add('br'); if (r === 1) b.classList.add('bb');
      if (!given) b.onclick = () => { const v = (+b.dataset.v % 4) + 1; b.dataset.v = v; b.textContent = v; b.classList.remove('bad'); };
      cells.push(b); g.appendChild(b);
    }
    root.querySelector('#chk').onclick = () => {
      let ok = true; cells.forEach((b, i) => { const r = Math.floor(i / 4), c = i % 4; if (+b.dataset.v !== sol[r][c]) { ok = false; if (+b.dataset.v) b.classList.add('bad'); } });
      if (ok) api.done(100, 'Solved! Which square did you fill first, and how did you know?');
      else api.say('Not quite yet. Look at the red squares: which row or box has a repeat?');
    };
  }

  function hanoi(root, api) {
    const pegs = [[3, 2, 1], [], []]; let sel = null, moves = 0;
    root.innerHTML = `<p class="g-status">Moves: <b id="mv">0</b> · Best possible: 7</p><div class="hanoi"></div>`;
    const wrap = root.querySelector('.hanoi');
    function draw() {
      wrap.innerHTML = '';
      pegs.forEach((p, i) => {
        const peg = el(`<button class="peg ${sel === i ? 'sel' : ''}" aria-label="Peg ${i + 1}"><span class="rod"></span></button>`);
        p.forEach(d => peg.appendChild(el(`<span class="disc d${d}"></span>`)));
        peg.onclick = () => {
          if (sel === null) { if (p.length) sel = i; }
          else { const from = pegs[sel], d = from[from.length - 1]; if (!p.length || p[p.length - 1] > d) { p.push(from.pop()); moves++; root.querySelector('#mv').textContent = moves; } sel = null; }
          draw();
          if (pegs[2].length === 3) api.done(moves <= 7 ? 100 : Math.max(30, 100 - (moves - 7) * 10), `Done in ${moves} moves! What was your plan for the smallest disc?`);
        };
        wrap.appendChild(peg);
      });
    }
    draw();
  }

  function ninja(root, api) {
    const qs = [];
    for (let i = 0; i < 4; i++) { const a = 12 + Math.floor(Math.random() * 70); qs.push({ q: `${a} × 11`, a: a * 11, tip: 'Trick: split the digits and put their sum in the middle. 23 × 11 → 2 (2+3) 3 = 253.' }); }
    [15, 25, 35, 45, 65].sort(() => Math.random() - .5).slice(0, 3).forEach(n => { const t = Math.floor(n / 10); qs.push({ q: `${n}²`, a: n * n, tip: `Trick: ${t} × ${t + 1} = ${t * (t + 1)}, then add 25 → ${n * n}.` }); });
    qs.push({ q: '99 × 7', a: 693, tip: 'Trick: 100 × 7 = 700, then take away 7.' });
    let i = 0, score = 0;
    root.innerHTML = `<p class="g-status">Question <b id="qn">1</b> of ${qs.length} · Score <b id="sc">0</b></p><div class="ninja-q" id="q"></div><div class="row"><input id="ans" inputmode="numeric" class="input" aria-label="Your answer" placeholder="Answer"><button class="btn primary" id="ok">Check</button></div><p class="g-tip" id="tip"></p>`;
    const show = () => { root.querySelector('#q').textContent = qs[i].q; root.querySelector('#qn').textContent = i + 1; root.querySelector('#ans').value = ''; root.querySelector('#ans').focus(); };
    const check = () => {
      const v = +root.querySelector('#ans').value; const right = v === qs[i].a; if (right) score++;
      root.querySelector('#sc').textContent = score;
      root.querySelector('#tip').innerHTML = (right ? '✅ Correct! ' : `❌ It's ${qs[i].a}. `) + qs[i].tip;
      i++; if (i >= qs.length) api.done(Math.round(score / qs.length * 100), `${score} of ${qs.length}! Which trick will you show your friends?`); else setTimeout(show, 1400);
    };
    root.querySelector('#ok').onclick = check; root.querySelector('#ans').onkeydown = e => { if (e.key === 'Enter') check(); };
    show();
  }

  function odd(root, api) {
    const sets = shuffle([
      { items: ['🍎', '🍌', '🥕', '🍇'], odd: 2, why: 'a carrot is a vegetable, the rest are fruits' },
      { items: ['🐟', '🐬', '🐙', '🐄'], odd: 3, why: 'a cow lives on land, the rest live in water' },
      { items: ['✈️', '🚁', '🚂', '🪁'], odd: 2, why: "a train can't fly" },
      { items: ['🔺', '⬛', '🔷', '🟢'], odd: 3, why: 'the circle has no corners' },
      { items: ['2', '4', '7', '8'], odd: 2, why: '7 is odd, the rest are even' }
    ]).slice(0, 4);
    let i = 0, score = 0;
    root.innerHTML = `<p class="g-status">Round <b id="rd">1</b> of 4</p><div class="odd-row"></div><p class="g-tip" id="why"></p>`;
    const show = () => {
      root.querySelector('#rd').textContent = i + 1; root.querySelector('#why').textContent = '';
      const row = root.querySelector('.odd-row'); row.innerHTML = '';
      sets[i].items.forEach((it, k) => { const b = el(`<button class="odd-item">${it}</button>`); b.onclick = () => pickIt(k, b); row.appendChild(b); });
    };
    const pickIt = (k, b) => {
      const s = sets[i]; const right = k === s.odd; if (right) score++;
      b.classList.add(right ? 'good' : 'bad');
      root.querySelector('#why').textContent = (right ? 'Yes! ' : 'Hmm, not that one. ') + 'One reason: ' + s.why + '. Can you think of another?';
      api.say(right ? 'Nice! Can you think of a different reason it is the odd one out?' : 'Good try. Look again: what do three of them share?');
      i++; setTimeout(() => i >= sets.length ? api.done(score * 25, `${score} of 4! There's often more than one right answer here. Did you ever spot a different odd one out?`) : show(), 2200);
    };
    show();
  }

  function pattern(root, api) {
    const qs = shuffle([
      { seq: ['2', '4', '6', '8'], opts: ['9', '10', '12'], a: '10', rule: 'add 2 each time' },
      { seq: ['🔴', '🔵', '🔴', '🔵'], opts: ['🔴', '🔵', '🟢'], a: '🔴', rule: 'red and blue take turns' },
      { seq: ['1', '2', '4', '8'], opts: ['10', '12', '16'], a: '16', rule: 'double each time' },
      { seq: ['🌑', '🌓', '🌕', '🌗'], opts: ['🌑', '🌕', '🌓'], a: '🌑', rule: 'the moon goes through its phases' },
      { seq: ['3', '6', '9', '12'], opts: ['14', '15', '16'], a: '15', rule: 'the 3 times table' }
    ]).slice(0, 4);
    let i = 0, score = 0;
    root.innerHTML = `<p class="g-status">Puzzle <b id="pn">1</b> of 4</p><div class="pat-seq" id="sq"></div><div class="row" id="op"></div><p class="g-tip" id="rl"></p>`;
    const show = () => {
      const q = qs[i]; root.querySelector('#pn').textContent = i + 1; root.querySelector('#rl').textContent = '';
      root.querySelector('#sq').innerHTML = q.seq.map(s => `<span>${s}</span>`).join('') + '<span class="q">?</span>';
      const op = root.querySelector('#op'); op.innerHTML = '';
      q.opts.forEach(o => { const b = el(`<button class="btn chip big">${o}</button>`); b.onclick = () => { const r = o === q.a; if (r) score++; root.querySelector('#rl').textContent = (r ? 'Correct! ' : `It was ${q.a}. `) + 'The rule: ' + q.rule + '.'; i++; setTimeout(() => i >= qs.length ? api.done(score * 25, `${score} of 4! Make up your own pattern and tell me the rule.`) : show(), 1800); }; op.appendChild(b); });
    };
    show();
  }


  // ---------- chess coach: real positions, find the best move ----------
  // Board: 8 strings, rank 8 first. Uppercase = white, lowercase = black, '.' = empty.
  const PZ = [
    { tag: 'Checkmate in 1', title: 'The back-rank trap', board: ['......k.', '.....ppp', '........', '........', '........', '........', '........', 'R.....K.'],
      prompt: 'White to move. Black\'s king is hiding behind its own pawns. Can you checkmate in one move?', sol: [['a1', 'a8']],
      hint: 'Your rook loves long, open lines. Which line leads straight to the king\'s row?', explain: 'Ra8 is checkmate! The rook attacks the whole 8th row, and the black pawns block their own king\'s escape squares.', ask: 'Why couldn\'t the black king escape?' },
    { tag: 'Checkmate in 1', title: 'The four-move surprise', board: ['r.bqkb.r', 'pppp.ppp', '..n..n..', '....p..Q', '..B.P...', '........', 'PPPP.PPP', 'RNB.K.NR'],
      prompt: 'White to move. Your queen and bishop are both aiming at one weak square. Find checkmate!', sol: [['h5', 'f7']],
      hint: 'Look for a black pawn that only the king protects.', explain: 'Qxf7 is checkmate! The bishop on c4 protects the queen, so the king cannot take it. This is called Scholar\'s Mate.', ask: 'How could Black have stopped this one move earlier?' },
    { tag: 'Tactic: fork', title: 'The knight\'s double attack', board: ['...q...k', '......pp', '........', '....N...', '........', '........', '........', '......K.'],
      prompt: 'White to move. Can your knight attack two things at once?', sol: [['e5', 'f7']],
      hint: 'Knights jump in an L shape. Find a square that hits the king and the queen.', explain: 'Nf7+ is a fork! The knight checks the king and attacks the queen at the same time. After the king moves, you win the queen.', ask: 'Why is a fork so powerful?' },
    { tag: 'Checkmate in 1', title: 'King and queen team-up', board: ['k.......', '........', '.K......', '........', '........', '........', '........', '.......Q'],
      prompt: 'White to move. Your king is already close. Finish the game in one move.', sol: [['h1', 'h8'], ['h1', 'b7']],
      hint: 'Your king guards a7 and b7. Can the queen cover the rest?', explain: 'Checkmate! The queen gives check and your king guards every escape square. Teamwork wins.', ask: 'Which squares was your king guarding?' },
    { tag: 'Free piece', title: 'Spot the free queen', board: ['......k.', '.....ppp', '........', '....q...', '........', '........', '.....PPP', '....R.K.'],
      prompt: 'White to move. Black left something unprotected. What do you do?', sol: [['e1', 'e5']],
      hint: 'Before every move, ask: what is not protected?', explain: 'Rxe5 wins the queen for free! Nothing black can take your rook back. Always check for free pieces.', ask: 'What question should you ask yourself before every move?' },
    { tag: 'Promotion', title: 'The pawn\'s big dream', board: ['........', '.P....k.', '........', '........', '........', '........', '........', '....K...'],
      prompt: 'White to move. One of your pieces can become much more powerful. Which move?', sol: [['b7', 'b8']],
      hint: 'What happens when a pawn reaches the other end of the board?', explain: 'b8 makes a new queen! A pawn that reaches the last row can become a queen. The black king is too far away to stop it.', ask: 'Why is the black king too late?' }
  ];
  const VS = '\uFE0E';   // force text glyphs, not emoji
  const GLYPH = { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙', k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };
  function chess(root, api) {
    let i = 0, score = 0, sel = null, tries = 0;
    const sqName = (r, c) => 'abcdefgh'[c] + (8 - r);
    const show = () => {
      const z = PZ[i]; sel = null; tries = 0;
      root.innerHTML = `<div class="chess-wrap"><div class="board" id="bd"></div><div class="chess-info"><span class="chess-tag">${z.tag}</span><h3>${z.title}</h3><p>${z.prompt}</p><p class="g-status">Puzzle ${i + 1} of ${PZ.length} · Solved ${score}</p><p class="g-tip" id="fb">Tap one of your white pieces, then tap where it should go.</p><div class="row" id="ctl"></div></div></div>`;
      const bd = root.querySelector('#bd');
      for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
        const ch = z.board[r][c]; const dark = (r + c) % 2 === 1; const name = sqName(r, c);
        const b = el(`<button class="cell ${dark ? 'dk' : ''}" data-sq="${name}" aria-label="${name}${ch !== '.' ? ' ' + (ch === ch.toUpperCase() ? 'white ' : 'black ') + ({ k: 'king', q: 'queen', r: 'rook', b: 'bishop', n: 'knight', p: 'pawn' })[ch.toLowerCase()] : ''}">${ch !== '.' ? `<span class="pc ${ch === ch.toUpperCase() ? 'w' : 'b'}">${GLYPH[ch]}${VS}</span>` : ''}${c === 0 ? `<span class="co">${8 - r}</span>` : ''}</button>`);
        b.onclick = () => tap(name, ch, b); bd.appendChild(b);
      }
    };
    const tap = (name, ch, b) => {
      const z = PZ[i]; const fb = root.querySelector('#fb');
      if (ch !== '.' && ch === ch.toUpperCase()) { root.querySelectorAll('.cell').forEach(x => x.classList.remove('sel', 'bad')); sel = name; b.classList.add('sel'); fb.textContent = `Moving the piece on ${name}. Now tap where it goes.`; return; }
      if (!sel) { fb.textContent = 'First tap one of your white pieces.'; return; }
      const ok = z.sol.some(([f, t]) => f === sel && t === name);
      if (ok) {
        score++; b.classList.add('good');
        const from = root.querySelector(`[data-sq="${sel}"]`); b.innerHTML = from.innerHTML.replace(/<span class="co">.*?<\/span>/, ''); from.innerHTML = '';
        fb.innerHTML = `✅ <b>Brilliant!</b> ${z.explain}`; api.say(z.ask);
        root.querySelector('#ctl').innerHTML = `<button class="btn primary" id="nx">${i + 1 < PZ.length ? 'Next position' : 'Finish'}</button>`;
        root.querySelector('#nx').onclick = () => { i++; i >= PZ.length ? api.done(Math.round(score / PZ.length * 100), `You solved ${score} of ${PZ.length} positions! Which one was trickiest, and how did you crack it?`) : show(); };
      } else {
        tries++; b.classList.add('bad'); setTimeout(() => b.classList.remove('bad'), 700);
        if (tries === 1) { fb.innerHTML = `Not quite. <b>Hint:</b> ${z.hint}`; api.say('Good try! Here is a clue: ' + z.hint); }
        else {
          const [f, t] = z.sol[0]; fb.innerHTML = `The best move was <b>${f} to ${t}</b>. ${z.explain}`;
          root.querySelector(`[data-sq="${f}"]`).classList.add('sel'); root.querySelector(`[data-sq="${t}"]`).classList.add('good');
          root.querySelector('#ctl').innerHTML = `<button class="btn primary" id="nx">${i + 1 < PZ.length ? 'Next position' : 'Finish'}</button>`;
          root.querySelector('#nx').onclick = () => { i++; i >= PZ.length ? api.done(Math.round(score / PZ.length * 100), `You solved ${score} of ${PZ.length}! Which idea will you look for in your next real game?`) : show(); };
        }
      }
    };
    show();
  }

  // ---------- mango catch: go / no-go ----------
  function mango(root, api) {
    let n = 0, hits = 0, misses = 0, wrong = 0, cur = null, tapped = false, timer;
    root.innerHTML = `<p class="g-status">Tap only the <b>mangoes</b> 🥭. Never the chillies 🌶️! <span id="sc"></span></p><button class="gng" id="gng" aria-label="Tap the mango">▶</button><p class="hint">Start, then watch closely. Things move fast!</p>`;
    const box = root.querySelector('#gng');
    const step = () => {
      if (cur === '🥭' && !tapped) misses++;
      if (n >= 24) { clearTimeout(timer); const s = Math.max(0, Math.round((hits - wrong) / Math.max(1, hits + misses) * 100)); return api.done(s, `You caught ${hits} mangoes and tapped ${wrong} chillies. What helped you stop yourself from tapping the chillies?`); }
      n++; tapped = false; box.className = 'gng'; cur = Math.random() < .72 ? '🥭' : '🌶️'; box.textContent = cur;
      root.querySelector('#sc').textContent = `· Caught ${hits} · Oops ${wrong}`;
      timer = setTimeout(step, Math.max(650, 1100 - n * 15));
    };
    box.onclick = () => { if (!cur) { step(); return; } if (tapped) return; tapped = true; if (cur === '🥭') { hits++; box.classList.add('hit'); } else { wrong++; box.classList.add('miss'); } };
  }

  // ---------- rule switch: card sorting with a changing rule (DCCS) ----------
  function switcher(root, api) {
    const cards = [['🔴', 'red', 'circle'], ['🔵', 'blue', 'circle'], ['⭐', 'yellow', 'star'], ['🟦', 'blue', 'square']];
    // targets: left = red / circle, right = blue / star
    const deck = []; for (let k = 0; k < 16; k++) deck.push(k);
    const items = [{ e: '🔴', color: 'red', shape: 'circle' }, { e: '🔵', color: 'blue', shape: 'circle' }, { e: '❤️', color: 'red', shape: 'heart' }, { e: '💙', color: 'blue', shape: 'heart' }];
    let i = 0, score = 0;
    const rule = () => (Math.floor(i / 4) % 2 === 0 ? 'colour' : 'shape');
    root.innerHTML = `<p class="g-status">Round <b id="rd">1</b> of 16 · Score <b id="sc">0</b></p><div class="rule" id="rl"></div><div class="sort-card" id="card"></div><div class="bins"><button class="bin" id="L"><span id="lt"></span><small id="ll"></small></button><button class="bin" id="R"><span id="rt"></span><small id="rl2"></small></button></div>`;
    const show = () => {
      const it = items[Math.floor(Math.random() * 4)]; root.querySelector('#card').textContent = it.e; root.querySelector('#card').dataset.k = JSON.stringify(it);
      const r = rule(); root.querySelector('#rl').textContent = r === 'colour' ? 'Sort by COLOUR' : 'Sort by SHAPE';
      root.querySelector('#lt').textContent = r === 'colour' ? '🟥' : '⚪'; root.querySelector('#ll').textContent = r === 'colour' ? 'red' : 'circles';
      root.querySelector('#rt').textContent = r === 'colour' ? '🟦' : '🤍'; root.querySelector('#rl2').textContent = r === 'colour' ? 'blue' : 'hearts';
      root.querySelector('#rd').textContent = i + 1;
      if (i % 4 === 0 && i) api.say('The rule just changed! Now sort by ' + r + '.');
    };
    const pickSide = side => {
      const it = JSON.parse(root.querySelector('#card').dataset.k); const r = rule();
      const correct = r === 'colour' ? (it.color === 'red' ? 'L' : 'R') : (it.shape === 'circle' ? 'L' : 'R');
      if (side === correct) score++; root.querySelector('#sc').textContent = score;
      const b = root.querySelector('#' + side); b.style.borderColor = side === correct ? 'var(--leaf)' : 'var(--berry)'; setTimeout(() => b.style.borderColor = '', 300);
      i++; if (i >= 16) return api.done(Math.round(score / 16 * 100), `${score} of 16! Was it harder right after the rule changed? What did you do to switch your brain?`); show();
    };
    root.querySelector('#L').onclick = () => pickSide('L'); root.querySelector('#R').onclick = () => pickSide('R');
    show();
  }

  // ---------- kirana shop: money sense ----------
  function shop(root, api) {
    const goods = [['🍪', 'Biscuits', 25], ['🥛', 'Milk', 32], ['🍫', 'Chocolate', 45], ['🍚', 'Rice (1 kg)', 68], ['🧼', 'Soap', 38], ['🥚', 'Eggs (6)', 42], ['🍞', 'Bread', 40], ['🧃', 'Juice', 55]];
    const rounds = shuffle(goods).slice(0, 6); let i = 0, score = 0;
    const show = () => {
      const [e, name, price] = rounds[i]; const paid = price <= 50 ? (price < 20 ? 20 : 50) : 100; const change = paid - price;
      const opts = shuffle([change, change + 10, Math.max(1, change - 5)].filter((v, k, a) => a.indexOf(v) === k));
      root.innerHTML = `<p class="g-status">Customer ${i + 1} of 6 · Score ${score}</p><div class="shop"><span class="big-emoji">${e}</span><div><b>${name} costs ₹${price}</b><p>The customer gives you a <b>₹${paid}</b> note. How much change do you give back?</p></div></div><div class="row" id="op"></div><p class="g-tip" id="fb"></p>`;
      opts.forEach(o => { const b = el(`<button class="btn chip big">₹${o}</button>`); b.onclick = () => {
        const ok = o === change; if (ok) score++;
        root.querySelector('#fb').innerHTML = ok ? `✅ Right! ₹${paid} minus ₹${price} is ₹${change}.` : `Not quite. Count up from ₹${price} to ₹${paid}: that's <b>₹${change}</b>.`;
        root.querySelectorAll('#op button').forEach(x => x.disabled = true);
        i++; setTimeout(() => i >= rounds.length ? api.done(Math.round(score / rounds.length * 100), `${score} of 6 customers got the right change! How did you work out the change in your head?`) : show(), 1700);
      }; root.querySelector('#op').appendChild(b); });
    };
    show();
  }

  // ---------- code the robot: sequencing ----------
  const LEVELS = [
    { start: [4, 0], star: [0, 4], walls: [[2, 2], [3, 2], [1, 1]] },
    { start: [4, 2], star: [0, 2], walls: [[2, 1], [2, 2], [2, 3]] },
    { start: [0, 0], star: [4, 4], walls: [[0, 2], [1, 2], [2, 2], [3, 4], [4, 1]] }
  ];
  function robot(root, api) {
    let lv = 0, prog = [], solved = 0;
    const D = { '↑': [-1, 0], '↓': [1, 0], '←': [0, -1], '→': [0, 1] };
    const show = () => {
      const L = LEVELS[lv]; prog = [];
      root.innerHTML = `<p class="g-status">Level ${lv + 1} of ${LEVELS.length}. Plan every step, then press Run.</p><div class="grid5" id="g"></div><div class="code-row" id="code" aria-label="Your program"></div>
        <div class="row">${Object.keys(D).map(k => `<button class="btn chip big" data-d="${k}">${k}</button>`).join('')}<button class="btn" id="undo">Undo</button><button class="btn primary" id="run">Run ▶</button></div><p class="g-tip" id="fb"></p>`;
      draw(L.start);
      root.querySelectorAll('[data-d]').forEach(b => b.onclick = () => { if (prog.length < 14) { prog.push(b.dataset.d); code(); } });
      root.querySelector('#undo').onclick = () => { prog.pop(); code(); };
      root.querySelector('#run').onclick = run;
    };
    const code = () => root.querySelector('#code').innerHTML = prog.map(p => `<span>${p}</span>`).join('');
    const draw = (pos, path = []) => {
      const L = LEVELS[lv]; const g = root.querySelector('#g'); g.innerHTML = '';
      for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) {
        const wall = L.walls.some(w => w[0] === r && w[1] === c), here = pos[0] === r && pos[1] === c, star = L.star[0] === r && L.star[1] === c;
        g.appendChild(el(`<div class="g5 ${wall ? 'wall' : ''} ${path.some(p => p[0] === r && p[1] === c) ? 'path' : ''}">${here ? '🤖' : star ? '⭐' : wall ? '🧱' : ''}</div>`));
      }
    };
    const run = async () => {
      const L = LEVELS[lv]; let pos = [...L.start]; const path = [];
      for (const p of prog) {
        const n = [pos[0] + D[p][0], pos[1] + D[p][1]];
        if (n[0] < 0 || n[0] > 4 || n[1] < 0 || n[1] > 4 || L.walls.some(w => w[0] === n[0] && w[1] === n[1])) { root.querySelector('#fb').textContent = 'Bonk! Vivi hit a wall. Which step went wrong?'; api.say('Oops, I bumped into something. Can you find the bug in the program?'); return; }
        path.push(pos); pos = n; draw(pos, path); await new Promise(z => setTimeout(z, 280));
      }
      if (pos[0] === L.star[0] && pos[1] === L.star[1]) {
        solved++; root.querySelector('#fb').textContent = `⭐ You did it in ${prog.length} steps!`;
        lv++; setTimeout(() => lv >= LEVELS.length ? api.done(Math.round(solved / LEVELS.length * 100), 'All levels done! When your program had a bug, how did you find it?') : show(), 1200);
      } else { root.querySelector('#fb').textContent = 'Vivi stopped before the star. Add more steps, or fix the path.'; }
    };
    show();
  }

  const RUN = { memory, simon, stroop, sudoku, hanoi, ninja, odd, pattern, chess, mango, switch: switcher, shop, robot };
  return { LIST, run: (id, root, api) => RUN[id](root, api) };
})();
