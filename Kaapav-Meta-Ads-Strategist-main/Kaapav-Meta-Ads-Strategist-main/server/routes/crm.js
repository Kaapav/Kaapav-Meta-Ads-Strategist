import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.get('/crm-data', (req, res) => {
  console.log('[LiveAPI] GET /api/crm/crm-data');
  try {
    // Return copies sorted by timestamp, newest first
    const leads = [...db.leads].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const auditLogs = [...db.auditLogs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json({ leads, auditLogs });
  } catch (error) {
    console.error("Error fetching CRM data:", error);
    res.status(500).json({ error: 'Failed to fetch CRM data' });
  }
});

router.post('/leads/:id/status', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    console.log(`[LiveAPI] POST /api/crm/leads/${id}/status - New status: ${status}`);
    
    const leadIndex = db.leads.findIndex(l => l.id === id);
    if (leadIndex === -1) {
        return res.status(404).json({ error: 'Lead not found' });
    }

    db.leads[leadIndex].status = status;
    const lead = db.leads[leadIndex];
    
    const log = {
        id: `A${(db.auditLogs.length + 1).toString().padStart(3, '0')}`,
        timestamp: new Date(),
        user: 'User',
        action: `Lead Status Changed`,
        details: `Status of "${lead.name}" changed to "${status}"`,
    };
    db.auditLogs.push(log);
    
    if (status === 'Paid') {
        console.log(`[AUTOMATION] Firing n8n webhook for lead: ${lead.name}`);
        const n8nLog = {
            id: `A${(db.auditLogs.length + 1).toString().padStart(3, '0')}`,
            timestamp: new Date(),
            user: 'System',
            action: `Fulfillment Triggered`,
            details: `n8n webhook fired for "${lead.name}" for Shiprocket automation.`,
        };
        db.auditLogs.push(n8nLog);
    }

    res.json({ success: true, lead });
});

router.post('/leads/:id/message', (req, res) => {
    const { id } = req.params;
    const { message } = req.body;
    console.log(`[LiveAPI] POST /api/crm/leads/${id}/message - Message: ${message}`);

    const leadIndex = db.leads.findIndex(l => l.id === id);
    if (leadIndex === -1) {
        return res.status(404).json({ error: 'Lead not found' });
    }

    const lead = db.leads[leadIndex];
    lead.chatHistory.push({ sender: 'user', text: message, timestamp: new Date() });
    lead.timestamp = new Date();

    const log = {
        id: `A${(db.auditLogs.length + 1).toString().padStart(3, '0')}`,
        timestamp: new Date(),
        user: 'User',
        action: 'Message Sent',
        details: `Sent message to "${lead.name}"`,
    };
    db.auditLogs.push(log);

    // Simulate an automated reply
    setTimeout(() => {
        lead.chatHistory.push({ sender: 'lead', text: 'Thank you for your message!', timestamp: new Date() });
        lead.timestamp = new Date();
    }, 2000);

    res.json({ success: true, lead });
});


export default router;