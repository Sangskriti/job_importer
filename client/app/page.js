// app/page.jsx
import Link from "next/link";
import dayjs from "dayjs";
import { StatsCard } from "../components/StatsCard";


const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:4000";

async function fetchStats() {
  try {
    const res = await fetch(`${API_BASE}/api/stats`, { cache: "no-store" });
    if (!res.ok) {
      // throw to be caught below and return null
      throw new Error(`Failed to fetch: ${res.status} ${res.statusText}`);
    }
    return res.json();
  } catch (err) {
    // swallow error and return null so page still renders
    console.error("fetchStats error:", err);
    return null;
  }
}

export default async function HomePage() {
  const data = await fetchStats();

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Artha Admin</h1>
          <p className="text-sm text-gray-600 mt-1">Admin panel for job imports — quick overview.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Open Dashboard
          </Link>
          <Link href="/import-history" className="px-3 py-2 bg-gray-100 rounded hover:bg-gray-200">
            Import History
          </Link>
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Jobs"
          value={data?.totalJobs ? Number(data.totalJobs).toLocaleString() : "—"}
          delta={data?.jobsDelta ? `${data.jobsDelta >= 0 ? "+" : ""}${data.jobsDelta} today` : null}
          description={data?.lastImportAt ? `Last import: ${dayjs(data.lastImportAt).format("YYYY-MM-DD HH:mm")}` : "No imports yet"}
        />

        <StatsCard
          title="New Jobs (today)"
          value={data?.newJobsToday ?? "—"}
          description="Jobs created from today's imports"
        />

        <StatsCard
          title="Updated Jobs (today)"
          value={data?.updatedJobsToday ?? "—"}
          description="Existing jobs updated today"
        />

        <StatsCard
          title="Failed Imports (24h)"
          value={data?.failedImports ?? "—"}
          delta={data?.failedDelta ? `${data.failedDelta >= 0 ? "+" : ""}${data.failedDelta} vs yesterday` : null}
          description="Failed job imports in last 24 hours"
        />
      </section>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Quick actions</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <Link className="text-blue-600" href="/dashboard">Go to Dashboard</Link>
          </li>
          <li>
            <Link className="text-blue-600" href="/import-history">View Import History</Link>
          </li>
        </ul>
      </div>

      {/* If data is null, show a small hint */}
      {!data && (
        <p className="text-sm text-red-600 mt-4">
          Unable to fetch stats from the backend. Check <code>NEXT_PUBLIC_API_BASE</code> and ensure your backend is running.
        </p>
      )}
    </main>
  );
}
