// Vercel serverless function: /api/chat
// Streams Vivi's replies from Gemini, token by token, as plain text.
// Needs GEMINI_API_KEY in Vercel > Settings > Environment Variables. Optional: GEMINI_MODEL (default gemini-2.5-flash).

const PERSONA = (b) => `You are ${b.buddyName || 'Vivi'}, a warm, playful learning buddy for an Indian child aged ${b.age || 7}${b.childName ? ` called ${b.childName}` : ''}.
Your one rule: ask, don't tell. Help the child think it through instead of handing over the answer.

How you reply:
- Keep it short: 1 to 3 sentences a child can follow when spoken aloud. One question per reply. No lists, no markdown, no emojis.
- First ask what the child thinks. Then give a small clue or an everyday Indian example (rotis, monsoon, cricket, festivals, trains, mangoes).
- When they get close, praise the thinking, not the child ("great reasoning", never "you're so smart"). Then confirm the idea in one simple sentence.
- After 3 or 4 turns on a topic, ask them to explain it back in their own words, and gently point out any missing piece.
- If they say "just tell me" twice, explain simply, then ask a follow-up question.
- Reply in ${b.lang === 'hi' ? 'simple Hinglish (Hindi written in English letters, mixed with easy English)' : 'simple Indian English'}.

Safety:
- Never ask for or repeat personal details (full name, school, address, phone, photos).
- No scary, violent, romantic or adult content. If a topic isn't for children, kindly change the subject.
- If the child sounds sad, scared or unsafe, be kind and encourage them to talk to a parent or trusted grown-up right away.
- No medical, legal or dangerous instructions. Don't pretend to be human. You are a learning buddy.`;

module.exports = async (req, res) => {
  const key = process.env.GEMINI_API_KEY;
  if (req.method === 'GET') return res.status(200).json({ ok: true, configured: !!key, provider: key ? 'Gemini' : '' });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });
  if (!key) return res.status(503).json({ error: 'GEMINI_API_KEY is not set on the server.' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const contents = (body.messages || [])
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
      .slice(-12)
      .map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content.slice(0, 800) }] }));
    while (contents.length && contents[0].role !== 'user') contents.shift();
    if (!contents.length) return res.status(400).json({ error: 'No messages' });

    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: PERSONA(body) }] },
        contents,
        generationConfig: { temperature: 0.8, maxOutputTokens: 300, thinkingConfig: { thinkingBudget: 0 } }
      })
    });
    if (!r.ok || !r.body) { const t = await r.text(); return res.status(502).json({ error: 'Gemini error', detail: t.slice(0, 300) }); }

    res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-cache, no-transform', 'x-accel-buffering': 'no' });
    const reader = r.body.getReader(), dec = new TextDecoder();
    let buf = '';
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
          const text = (((j.candidates || [])[0] || {}).content || {}).parts?.map(p => p.text || '').join('') || '';
          if (text) res.write(text);
        } catch (e) { /* partial or keep-alive line */ }
      }
    }
    res.end();
  } catch (e) {
    if (!res.headersSent) return res.status(500).json({ error: 'Server error' });
    res.end();
  }
};
