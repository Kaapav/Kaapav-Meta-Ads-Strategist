import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.get('/campaign', (req, res) => {
  console.log('[LiveAPI] GET /api/insights/campaign');
  try {
    const campaignsWithMetrics = db.insights.campaign.map(item => ({
        ...item,
        ctr: item.impressions > 0 ? (item.clicks / item.impressions) * 100 : 0,
        roas: item.spend > 0 ? (item.purchase_value / item.spend) : 0,
        cpa: item.actions > 0 ? item.spend / item.actions : 0,
    }));
    res.json(campaignsWithMetrics);
  } catch (error) {
    console.error("Error fetching campaign insights:", error);
    res.status(500).json({ error: 'Failed to fetch campaign insights' });
  }
});

export default router;