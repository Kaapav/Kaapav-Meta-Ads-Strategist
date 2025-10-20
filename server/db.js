// --- PRODUCTION DATABASE (IN-MEMORY SIMULATION) ---
export const db = {
    insights: {
      campaign: [
          { id: 'C001', name: 'Sari Sensation - Diwali Sale', status: 'Active', spend: 50000, impressions: 750000, clicks: 15000, purchase_value: 250000, actions: 100 },
          { id: 'C002', name: 'Kurti Karnival - Festive Deals', status: 'Active', spend: 75000, impressions: 1200000, clicks: 18000, purchase_value: 450000, actions: 180 },
          { id: 'C003', name: 'Jewellery Junction - Wedding Season', status: 'Paused', spend: 25000, impressions: 300000, clicks: 4500, purchase_value: 80000, actions: 32 },
          { id: 'C004', name: 'Lehenga Love - Clearance', status: 'Active', spend: 30000, impressions: 500000, clicks: 10000, purchase_value: 120000, actions: 48 },
      ],
    },
    leads: [
        { id: 'L001', name: 'Priya Sharma', phone: '98XXXXXX01', chatHistory: [{sender: 'lead', text: 'Is this available in red?', timestamp: new Date(Date.now() - 3600000) }], timestamp: new Date(Date.now() - 3600000), status: 'New Lead', adcreative_id: 'AD001', utm_source: 'instagram' },
        { id: 'L002', name: 'Anjali Verma', phone: '98XXXXXX02', chatHistory: [{sender: 'lead', text: 'What is the price?', timestamp: new Date(Date.now() - 7200000) }], timestamp: new Date(Date.now() - 7200000), status: 'Contacted', adcreative_id: 'AD002', utm_source: 'facebook' },
    ],
    auditLogs: [
        { id: 'A001', timestamp: new Date(Date.now() - 3600000), user: 'System', action: 'New WhatsApp Lead', details: 'Lead "Priya Sharma" created.' },
        { id: 'A002', timestamp: new Date(Date.now() - 7200000), user: 'AI Autopilot', action: 'Campaign Paused', details: 'Campaign "Jewellery Junction" paused due to low ROAS (1.8).' },
    ],
};
