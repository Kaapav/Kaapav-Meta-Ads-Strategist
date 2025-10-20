import express from 'express';
import cors from 'cors';
import http from 'http';
import insightsRouter from './routes/insights.js';
import crmRouter from './routes/crm.js';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// --- API ENDPOINTS ---

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'alive', message: 'Kaapav Production Server is running.' });
});

// Mount the domain-specific routers at their unique base paths.
// This is the standard, robust way to structure an Express API.
app.use('/api/insights', insightsRouter);
app.use('/api/crm', crmRouter);


const server = http.createServer(app);

server.listen(port, () => {
  console.log(`🚀 Kaapav Production Server listening on http://localhost:${port}`);
});