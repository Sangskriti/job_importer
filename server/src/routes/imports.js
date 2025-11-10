import express from "express";
import jobQueue from "../queue/queue.js";
import ImportLog from "../models/ImportLog.js";

const router = express.Router();

// Trigger a new import job
router.post("/trigger", async (req, res) => {
  const { feedUrl, items } = req.body;
  if (!feedUrl || !items) {
    return res.status(400).json({ message: "feedUrl and items required" });
  }
  const job = await jobQueue.add({ feedUrl, items }, { attempts: 3, backoff: 5000 });
  res.json({ jobId: job.id, status: "queued" });
});


router.get("/logs", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const logs = await ImportLog.find().sort({ timestamp: -1 }).limit(limit);
    const formatted = logs.map(log => ({
      _id: log._id,
      timestamp: log.timestamp,
      fileName: log.fileName || log.feedUrl,
      totalFetched: log.totalFetched || log.total || 0,
      newJobs: log.newJobs || log.new || 0,
      updatedJobs: log.updatedJobs || log.updated || 0,
      failedJobs: log.failedJobs || [],
    }));
    res.json(formatted); 
  } catch (err) {
    console.error("Error fetching import logs:", err);
    res.status(500).json({ message: "Failed to fetch import logs" });
  }
});


// Get a single log by ID
router.get("/logs/:id", async (req, res) => {
  try {
    const log = await ImportLog.findById(req.params.id);
    if (!log) return res.status(404).json({ message: "Not found" });
    res.json(log);
  } catch (err) {
    console.error("Error fetching log:", err);
    res.status(500).json({ message: "Failed to fetch log" });
  }
});

router.get("/import-history", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const logs = await ImportLog.find().sort({ timestamp: -1 }).limit(limit);

    // Normalize each log for UI
    const formatted = logs.map((log) => ({
      _id: log._id,
      timestamp: log.timestamp,
      fileName: log.fileName || log.feedUrl, // URL shown as fileName
      totalFetched: log.totalFetched || log.total || 0,
      newJobs: log.newJobs || log.new || 0,
      updatedJobs: log.updatedJobs || log.updated || 0,
      failedJobs: log.failedJobs || [],
    }));
     res.json(formatted); // <-- send array, not { logs: [...] }
  } catch (err) {
    console.error("Error fetching import history:", err);
    res.status(500).json({ message: "Failed to fetch import history" });
  }
});

router.get("/api/stats", async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));

    // Get all logs from today
    const logs = await ImportLog.find({ timestamp: { $gte: startOfDay } });

    // Aggregate stats
    const totalFetched = logs.reduce((sum, l) => sum + (l.totalFetched || 0), 0);
    const newJobs = logs.reduce((sum, l) => sum + (l.newJobs || 0), 0);
    const updatedJobs = logs.reduce((sum, l) => sum + (l.updatedJobs || 0), 0);
    const failedImports = logs.filter((l) => (l.failedJobs?.length || 0) > 0).length;

    res.json({
      totalFetched,
      newJobs,
      updatedJobs,
      failedImports,
      last24hLogs: logs.length,
    });
  } catch (err) {
    console.error("Error fetching stats:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});


export default router;
