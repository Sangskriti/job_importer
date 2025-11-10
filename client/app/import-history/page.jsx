"use client";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";
import ImportHistoryTable from "../../components/ImportHistoryTable";

export default function ImportHistoryPage() {
  const {
    data,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["importLogs"],
    queryFn: async () => {
      // Fixed: this endpoint returns an array directly
      const res = await api.get("/api/imports/logs?limit=50");
      return res.data; // an array, not an object
    },
    refetchInterval: 60_000, // refresh every 60 seconds
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading logs</div>;

  // Now just pass the array directly
  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Import History</h1>
      <ImportHistoryTable rows={Array.isArray(data) ? data : []} />
    </main>
  );
}
