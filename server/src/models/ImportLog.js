import mongoose from "mongoose";

const ImportLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  totalFetched: Number,
  totalImported: Number,
  newJobs: Number,
  updatedJobs: Number,
  failedJobs: [{ externalId: String, reason: String }],
  feedUrl: String
}, { timestamps: true });

export default mongoose.model("ImportLog", ImportLogSchema);
