# 🧠 System Architecture — Job Importer

## Overview
This system automatically imports job listings from multiple RSS feeds, stores them in a MongoDB database, and provides a dashboard to visualize import history, stats, and failures.

It consists of two main applications:

- **Server:** Node.js (Express) backend that fetches feeds, processes jobs via Redis queue, and stores data in MongoDB.
- **Client:** Next.js frontend for viewing dashboards, logs, and triggering manual imports.

---

## 🏗️ Architecture Diagram

+------------+        +-------------+         +-----------+
|  Cron Job  | -----> |  jobQueue   |  --->   |  MongoDB  |
| (Node-cron)|         | (Bull + Redis) |      | (Jobs + Logs) |
+------------+         +-------------+         +-----------+
        |                        ^
        v                        |
+-------------------+     +----------------+
| fetchJobsFromUrl()|     | Import Worker  |
| (parses RSS feeds)|     | processes queue|
+-------------------+     +----------------+

          |
          v
+----------------+
| Next.js Client |
|  Dashboard UI  |
+----------------+


---

## 🧩 Key Components

### 1. **Fetcher (`fetchJobsFromUrl`)**
- Uses `axios` and `xml2js` to parse RSS/Atom feeds.
- Cleans malformed XML and normalizes data fields.
- Ensures each job has a unique `externalId`.

### 2. **Queue System**
- Built with `bull` and Redis.
- Processes fetched jobs asynchronously.
- Handles retries, backoff, and logging of results.

### 3. **Database (MongoDB)**
- **Collections:**
  - `jobs` — stores unique job records.
  - `importlogs` — logs of every import run with counts of total, new, updated, failed.

### 4. **Backend (Express)**
- Routes:
  - `POST /api/fetch-now` — manually trigger feed import.
  - `GET /api/imports/logs` — list all import logs.
  - `GET /api/imports/stats` — return aggregated metrics for dashboard.
- Cron job automatically imports feeds at intervals.

### 5. **Frontend (Next.js)**
- Uses React Query for live API fetching.
- Displays:
  - Import History Table
  - Dashboard Cards
- Minimal Tailwind CSS for styling.

---

## ⚙️ Deployment

| Service | Purpose | Notes |
|----------|----------|-------|
| **MongoDB Atlas** | Stores jobs and logs | Cloud-hosted DB |
| **Redis Cloud** | Queue backend for Bull | Required for jobQueue |
| **Vercel / Netlify** | Frontend hosting | Easy Next.js deployment |
| **Render / Railway** | Backend hosting | Auto deploys from GitHub |

---

## 🧩 Design Decisions

- **Bull + Redis** → chosen for reliability and retry behavior vs. direct DB writes.
- **MongoDB** → flexible schema for diverse job feeds.
- **Cron Jobs** → simple scheduling without external services.
- **Next.js + React Query** → fast data loading and live refresh UI.
- **ImportLog model** → provides full observability (new, updated, failed per run).

---

## 🔍 Future Enhancements
- Add 7-day trend chart for jobs imported per day.
- Add Slack/email alerts for failed imports.
- Add feed-specific dashboards.
- Add job deduplication by `title + company`.

---

_Last updated: {{TODAY}}_
