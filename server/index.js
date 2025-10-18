import express from 'express';
import cors from 'cors';
import http from 'http';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// --- PRODUCTION DATABASE (IN-MEMORY SIMULATION) ---
const db = {
    insights: {
      campaign: [
          { id: 'C001', name: 'Sari Sensation - Diwali Sale', status: 'Active', spend: 50000, impressions: 750000, clicks: 15000, purchase_value: 250000, actions: 100 },
          { id: 'C002', name: 'Kurti Karnival - Festive Deals', status: 'Active', spend: 75000, impressions: 1200000, clicks: 18000, purchase_value: 450000, actions: 180 },
          { id: 'C003', name: 'Jewellery Junction - Wedding Season', status: 'Paused', spend: 25000, impressions: 300000, clicks: 4500, purchase_value: 80000, actions: 32 },
          { id: 'C004', name: 'Lehenga Love - Clearance', status: 'Active', spend: 30000, impressions: 500000, clicks: 10000, purchase_value: 120000, actions: 48 },
      ],
    },
};

// --- MISSION 1: Health Check Endpoint ---
app.get('/api/health', (req, res) => {
  res.json({ status: 'alive', message: 'Kaapav Production Server is running.' });
});

// --- MISSION 2: Live Campaign Insights Endpoint ---
app.get('/api/insights/campaign', (req, res) => {
  console.log('[LiveAPI] GET /api/insights/campaign');
  try {
    const campaignsWithMetrics = db.insights.campaign.map(item => ({
        ...item,
        ctr: item.impressions > 0 ? (item.clicks / item.impressions) * 100 : 0,
        roas: item.spend > 0 ? item.purchase_value / item.spend : 0,
        cpa: item.actions > 0 ? item.spend / item.actions : 0,
    }));
    res.json(campaignsWithMetrics);
  } catch (error) {
    console.error("Error fetching campaign insights:", error);
    res.status(500).json({ error: 'Failed to fetch campaign insights' });
  }
});


const server = http.createServer(app);

server.listen(port, () => {
  console.log(`🚀 Kaapav Production Server listening on http://localhost:${port}`);
});
