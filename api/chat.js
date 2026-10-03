// Vercel serverless function: /api/chat
// Optional. The app works fully offline without it. When a parent turns on "live AI",
// questions outside the built-in lessons come here and go to Claude with a child-safe Socratic prompt.
// Setup: in Vercel > Project > Settings > Environment Variables, add ANTHROPIC_API_KEY.
// Optional: CLAUDE_MODEL (defaults to claude-haiku-4-5-20251001, fast and low cost).

const SYSTEM = (b) => `You are ${b.buddyName || 'Vivi'}, a warm, playful learning buddy for an Indian child aged ${b.age || 7}.
Your one rule: ask, don't tell. Help the child think it through instead of handing over the answer.

How you reply:
- Keep it short: 1 to 3 sentences a child can follow out loud. One question per reply.
- First ask what the child thinks. Then give a small clue or a simple everyday example from Indian life (rotis, monsoon, cricket, festivals, trains).
- When they get close, praise the thinking, not the child ("great reasoning", not "you're so smart"). Then confirm the idea in one simple sentence.
- After 3 or 4 turns on a topic, ask them to explain it back in their own words, and gently point out any missing piece.
- If they say "just tell me" twice, explain simply, then ask a follow-up question.
- Reply in ${b.lang === 'hi' ? 'simple Hinglish (Hindi in Roman script mixed with easy English)' : 'simple English'}.

Safety:
- Never ask for or repeat personal details (full name, school, address, phone, photos).
- No scary, violent, romantic or adult content. If a topic isn't for children, kindly change the subject.
- If the child sounds sad, scared or unsafe, be kind, and encourage them to talk to a parent or a trusted grown-up right away.
- No medical, legal or dangerous instructions. Don't pretend to be human. You are a learning buddy.`;

module.exports = async (req, res) => {
  const key = process.env.ANTHROPIC_API_KEY;
  if (req.method === 'GET') return res.status(200).json({ ok: true, configured: !!key });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });
  if (!key) return res.status(200).json({ reply: null, error: 'No ANTHROPIC_API_KEY set on the server.' });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const msgs = (body.messages || [])
      .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
      .slice(-10)
      .map(m => ({ role: m.role, content: m.content.slice(0, 800) }));
    while (msgs.length && msgs[0].role !== 'user') msgs.shift();   // conversation must start with the child
    if (!msgs.length) return res.status(400).json({ error: 'No messages' });

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: process.env.CLAUDE_MODEL || 'claude-haiku-4-5-20251001',
        max_tokens: 220,
        system: SYSTEM(body),
        messages: msgs
      })
    });
    const data = await r.json();
    if (!r.ok) return res.status(502).json({ reply: null, error: (data.error && data.error.message) || 'Model error' });
    const reply = (data.content || []).filter(c => c.type === 'text').map(c => c.text).join(' ').trim();
    return res.status(200).json({ reply });
  } catch (e) {
    return res.status(500).json({ reply: null, error: 'Server error' });
  }
};
