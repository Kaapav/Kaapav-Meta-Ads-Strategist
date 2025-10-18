// server/index.js
import express from 'express';
import cors from 'cors';
import http from 'http';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// --- MISSION 1: Health Check Endpoint ---
// This simple endpoint proves the server is alive and reachable.
app.get('/api/health', (req, res) => {
  res.json({ status: 'alive', message: 'Kaapav Production Server is running.' });
});

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`🚀 Kaapav Production Server listening on http://localhost:${port}`);
});
