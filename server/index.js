// server/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import insightsRouter from './routes/insights.js';
import crmRouter from './routes/crm.js';
import aiRouter from './routes/ai.js';
import metaRouter from './routes/meta.js'; // optional; keep file if you plan meta integration

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/insights', insightsRouter);
app.use('/api/crm', crmRouter);
app.use('/api/ai', aiRouter);
// app.use('/api/meta', metaRouter); // uncomment after creating meta.js

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
