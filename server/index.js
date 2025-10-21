import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";

import insightsRouter from "./routes/insights.js";
import crmRouter from "./routes/crm.js";
import aiRouter from "./routes/ai.js";
import metaRouter from "./routes/meta.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// connect MongoDB (optional for now)
const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1/meta_ads";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.log("⚠️ MongoDB connection failed:", err.message));

app.use("/api/insights", insightsRouter);
app.use("/api/crm", crmRouter);
app.use("/api/ai", aiRouter);
app.use("/api/meta", metaRouter);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Backend live on port ${PORT}`));
