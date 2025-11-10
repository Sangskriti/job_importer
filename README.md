# job_importer

**Job Importer** is a Node.js project that automatically fetches and stores job listings from multiple RSS feeds (like Jobicy and HigherEdJobs) into a MongoDB database.  
It runs on a schedule using CRON jobs and uses Redis for caching and worker concurrency.

## Features
- Fetch jobs from multiple RSS feeds  
- Store job data in MongoDB  
- Scheduled automatic imports (CRON)  
- Worker-based concurrency for performance  
- Redis caching for faster operations
-View all imported jobs in a table or card view
-Auto-refreshes when new jobs are imported
-Simple and responsive UI
