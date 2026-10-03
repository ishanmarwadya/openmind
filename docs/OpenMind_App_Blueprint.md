# OpenMind app: blueprint, research and demo guide

**Team Marketing Masterminds** · Ishan, Jaya, Jeelan, Ashish
Prepared for the Reliance T.U.P XII elimination round.

This document explains everything in the OpenMind app: what the prototype does today, why each feature exists, the research behind it, what we would build next, and how to demo it to senior leadership.

---

## 1. The idea in one paragraph

OpenMind is a learning companion for Indian children aged 4 to 14. Every other screen in a child's life talks at them. OpenMind is built on one rule: **ask, don't tell.** Vivi, the buddy, replies to a question with a question, makes the child explain things back, remembers what they learned, and brings it back days later. It speaks the child's language, works offline, and ends sessions on purpose. Parents see what their child asked, learned and felt, without reading every message.

---

## 2. Two sides, chosen at the start

The first screen asks **"Who's using OpenMind?"**

| | Child side | Parent side |
|---|---|---|
| Who | The child, ages 4 to 14 | A parent or guardian |
| Feel | Big buttons, Vivi always present, voice first | Calm dashboard, data and controls |
| Access | Open | A times-table question keeps it grown-ups only |
| Purpose | Think, speak, play, feel | See progress, set limits, give consent |

---

## 3. What works in the prototype today

Everything below is **working code**, not a mock-up. It runs in any modern browser and needs no server.

| Feature | Where | Works offline? |
|---|---|---|
| Choose child or parent | Start screen | Yes |
| Top bar on every screen: Child ⇄ Parent, EN / हिं, Mobile / Desktop view, Light / Dark / Auto theme | Everywhere | Yes |
| Child onboarding: name, age, class, language, buddy colour | First visit | Yes |
| Animated Vivi: blinks, bobs, talks with a moving mouth, reacts to taps | Everywhere | Yes |
| Chat with real Socratic replies across 9 school topics | Talk | Yes |
| Voice input (speech to text) in English and Hindi | Talk, every room | Needs Chrome, Edge or recent Safari |
| Voice output (Vivi speaks) | Everywhere | Yes. Picks the most natural voice on the device; with a Sarvam or OpenAI key, a neural Indian voice |
| Tap-a-reply suggestions that follow each conversation, so a demo can be clicked through | Talk | Yes |
| Video call with Vivi (your camera feed beside Vivi) | Talk | Yes |
| "Show Vivi something": Vivi reads the colour of what you hold up and asks about it | Talk | Yes (colour only; real vision with live AI) |
| Scripted Hindi demo conversation (matches the video), and New conversation | Talk | Yes |
| Riddles with answer checking | Talk | Yes |
| Curiosity Jar for questions Vivi can't explore yet | Talk, parent side | Yes |
| Syllabus browser by class and subject | Learn | Yes |
| Explore a topic (Vivi asks, child answers, then explains back) | Learn → Talk | Yes |
| Teach Vivi (child teaches, Vivi asks about missing ideas, then scores) | Learn → Talk | Yes |
| 13 brain games, each tied to one thinking skill, filterable by skill | Play | Yes |
| Chess Coach: 6 real positions (mates, a fork, a free piece, promotion) with hints and explanations | Play, home tile | Yes |
| Debate dojo with scoring for claim, reason, example and rebuttal | Speak up | Yes |
| Story chain (child and Vivi build a story, then Vivi reads it aloud) | Speak up | Yes |
| 30-second talk with word count, pace and filler-word count | Speak up | Voice needs a supported browser; typing works everywhere |
| English bridge (Hindi sentence, say it in English, get corrected) | Speak up | Yes |
| Mood check-in, guided breathing, "What would you do?" empathy scenarios | Feelings | Yes |
| Spaced revision on day 3, 10 and 30, with a learning map | Revise | Yes |
| Build your own buddy: name, colour, ears, accessories | My buddy | Yes |
| Copy-cat mode: hold, talk, Vivi repeats you in a squeaky voice | My buddy | Yes |
| Daily time limit that ends the session, with a grown-up override | Child side | Yes |
| Parent app with 6 sections: Home, Insights, Activity, Toy Hub, Store, Settings | Parent | Yes |
| Parent Home: quick actions, today ring, mood ring, "Ask this at dinner", Sunday card, "Needs you" alerts | Parent | Yes |
| Toy Hub: Vivi and Scribe status, battery, ring a device, session length, camera shutter, language, offline packs | Parent | Yes (simulated devices) |
| Store: devices, coming-soon toys with "Notify me", learning packs to download, plans | Parent | Yes (checkout not live) |
| Sunday card with "Share on WhatsApp" | Parent | Yes |
| Settings: time limit, language, voice, camera, live AI, erase data | Parent | Yes |
| "Load demo week" to fill the dashboard for presentations | Parent | Yes |
| Live AI (Claude) for any question outside the lessons | Talk | Needs the Vercel function and an API key |

---

## 4. The child side, room by room

### 4.1 Talk to Vivi

The heart of the product. The child types, or taps the mic and speaks.

**How a conversation flows (example: "Why is the sky blue?")**

1. **Hook question.** Vivi doesn't answer. It asks: "What colour is the sky in the evening?"
2. **Steps.** Each step expects an idea. If the child's answer contains it, Vivi praises the reasoning and asks the next question. If not, Vivi gives one hint. If the child is still stuck, Vivi says "Let's figure it out together" and walks them through.
3. **"Just tell me" handling.** The first time, Vivi gives a clue. The second time, it explains and moves on. Children shouldn't be stuck forever, and parents shouldn't see a frustrated child.
4. **Explain-back.** At the end, Vivi says "Now you be the teacher." It checks the child's explanation against three big ideas and tells them exactly which they covered and which to add.
5. **Saved to memory.** The topic gets stars and comes back for revision in 3 days.

**Video call with Vivi.** The child turns on their camera and sees themselves in a corner, like a video call. This makes talking feel natural. With **"Show Vivi"**, the child holds up an object. Vivi reads its main colour ("I can see something yellow! What is it?"), the child names it, and Vivi asks a curious question about that object (a mango: "Where do mangoes grow, on a tree or under the ground?"). With live AI switched on, this becomes real image understanding.

**Curiosity Jar.** If the child asks something outside the lessons and live AI is off, Vivi still asks "What do you think?" and "Why?", then drops the question in a jar the parent sees, as a dinner-table conversation starter. No dead ends.

### 4.2 Learn

Topics are organised by **class (3, 4, 5)** and **subject (Science, EVS, Maths, English)**, matching what children study at school. Each topic has two ways in:

- **Explore**: Vivi asks, the child answers (the Socratic flow above).
- **Teach Vivi**: Vivi pretends to be confused and the child teaches it. Vivi listens for each big idea, says which part it now understands, and asks a hint question about the part still missing. At the end it scores the explanation. This is the "me giving something, then it correcting me" mode, and it is one of the strongest learning techniques we know (see 6.1).

Topics in the prototype: why the sky is blue, how plants make food, the water cycle, phases of the moon, floating and sinking, fractions, shadows, balanced diet, and nouns.

### 4.3 Play: 13 brain games

Every game targets one thinking skill, and every game ends with Vivi asking "How did you do it?" so play turns into talk.

| Game | Skill it trains | How it works |
|---|---|---|
| Memory match | Working memory | Flip cards, find 6 pairs in as few moves as possible |
| Echo pads | Sequence memory | Watch a growing pattern of coloured pads, tap it back |
| Colour clash | Focus and self-control (inhibition) | A colour word appears in a different ink colour. Tap the ink, not the word. 30 seconds |
| Mini sudoku | Logic | 4 × 4 grid, no repeats in any row, column or box |
| Tower puzzle | Planning ahead | Tower of Hanoi with 3 discs; best is 7 moves |
| Number ninja | Mental maths | Vedic tricks: multiply by 11, squares ending in 5, 99 × n |
| Odd one out | Flexible thinking | Spot the one that doesn't belong, then think of a different reason |
| What comes next? | Pattern reasoning | Find the rule in number, colour and moon-phase sequences |
| **Chess coach** | Planning ahead | Six real positions: back-rank mate, Scholar's Mate, a knight fork, king and queen mate, a free queen, pawn promotion. Tap a piece, tap a square. One hint, then the answer with an explanation, then "why?" |
| **Mango catch** | Self-control, ages 4 to 7 | Tap the mangoes, never the chillies (a go / no-go task) |
| **Rule switch** | Flexible thinking | Sort by colour, then the rule flips to shape every 4 cards (a card-sorting task) |
| **Kirana shop** | Money sense | A customer pays with a note. Give the right change |
| **Code the robot** | Computational thinking | Plan arrow steps to move Vivi around walls to the star, then run the program and debug |

### 4.4 Speak up

Speaking is the skill screens never ask for. Four activities:

- **Debate dojo.** The child picks a motion ("Homework should be banned for kids under 10"), picks a side, and argues. Vivi checks for a clear point of view, a reason ("because"), and an example. Then Vivi argues the other side, and the child must answer back. The score rewards engaging with the other side ("I see your point, but..."), not just shouting louder.
- **Story chain.** Vivi starts a story. The child adds a line. Vivi adds a twist using a word the child just said, and asks what happens next. After four rounds, Vivi reads the whole story aloud.
- **30-second talk.** A topic card ("If you could have any superpower...") and a 30-second timer. The app counts words, estimates pace, and counts filler words (um, like, basically, matlab). Feedback: "Pause silently instead of saying um. Pauses sound confident."
- **English bridge.** A Hindi sentence ("Mujhe paani chahiye"). The child says it in English. The app compares it with several correct versions, shows any missing words, and adds a politeness tip. This uses the mother tongue as a bridge, not an obstacle.

### 4.5 Feelings

- **Mood check-in** with five faces. Vivi responds with empathy and one gentle question.
- **Breathing buddy** for sad, angry or worried moods: a circle that grows and shrinks for 4-second breaths.
- **"What would you do?"** scenarios (a friend takes your pencil; a new student sits alone). After choosing, the child is asked "How do you think the other person felt?" That one question is the core of empathy practice.
- Every difficult-feelings reply encourages talking to a trusted grown-up.

### 4.6 Revise

Topics come back on **day 3, day 10 and day 30**. Answer correctly and the topic moves up a level; after three successful revisits it's "Mastered". Miss it, and it comes back tomorrow, with a button to explore it again. The **learning map** shows every topic's status.

### 4.7 My buddy

The "Doraemon" wish: every child wants their own robot friend.

- **Design your buddy:** name, colour (6), ears (floppy, pointy, bunny, antenna), and something to wear (bow, cap, glasses, crown, headphones).
- **Copy-cat mode:** hold the button, say anything, let go, and the buddy repeats it in a high, squeaky voice with its mouth moving, like Talking Tom. Pure fun, and it gets shy children to speak out loud.
- **Tap to tickle:** Vivi wiggles and giggles.

The buddy design carries across every screen, so it feels like *their* friend.

### 4.8 Sessions that end

Parents set a daily limit (15 to 60 minutes). A small counter shows minutes left. When time is up, Vivi says "Go and tell someone at home one thing you learned today," and the child side closes. A grown-up can add 15 minutes behind the parent question.

---

## 5. The parent side

A full app with six sections. On a laptop they sit in a sidebar; on a phone they become bottom tabs.

| Section | What a parent sees and does |
|---|---|
| **Home** | Greeting, last sync. Quick actions: send a story to Vivi, start a lesson (opens it in child mode), calm time, sync now. Today's ring (minutes used against the limit, talk share). Mood ring for the week. "Ask this at dinner", built from a topic the child half-explained or the Curiosity Jar. Key numbers. Sunday card with Share on WhatsApp. "Needs you" alerts. |
| **Insights** | Weekly activity (minutes and questions per day, days over the limit in pink). Mood trend line. "What we actually measure": talk share against a 70% target, questions asked, lessons finished, explanations recorded. Skills growing. Games played and the skill each builds. |
| **Activity** | Learning map with what the child is still working on and when each topic comes back. Curiosity Jar. Recent conversations with timestamps. Mood check-ins. |
| **Toy Hub** | Vivi, Scribe and this phone: connection, firmware, battery, Ring or Find. Controls: session length, microphone (on-device), camera shutter, language, offline packs storage. Add a device leads to the Store. |
| **Store** | OpenMind Family plan banner (included for 2 years with hardware). Filters: Devices, Coming soon, Learning packs, Plans. Owned devices, an outfit pack, five coming-soon toys (Board-Game Kit, Vivi Jr, Maker Kit, Story Cards, Circle) with Notify me, learning packs included in the plan with Download, and three plans. Checkout is marked as not live yet. |
| **Settings** | Child profile, daily limit, bedtime lock, weekly card, alerts, language, voice and voice picker with Test, live AI, camera, cloud backup, parental consent, download all data, load demo week, erase all data. |

The **talk share** metric is deliberate. Most products measure time spent. We measure how much the child spoke, because that's the behaviour we want more of.

### The ecosystem in the Store

Today: Vivi, Scribe, the app. Coming next, sold separately: a Board-Game Kit where Vivi recognises the board and coaches each move, Vivi Jr for ages 2 to 4, a Maker Kit, Story Cards and Circle, a home hub for family quiz nights. Learning packs (Chess Academy, Spoken English Plus, Vedic Maths Pro, regional languages, Class 5 foundation) sit inside the Family plan, so the subscription keeps getting more valuable while hardware grows the ecosystem.

---

## 6. The research behind the design

We built every feature on established findings in learning science, child development and Indian education policy. Sources are listed in section 11.

### 6.1 How children learn best

| Finding | What it means | Where it shows up in OpenMind |
|---|---|---|
| **Retrieval practice** (the testing effect) | Pulling an idea out of memory strengthens it more than re-reading. Dunlosky and colleagues rated practice testing one of the two most useful study techniques. | Explain-back at the end of every topic; Revise questions |
| **Spaced practice** | Revisiting after growing gaps beats cramming. | Day 3, 10 and 30 revision schedule |
| **Self-explanation** | Learners who explain ideas to themselves understand more deeply. | Every topic ends with "Now you be the teacher" |
| **Learning by teaching** (the protégé effect) | Children try harder and learn more when teaching a character than when learning for themselves. | Teach Vivi mode |
| **Socratic and dialogic teaching** | Questions that make children reason, rather than recall, build understanding and confidence. | Vivi's ask-first rule; hint, then guide |
| **Elaborative "why" questions** | Asking "why is this true?" improves memory and understanding. | Vivi's follow-ups: "Why do you think that?" |
| **Process praise** | Praising effort and strategy, not intelligence, builds persistence. | Vivi says "great reasoning", never "you're so smart" |
| **Mother tongue first** | NEP 2020 recommends the home language as the medium of instruction until at least Grade 5 wherever possible. | Hindi and English, with English bridge cards |
| **Play-based learning in early years** | India's NCF for the Foundational Stage (2022) puts play, stories and conversation at the centre. | Games, story chain, buddy |

### 6.2 Brain games: what they can and can't do

The games target **executive functions**, the mental skills children use to plan, focus, remember instructions and switch between tasks. Researcher Adele Diamond groups them into three core skills:

| Core skill | Our games |
|---|---|
| Working memory | Memory match, Echo pads |
| Inhibitory control (self-control, focus) | Colour clash (a Stroop task) |
| Cognitive flexibility | Odd one out (find a second reason), What comes next? |
| Higher-order skills built on them: reasoning and planning | Mini sudoku, Tower puzzle, Number ninja |

**An honest caution for the Q&A.** A large 2016 review (Simons and colleagues) found that brain-training games make people better at the games themselves, but evidence that they improve everyday skills is weak. Diamond's work also suggests that activities which challenge these skills **inside meaningful, social, emotionally engaging activities** work better than drills alone.

**Our design response:** we never claim the games raise IQ. Every game ends with a conversation ("How did you do it?"), which turns a drill into metacognition, thinking about your own thinking. Games sit next to debate, storytelling and teaching, which practise the same skills in real use.

### 6.3 Speaking and soft skills

- **Oracy.** The UK's Voice 21 oracy framework splits speaking into four strands: physical (voice, pace), linguistic (vocabulary, structure), cognitive (reasoning, building on others) and social-emotional (listening, confidence). Our 30-second talk covers physical and linguistic; Debate dojo covers cognitive; story chain and empathy scenarios cover social-emotional.
- **Oral language works.** The Education Endowment Foundation's toolkit rates oral language interventions as high impact for low cost, around +6 months of progress on average.
- **Argument structure.** Debate dojo scores Claim, Reason and Evidence (the CER model widely used in science and debate teaching) plus a rebuttal.
- **Social and emotional learning.** CASEL's five competencies (self-awareness, self-management, social awareness, relationship skills, responsible decision-making) map to the Feelings room: mood naming, breathing, perspective-taking scenarios.

### 6.4 Screen time and wellbeing

- WHO (2019) recommends no more than 1 hour of sedentary screen time a day for children aged 2 to 4, and less is better. The American Academy of Pediatrics stresses quality, co-use and family media plans over raw minutes.
- **Our design:** no feed, no autoplay, no store; parent-set daily limits; sessions that end with a real-world task ("tell someone what you learned"); Vivi itself has no screen; and a weekly card that brings the parent into the conversation.

### 6.5 Children's data and Indian law

India's Digital Personal Data Protection Act, 2023 (Section 9) requires **verifiable parental consent** before processing a child's personal data, and bars **tracking, behavioural monitoring and targeted advertising** directed at children.

**Our design:** data stays on the device in the prototype; no ads ever; live AI is off by default and only a parent can switch it on; the AI never receives the child's name or contact details; and the system prompt forbids asking for personal information.

---

## 7. The full feature catalogue (product roadmap)

The prototype shows the core. The full product would add the following. Items marked ✅ are already in the prototype.

### 7.1 Think: cognitive games library

| Game | Skill | Status |
|---|---|---|
| Memory match, Echo pads | Working memory | ✅ |
| Colour clash | Inhibitory control | ✅ |
| Mini sudoku, then 6 × 6 and 9 × 9 | Logic | ✅ (4 × 4) |
| Tower puzzle | Planning | ✅ |
| Number ninja (Vedic maths) | Mental maths | ✅ |
| Odd one out, What comes next? | Flexibility, pattern reasoning | ✅ |
| Chess puzzles | Planning, visualisation | ✅ 6 positions; next: mate in 2 and a full puzzle ladder |
| Tangram builder | Spatial reasoning | Next |
| Card sort with switching rules (sort by colour, then by shape) | Cognitive flexibility | ✅ Rule switch |
| Go / No-go ("tap only the mangoes") | Inhibitory control for 4 to 6 year olds | ✅ Mango catch |
| Logic grid puzzles | Deduction | Next |
| Nim and other strategy games against Vivi | Strategic thinking | Next |
| Mental rotation ("which shape is this one turned?") | Spatial reasoning | Next |
| Kakuro and KenKen | Arithmetic reasoning | Next |
| Estimation challenges ("how many rotis in a week?") | Number sense | Next |
| Money sense: a pretend kirana shop | Financial literacy | ✅ Kirana shop |
| Code the robot: sequence arrow cards to move Vivi | Computational thinking | ✅ 3 levels |

### 7.2 Learn

| Feature | Status |
|---|---|
| Socratic topics with explain-back | ✅ 9 topics |
| Teach Vivi | ✅ |
| Full NCERT and major state-board mapping, Classes 1 to 8 | Next |
| Homework photo help: snap a question, Vivi asks guiding questions instead of solving it | Next (needs vision AI) |
| Mastery graph per skill, shared across Vivi, Scribe and the app | Partly (learning map) |
| Mixed revision (interleaving topics) | Next |
| Teacher-assigned topics (school edition) | Next |

### 7.3 Speak

| Feature | Status |
|---|---|
| Debate dojo | ✅ |
| Story chain | ✅ |
| 30-second talk with filler-word feedback | ✅ |
| English bridge | ✅ 6 cards |
| Read-aloud with fluency feedback (words per minute, accuracy) | Next |
| Show and tell with the camera | Next |
| Interview a family member (child asks grandparents questions Vivi suggests) | Next |
| Moderated peer debate circles | Next |
| Regional language bridges (Marathi, Tamil, Telugu, Bengali...) | Next |

### 7.4 Connect

| Feature | Status |
|---|---|
| Mood check-in, breathing buddy | ✅ |
| "What would you do?" empathy scenarios | ✅ |
| Family question of the day (for dinner) | Next |
| Gratitude jar | Next |
| Moderated peer circles | Next |

### 7.5 Buddy

| Feature | Status |
|---|---|
| Design your own buddy | ✅ |
| Copy-cat voice | ✅ |
| Tickle and reactions | ✅ |
| Buddy remembers your favourite things and brings them up | Next |
| Unlock outfits by learning, not by buying | Next |
| Same buddy on the Vivi plush, Scribe and the app | Product |

### 7.6 Parent

| Feature | Status |
|---|---|
| Full parent app: Home, Insights, Activity, Toy Hub, Store, Settings | ✅ |
| Curiosity jar | ✅ |
| Weekly card sent automatically on WhatsApp | Next |
| Multiple children per family | Next |
| Teacher dashboard (school edition) | Next |

---

## 8. How it works

### 8.1 The prototype

```
Browser (any device)
├── index.html + css/styles.css
├── js/content.js   lessons, debates, stories, scenarios (edit content here)
├── js/vivi.js      avatar SVG, animation, speech synthesis, speech recognition, copy-cat recorder
├── js/engine.js    Socratic engine: topic matching, hints, explain-back scoring, Teach Vivi
├── js/games.js     8 games
├── js/app.js       screens, child and parent sides, time limits, storage
└── localStorage    all data stays on this device

Optional: Vercel function api/chat.js → Claude (only when a parent turns on live AI)
```

**The offline engine.** Each topic is a small script: a hook question, steps that each expect certain ideas (in English and Hinglish), a hint per step, an explain-back prompt, three concepts to check, and a revision question. The engine matches the child's words against these. That's why the demo works with no internet and gives the same reliable result in front of judges.

**Live AI.** When switched on, anything outside the scripts goes to `/api/chat`, which calls Claude with a system prompt that enforces the ask-don't-tell rule, short replies, Hinglish when chosen, and child-safety rules. The API key lives only on the server.

### 8.2 The product

| Layer | Prototype | Product |
|---|---|---|
| Voice in | Browser speech recognition | On-device Indic speech recognition; cloud Indic speech (Sarvam or Gnani.ai class) when online |
| Thinking | Scripted Socratic engine + optional Claude | Small Indic model on Scribe or the phone, tuned on Socratic dialogue, plus scripted lessons |
| Voice out | Best device voice, or Sarvam Bulbul / OpenAI neural voice via `api/tts.js` | Custom Vivi voice in 12 languages |
| Memory | localStorage | Encrypted on-device mastery graph, synced when online |
| Vivi plush | On screen | Physical plush with mic and speaker, talking to the tablet or phone over a local link |
| Parent | Same device, behind a question | Separate parent app with verified consent |

---

## 9. Demo script for the presentation (about 2 minutes)

Before you start: deploy, open the link in Chrome on the iPad or laptop, switch to Parent in the top bar, go to **Settings** and click **Load demo week**. Turn the volume up. On a laptop, click **📱 Mobile** in the top bar to show the phone experience.

| Step | Click | Say |
|---|---|---|
| 1 | Start screen | "Every family starts here: child or parent." |
| 2 | **I'm a child** → home | "This is Vivi. Everything is one tap away, and it speaks Hindi and English." |
| 3 | **Talk to Vivi** → **Hindi demo** | "Watch: the child asks why the sky is blue. Vivi never answers. It asks back, gives a clue, and finally asks the child to explain it. Three out of three ideas, saved for day 3." |
| 3b | **New conversation** → tap a starter (e.g. "Why do some things float?") → keep tapping replies, including "Just tell me!" once | "Every topic works the same way, and when a child is stuck, Vivi gives a clue instead of the answer." |
| 4 | **Video call** → hold up something yellow → **Show Vivi** → type "mango" | "With the camera on, the child shows Vivi things, and Vivi asks about them." |
| 5 | Back → **Learn** → **Teach Vivi** on Rain | "Here it flips: the child teaches, and Vivi points out the missing piece." |
| 6 | **Play** → **Colour clash** (10 seconds) | "Eight games, each for one thinking skill, and each ends with 'how did you do it?'" |
| 7 | **Speak up** → **Debate dojo** | "Debate scores reasons and rebuttals, not volume." |
| 8 | **My buddy** → pick a crown → **Hold and talk** | "And this is every child's dream: their own robot friend that copies them." |
| 8b | **Play** → **Chess coach** → tap the rook on a1, then a8 | "Real chess positions. The child finds the move, and Vivi asks why it works." |
| 9 | Top bar **Parent ⇄** → Skip | "Parents get their own app. Home shows today, the mood ring and one question to ask at dinner." |
| 10 | **Insights**, then **Toy Hub**, then **Store** | "We measure how much the child spoke, not screen time. Devices are managed here, and the Store shows the ecosystem we'll grow: board games, Vivi Jr, maker kits." |
| 11 | Top bar **🌙** then **📱 Mobile** | "Dark mode for bedtime, and the same app on a phone." |

**If voice input doesn't work on the venue's browser:** type instead. The replies are identical.

---

## 10. Known limits of this prototype, and what's next

| Limit today | Next step |
|---|---|
| 9 scripted topics | Content pipeline for NCERT and state boards, Classes 1 to 8 |
| Keyword matching for answers | On-device model for understanding answers, with scripts as guardrails |
| "Show Vivi" reads colour only | Vision model with live AI, then on-device |
| Browser speech recognition varies by browser | Indic speech models (on-device, plus Sarvam or Gnani.ai class APIs) |
| Device voices vary in quality | Add a Sarvam key for a natural Indian voice today; custom Vivi voice in the product |
| Data lives in one browser | Accounts, encrypted sync, family profiles |
| Parent area protected by a times-table question | Separate parent login with verified consent under the DPDP Act |
| Hindi depends on the device having a Hindi voice | Custom Vivi voice in every language |
| No physical Vivi yet | ESP32-S3 dev board with mic and speaker as a stand-in, then the plush |

---

## 11. References

- Dunlosky, J. et al. (2013). *Improving students' learning with effective learning techniques.* Psychological Science in the Public Interest.
- Roediger, H. L. and Karpicke, J. D. (2006). *Test-enhanced learning.* Psychological Science.
- Cepeda, N. J. et al. (2006). *Distributed practice in verbal recall tasks: a review and quantitative synthesis.* Psychological Bulletin.
- Chi, M. T. H. et al. (1994). *Eliciting self-explanations improves understanding.* Cognitive Science.
- Chase, C. et al. (2009). *Teachable agents and the protégé effect.* Journal of Science Education and Technology.
- Alexander, R. (2020). *A Dialogic Teaching Companion.* Routledge.
- Mueller, C. M. and Dweck, C. S. (1998). *Praise for intelligence can undermine children's motivation and performance.* Journal of Personality and Social Psychology.
- Diamond, A. (2013). *Executive functions.* Annual Review of Psychology.
- Diamond, A. and Lee, K. (2011). *Interventions shown to aid executive function development in children 4 to 12 years old.* Science.
- Simons, D. J. et al. (2016). *Do "brain-training" programs work?* Psychological Science in the Public Interest.
- Voice 21. *The Oracy Framework.*
- Education Endowment Foundation. *Teaching and Learning Toolkit: Oral language interventions.*
- CASEL. *The CASEL 5 core competencies.*
- World Health Organization (2019). *Guidelines on physical activity, sedentary behaviour and sleep for children under 5 years of age.*
- American Academy of Pediatrics. *Family Media Plan.*
- Ministry of Education, Government of India (2020). *National Education Policy 2020.*
- NCERT (2022). *National Curriculum Framework for Foundational Stage.*
- Government of India (2023). *Digital Personal Data Protection Act, 2023*, Section 9.
