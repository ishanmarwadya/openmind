// Vercel serverless function: /api/tts
// Gives Vivi a natural, human-sounding voice. Optional: without a key the app uses the best voice on the device.
//
// Option 0 (used first if set): Gemini TTS. Add GEMINI_API_KEY. Optional: GEMINI_VOICE (default "Puck"), GEMINI_TTS_MODEL.
// Option A: Sarvam Bulbul, built for Indian accents and Hinglish.
//   Add SARVAM_API_KEY in Vercel > Project > Settings > Environment Variables.
//   Optional: SARVAM_SPEAKER (Vivi's voice, default "anushka"), SARVAM_CHILD_SPEAKER (default "arya").
// Option B: OpenAI text-to-speech. Add OPENAI_API_KEY. Optional: OPENAI_VOICE (default "coral").
// If both keys are set, Sarvam is used.

const toBase64 = buf => Buffer.from(buf).toString('base64');


// Gemini returns raw 16-bit mono PCM at 24 kHz. Wrap it in a WAV header so every browser can play it.
function pcmToWav(b64, rate = 24000) {
  const pcm = Buffer.from(b64, 'base64'), h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVE', 8); h.write('fmt ', 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(rate, 24);
  h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]).toString('base64');
}

async function gemini(text, lang, role) {
  const style = role === 'child'
    ? 'Say this like a curious, cheerful 7-year-old Indian child: '
    : `Say this warmly and cheerfully, like a kind, patient tutor talking to a young Indian child, with a natural Indian English accent and a smile in the voice${lang === 'hi' ? '. The text is Hinglish (Hindi written in English letters), so pronounce the Hindi words naturally as Hindi' : ''}: `;
  const model = process.env.GEMINI_TTS_MODEL || 'gemini-2.5-flash-preview-tts';
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
    body: JSON.stringify({
      contents: [{ parts: [{ text: style + text.slice(0, 1200) }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: role === 'child' ? 'Leda' : (process.env.GEMINI_VOICE || 'Puck') } } }
      }
    })
  });
  const d = await r.json();
  const part = ((((d.candidates || [])[0] || {}).content || {}).parts || []).find(p => p.inlineData);
  if (!r.ok || !part) throw new Error((d.error && d.error.message) || 'Gemini TTS error');
  const rate = +((part.inlineData.mimeType || '').match(/rate=(\d+)/) || [0, 24000])[1];
  return { audio: pcmToWav(part.inlineData.data, rate), mime: 'audio/wav' };
}

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
  const provider = process.env.GEMINI_API_KEY ? 'Gemini' : process.env.SARVAM_API_KEY ? 'Sarvam' : process.env.OPENAI_API_KEY ? 'OpenAI' : '';
  if (req.method === 'GET') return res.status(200).json({ configured: !!provider, provider });
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });
  if (!provider) return res.status(200).json({ audio: null, error: 'No TTS key set on the server.' });
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const text = String(body.text || '').trim();
    if (!text) return res.status(400).json({ error: 'No text' });
    const out = provider === 'Gemini' ? await gemini(text, body.lang, body.role) : provider === 'Sarvam' ? await sarvam(text, body.lang, body.role) : await openai(text, body.lang, body.role);
    res.setHeader('cache-control', 'public, max-age=86400');
    return res.status(200).json(out);
  } catch (e) {
    return res.status(502).json({ audio: null, error: e.message });
  }
};
