// server/lib/aiClient.js
import fetch from 'node-fetch';
import { redisGet, redisSet } from './store.js';
import crypto from 'crypto';

function hashPrompt(p) {
  return crypto.createHash('md5').update(p).digest('hex');
}

export default async function generateFromAI(prompt) {
  const key = `ai:${hashPrompt(prompt)}`;

  // try cache (Upstash)
  try {
    const cached = await redisGet(key);
    if (cached) {
      try { const parsed = JSON.parse(cached); if (parsed && parsed.text) return parsed.text; } catch(e){}
      return cached;
    }
  } catch (e) {
    console.warn('redisGet error', e?.message);
  }

  const provider = (process.env.AI_PROVIDER || 'noop').toLowerCase();

  try {
    if (provider === 'openai') {
      if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set');
      const resp = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500
        })
      });
      const j = await resp.json();
      const text = j?.choices?.[0]?.message?.content || '[no response]';
      await redisSet(key, JSON.stringify({ text }), 60 * 60 * 24); // 24h
      return text;
    } else {
      // noop fallback deterministic template
      const text = `Kaapav Fallback Ad Copy\n\nPrompt:\n${prompt}\n\nSample: Discover timeless jewellery — shop now.`;
      await redisSet(key, JSON.stringify({ text }), 60 * 60 * 24);
      return text;
    }
  } catch (err) {
    console.error('AI provider error', err);
    // fallback text
    const text = `Fallback Ad Copy — ${prompt}`;
    try { await redisSet(key, JSON.stringify({ text, error: err.message }), 60 * 60 * 24); } catch(e){}
    return text;
  }
}
