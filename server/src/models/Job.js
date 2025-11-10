import mongoose from "mongoose";

const JobSchema = new mongoose.Schema({
  externalId: { type: String, required: true, index: true, unique: true },
  title: String,
  description: String,
  link: String,
  pubDate: Date,
  raw: Object
}, { timestamps: true });

export default mongoose.model("Job", JobSchema);
