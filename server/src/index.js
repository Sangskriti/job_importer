import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cron from "node-cron";
import { connectDB } from "./db.js";
import { fetchJobsFromUrl } from "./services/fetchJobs.js";
import jobQueue from "./queue/queue.js";
import importsRouter from "./routes/imports.js";
import ImportLog from "./models/ImportLog.js"; 

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Mount your imports router
app.use("/api/imports", importsRouter);

const PORT = process.env.PORT || 4000;

async function start() {
  await connectDB();

  const schedule = process.env.CRON_SCHEDULE || "0 * * * *";
  const feedEnv = process.env.FEED_URLS || "";
  const feedUrls = feedEnv.split(",").map((s) => s.trim()).filter(Boolean);

  // Helper function to fetch and enqueue jobs
  const fetchAndEnqueue = async (feedUrl) => {
    try {
      const items = await fetchJobsFromUrl(feedUrl);
      if (!items || items.length === 0) {
        console.log("No items found for", feedUrl);
        return;
      }
      await jobQueue.add({ feedUrl, items }, { attempts: 3, backoff: 5000 });
      console.log(`Enqueued ${items.length} items from ${feedUrl}`);
    } catch (err) {
      console.error("Error fetching and enqueuing", feedUrl, err.message || err);
    }
  };

  // Cron job (automatic import)
  cron.schedule(schedule, async () => {
    console.log("⏰ Cron run at", new Date().toISOString());
    for (const feed of feedUrls) await fetchAndEnqueue(feed);
  });

  // Manual fetch trigger
  app.post("/api/fetch-now", async (req, res) => {
    const { feedUrl } = req.body;
    const targets = feedUrl ? [feedUrl] : feedUrls;
    for (const f of targets) await fetchAndEnqueue(f);
    res.json({ status: "ok", enqueuedFor: targets });
  });

  // FIXED: Dashboard Stats Endpoint (matches frontend expectations)
  app.get("/api/stats", async (req, res) => {
    try {
      const now = new Date();
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const logs = await ImportLog.find().sort({ timestamp: -1 }).limit(200);

      // aggregate metrics
      const totalJobs = logs.reduce((sum, l) => sum + (l.totalFetched || 0), 0);
      const newJobsToday = logs
        .filter((l) => l.timestamp >= startOfDay)
        .reduce((sum, l) => sum + (l.newJobs || 0), 0);
      const updatedJobsToday = logs
        .filter((l) => l.timestamp >= startOfDay)
        .reduce((sum, l) => sum + (l.updatedJobs || 0), 0);
      const failedImports = logs.filter((l) => (l.failedJobs?.length || 0) > 0)
        .length;

      const lastImportAt = logs[0]?.timestamp || null;

      // For UI trend display
      const jobsDelta = newJobsToday; // or compare with yesterday if needed

      res.json({
        totalJobs,
        newJobsToday,
        updatedJobsToday,
        failedImports,
        jobsDelta,
        failedDelta: 0,
        lastImportAt,
      });
    } catch (err) {
      console.error("Error computing dashboard stats:", err);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log("Endpoints:");
    console.log("  POST /api/fetch-now");
    console.log("  GET  /api/imports/logs");
    console.log("  GET  /api/stats  <-- now returns dashboard data");
  });
}

// Run the server
start().catch((err) => {
  console.error("Startup error:", err);
  process.exit(1);
});
