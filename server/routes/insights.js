// server/routes/insights.js
import express from 'express';
import { db } from '../db.js'; // your existing in-memory file

const router = express.Router();

router.get('/campaign', (req, res) => {
  try {
    const campaigns = db.insights.campaign.map(item => ({
      ...item,
      ctr: item.impressions ? (item.clicks / item.impressions) * 100 : 0,
      roas: item.spend ? item.purchase_value / item.spend : 0,
      cpa: item.actions ? item.spend / item.actions : 0
    }));
    res.json(campaigns);
  } catch (err) {
    console.error('insights error', err);
    res.status(500).json({ error: 'failed' });
  }
});

export default router;
