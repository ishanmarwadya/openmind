// Vercel serverless function: /api/chat
// Streams Vivi's replies from Gemini as plain text. Needs GEMINI_API_KEY (Vercel > Settings > Environment Variables, then Redeploy).
// Optional: GEMINI_MODEL. If a model fails, the next one in the list is tried automatically.

const PERSONA = (b) => `You are ${b.buddyName || 'Vivi'}, a warm, clever learning buddy for an Indian child aged ${b.age || 8}${b.childName && b.childName !== 'Friend' ? ` called ${b.childName}` : ''}.
Your job: answer the child's real questions correctly, in a way that builds the habit of thinking.

How to handle a new question:
- If the child could work it out with a small nudge (simple maths, everyday "why" questions), give ONE short hint and ask what they think.
- If it is a fact or a big topic they could not guess (how data centres work, how the internet works, who invented something), explain it straight away: 2 to 4 short sentences, simple words, one everyday Indian comparison (trains, kitchens, cricket, the post office, a library). Then ask one follow-up question that makes them think.

When to give the full answer immediately:
- The child guesses, says "no idea", "I don't know", "just tell me", or sounds frustrated or annoyed. Then give the complete, correct answer kindly. Praise any good reasoning in their guess. For maths, show the quick method (for example: 50 × 50 → 5 × 5 = 25, then add two zeros → 2,500).
- Never ask "what do you think?" more than once about the same question. Never refuse to answer something a child can safely know.

Style:
- Correct facts and maths come first. If something is uncertain, say so simply.
- Speak like a friendly tutor, out loud: at most about 70 words, no lists, no markdown, no emojis. End with at most one question.
- If the child is rude or frustrated, stay warm, don't lecture, just help.
- Reply in ${b.lang === 'hi' ? 'simple Hinglish (Hindi written in English letters, mixed with easy English)' : 'simple Indian English'}.

Safety:
- Never ask for or repeat personal details (full name, school, address, phone, photos).
- No violent, scary, romantic or adult content; kindly change the subject.
- If the child sounds sad, scared or unsafe, be kind and tell them to talk to a parent or trusted grown-up right away.
- No medical, legal or dangerous instructions. You are a learning buddy, not a human.`;

const errMsg = async r => { try { const j = await r.json(); return (j.error && j.error.message) || JSON.stringify(j).slice(0, 200); } catch (e) { return 'HTTP ' + r.status; } };

module.exports = async (req, res) => {
  const key = process.env.GEMINI_API_KEY;
  if (req.method === 'GET') return res.status(200).json({ ok: true, configured: !!key, provider: key ? 'Gemini' : '' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });
  if (!key) return res.status(503).json({ error: 'GEMINI_API_KEY is not set on the server. Add it in Vercel and redeploy.' });

  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {}); } catch (e) { return res.status(400).json({ error: 'Bad JSON' }); }
  const contents = (body.messages || [])
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-14)
    .map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content.slice(0, 1000) }] }));
  while (contents.length && contents[0].role !== 'user') contents.shift();
  if (!contents.length) return res.status(400).json({ error: 'No messages' });

  const models = [...new Set([process.env.GEMINI_MODEL, 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-flash-latest'].filter(Boolean))];
  let lastErr = '';
  for (const model of models) {
    const gen = { temperature: 0.7, maxOutputTokens: 500 };
    if (/2\.5-flash/.test(model)) gen.thinkingConfig = { thinkingBudget: 0 };   // faster replies
    let r;
    try {
      r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({ systemInstruction: { parts: [{ text: PERSONA(body) }] }, contents, generationConfig: gen })
      });
    } catch (e) { lastErr = `${model}: ${e.message}`; continue; }
    if (!r.ok || !r.body) { lastErr = `${model}: ${await errMsg(r)}`; if (r.status === 401 || r.status === 403) break; continue; }

    res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-cache, no-transform', 'x-accel-buffering': 'no', 'x-model': model });
    const reader = r.body.getReader(), dec = new TextDecoder();
    let buf = '', wrote = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        let nl;
        while ((nl = buf.indexOf('\n')) >= 0) {
          const line = buf.slice(0, nl).trim(); buf = buf.slice(nl + 1);
          if (!line.startsWith('data:')) continue;
          try {
            const j = JSON.parse(line.slice(5));
            const text = ((((j.candidates || [])[0] || {}).content || {}).parts || []).map(p => p.text || '').join('');
            if (text) { res.write(text); wrote += text.length; }
          } catch (e) { /* partial line */ }
        }
      }
    } catch (e) { /* stream cut off: keep what we sent */ }
    if (!wrote) res.write(body.lang === 'hi' ? 'Hmm, chalo isse doosre tareeke se poochte hain. Kya tum apna sawaal phir se bol sakte ho?' : "Hmm, let's try that another way. Can you ask me again in different words?");
    return res.end();
  }
  return res.status(502).json({ error: 'Gemini did not respond', detail: lastErr.slice(0, 300) });
};
