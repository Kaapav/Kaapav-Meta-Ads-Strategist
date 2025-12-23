# Kaapav — Meta Ads Strategist (Revised)

Self-hosted Meta Ads control center:
- React + Vite frontend
- Express backend
- Generic AI adapter (OpenAI / noop fallback)
- Upstash Redis (caching & counters)
- Firebase Firestore (persistent storage)
- WhatsApp webhook integration + n8n flow support

## Quick start (local)

### Prerequisites
- Node.js (18+ recommended)
- (Optional) ngrok if testing WhatsApp webhook locally
- (Optional) Docker if running local LLMs

### 1) Install dependencies
```bash
npm install
