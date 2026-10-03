// Vercel serverless function: /api/tts
// Gives Vivi a natural, human-sounding voice. Optional: without a key the app uses the best voice on the device.
//
// Option A (recommended for India): Sarvam Bulbul, built for Indian accents and Hinglish.
//   Add SARVAM_API_KEY in Vercel > Project > Settings > Environment Variables.
//   Optional: SARVAM_SPEAKER (Vivi's voice, default "anushka"), SARVAM_CHILD_SPEAKER (default "arya").
// Option B: OpenAI text-to-speech. Add OPENAI_API_KEY. Optional: OPENAI_VOICE (default "coral").
// If both keys are set, Sarvam is used.

const toBase64 = buf => Buffer.from(buf).toString('base64');

async function sarvam(text, lang, role) {
  const r = await fetch('https://api.sarvam.ai/text-to-speech', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'api-subscription-key': process.env.SARVAM_API_KEY },
    body: JSON.stringify({
      text: text.slice(0, 1400),
      target_language_code: lang === 'hi' ? 'hi-IN' : 'en-IN',
      speaker: role === 'child' ? (process.env.SARVAM_CHILD_SPEAKER || 'arya') : (process.env.SARVAM_SPEAKER || 'anushka'),
      model: 'bulbul:v2',
      pace: role === 'child' ? 1.05 : 0.95
    })
  });
  const d = await r.json();
  if (!r.ok || !d.audios || !d.audios[0]) throw new Error((d.error && d.error.message) || 'Sarvam error');
  return { audio: d.audios[0], mime: 'audio/wav' };
}

async function openai(text, lang, role) {
  const r = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({
      model: 'gpt-4o-mini-tts',
      voice: role === 'child' ? 'nova' : (process.env.OPENAI_VOICE || 'coral'),
      input: text.slice(0, 1400),
      instructions: role === 'child'
        ? 'Speak like a curious, cheerful 7-year-old Indian child.'
        : `Speak like a warm, friendly, patient tutor talking to a young Indian child. Natural Indian English accent${lang === 'hi' ? ', and read the Hinglish (Hindi written in English letters) naturally as Hindi' : ''}. Smile in your voice. Medium pace.`,
      response_format: 'mp3'
    })
  });
  if (!r.ok) throw new Error('OpenAI TTS error');
  return { audio: toBase64(await r.arrayBuffer()), mime: 'audio/mpeg' };
}

module.exports = async (req, res) => {
  const provider = process.env.SARVAM_API_KEY ? 'Sarvam' : process.env.OPENAI_API_KEY ? 'OpenAI' : '';
  if (req.method === 'GET') return res.status(200).json({ configured: !!provider, provider });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });
  if (!provider) return res.status(200).json({ audio: null, error: 'No TTS key set on the server.' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const text = String(body.text || '').trim();
    if (!text) return res.status(400).json({ error: 'No text' });
    const out = provider === 'Sarvam' ? await sarvam(text, body.lang, body.role) : await openai(text, body.lang, body.role);
    res.setHeader('cache-control', 'public, max-age=86400');
    return res.status(200).json(out);
  } catch (e) {
    return res.status(502).json({ audio: null, error: e.message });
  }
};
