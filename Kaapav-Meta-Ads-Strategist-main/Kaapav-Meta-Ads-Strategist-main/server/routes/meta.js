// server/routes/meta.js
import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

/**
 * Placeholder / safe meta route.
 * - When you add META_ACCESS_TOKEN + META_AD_ACCOUNT_ID in .env this will call the Graph API.
 * - For now it returns a safe message so server doesn't crash.
 */

// Health / placeholder
router.get('/', (req, res) => {
  res.json({ ok: true, message: 'Meta routes placeholder. Add META_ACCESS_TOKEN + META_AD_ACCOUNT_ID to enable live fetch.' });
});

// Example campaigns proxy (will return mock or Graph response if tokens are present)
router.get('/campaigns', async (req, res) => {
  const token = process.env.META_ACCESS_TOKEN;
  const adAccountId = process.env.META_AD_ACCOUNT_ID;
  if (!token || !adAccountId) {
    return res.json({
      ok: false,
      message: 'META_ACCESS_TOKEN or META_AD_ACCOUNT_ID not configured. Returning mock campaigns.',
      campaigns: [
        { id: 'mock-1', name: 'Mock Campaign 1', spend: 1200, impressions: 15000, clicks: 420, purchase_value: 4800 }
      ]
    });
  }

  try {
    const url = `https://graph.facebook.com/v20.0/act_${adAccountId}/campaigns?fields=name,status,objective,insights{spend,impressions,clicks,actions,purchase_value}&access_token=${token}`;
    const r = await fetch(url);
    const j = await r.json();
    return res.json({ ok: true, data: j });
  } catch (err) {
    console.error('meta campaigns fetch error', err);
    return res.status(500).json({ ok: false, error: String(err) });
  }
});

export default router;
