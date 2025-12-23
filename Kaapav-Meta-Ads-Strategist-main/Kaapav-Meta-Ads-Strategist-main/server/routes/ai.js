// server/routes/ai.js
import express from 'express';
import generateFromAI from '../lib/aiClient.js';

const router = express.Router();

router.post('/generate', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'prompt required' });
    const text = await generateFromAI(prompt);
    res.json({ text });
  } catch (err) {
    console.error('AI generate error', err);
    res.status(500).json({ error: 'AI generation failed' });
  }
});

export default router;
