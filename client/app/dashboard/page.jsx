"use client";

import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";
import { StatsCard } from "../../components/StatsCard";
import dayjs from "dayjs";

export default function DashboardPage() {
  // fetch function — expects backend endpoint GET /api/stats
  const fetchStats = async () => {
    const res = await api.get("/api/stats"); // ensure your backend matches this route
    return res.data;
  };

  // Updated for TanStack Query v5 syntax
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchStats,
    staleTime: 60_000, // 1 minute
    refetchOnWindowFocus: false,
  });

  return (
    <main className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
            disabled={isFetching}
          >
            {isFetching ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-12 bg-gray-100 animate-pulse rounded" />
          <div className="h-12 bg-gray-100 animate-pulse rounded" />
          <div className="h-12 bg-gray-100 animate-pulse rounded" />
        </div>
      ) : isError ? (
        <div className="text-red-600">
          Error loading stats: {String(error?.message || error)}
        </div>
      ) : (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Jobs Imported"
            value={data?.totalJobs?.toLocaleString() ?? "—"}
            delta={
              data?.jobsDelta
                ? `${data.jobsDelta >= 0 ? "+" : ""}${data.jobsDelta} today`
                : null
            }
            description={
              data?.lastImportAt
                ? `Last import: ${dayjs(data.lastImportAt).format(
                    "YYYY-MM-DD HH:mm"
                  )}`
                : "No imports yet"
            }
          />

          <StatsCard
            title="New Jobs (today)"
            value={data?.newJobsToday ?? 0}
            description="Jobs created from today's imports"
          />

          <StatsCard
            title="Updated Jobs (today)"
            value={data?.updatedJobsToday ?? 0}
            description="Existing jobs updated today"
          />

          <StatsCard
            title="Failed Imports"
            value={data?.failedImports ?? 0}
            delta={
              data?.failedDelta
                ? `${data.failedDelta >= 0 ? "+" : ""}${data.failedDelta} vs yesterday`
                : null
            }
            description="Failed job imports in last 24h"
          />
        </section>
      )}
    </main>
  );
}
