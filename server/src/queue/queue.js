import Queue from "bull";
import dotenv from "dotenv";
import Job from "../models/Job.js";
import ImportLog from "../models/ImportLog.js";

dotenv.config();

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const jobQueue = new Queue("job-import-queue", redisUrl);

// Process jobs when they are added to the queue
jobQueue.process(async (job) => {
  const { feedUrl, items } = job.data;
  console.log(`⚙️ Processing ${items.length} items from ${feedUrl}...`);

  let created = 0;
  let updated = 0;
  let failed = [];

  for (const item of items) {
    try {
      const existing = await Job.findOne({ externalId: item.externalId });

      if (existing) {
        // update fields that might change
        existing.title = item.title;
        existing.link = item.link;
        existing.description = item.description;
        existing.pubDate = item.pubDate;
        existing.raw = item.raw;
        await existing.save();
        updated++;
      } else {
        await Job.create(item);
        created++;
      }
    } catch (err) {
      console.error(`❌ Error saving job: ${item.title}`, err.message);
      failed.push({
        title: item.title || "(no title)",
        reason: err.message,
      });
    }
  }

  
  await ImportLog.create({
    feedUrl,
    fileName: feedUrl, 
    timestamp: new Date(),
    totalFetched: items.length, 
    newJobs: created,           
    updatedJobs: updated,       
    failedJobs: failed,         
  });

  console.log(
    `Import complete for ${feedUrl}: ${created} new, ${updated} updated, ${failed.length} failed.`
  );

  return { created, updated, failed: failed.length };
});

export default jobQueue;
