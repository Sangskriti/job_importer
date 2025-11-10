"use client";
import React, { useState } from "react";
import dayjs from "dayjs";

export default function ImportHistoryTable({ rows }) {
  const [expanded, setExpanded] = useState(null);

  if (!rows || rows.length === 0) {
    return (
      <div className="bg-white rounded shadow p-4 text-center text-gray-500">
        No import history found.
      </div>
    );
  }

  return (
    <div className="bg-white rounded shadow overflow-x-auto">
      <table className="min-w-full table-auto">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2">Timestamp</th>
            <th className="px-4 py-2">File / URL</th>
            <th className="px-4 py-2">Total</th>
            <th className="px-4 py-2">New</th>
            <th className="px-4 py-2">Updated</th>
            <th className="px-4 py-2">Failed</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {rows.map((r) => {
            const hasFailedJobs = Array.isArray(r.failedJobs) && r.failedJobs.length > 0;
            const isExpanded = expanded === r._id;

            return (
              <React.Fragment key={r._id}>
                {/* Main row */}
                <tr className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">
                    {r.timestamp
                      ? dayjs(r.timestamp).format("YYYY-MM-DD HH:mm")
                      : "—"}
                  </td>
                  <td className="px-4 py-2 max-w-xs truncate text-blue-600">
                    {r.fileName || r.sourceUrl || "—"}
                  </td>
                  <td className="px-4 py-2">{r.totalFetched ?? r.total ?? 0}</td>
                  <td className="px-4 py-2">{r.newJobs ?? r.new ?? 0}</td>
                  <td className="px-4 py-2">{r.updatedJobs ?? r.updated ?? 0}</td>
                  <td className="px-4 py-2">{r.failedJobs?.length || 0}</td>
                  <td className="px-4 py-2 text-center">
                    <button
                      className={`text-sm ${
                        hasFailedJobs
                          ? "text-blue-600 hover:underline"
                          : "text-gray-400 cursor-not-allowed"
                      }`}
                      disabled={!hasFailedJobs}
                      onClick={() =>
                        hasFailedJobs && setExpanded(isExpanded ? null : r._id)
                      }
                    >
                      {hasFailedJobs
                        ? isExpanded
                          ? "Hide"
                          : "View"
                        : "View"}
                    </button>
                  </td>
                </tr>

                {/* Expanded failed jobs */}
                {isExpanded && hasFailedJobs && (
                  <tr className="bg-gray-50 border-t">
                    <td colSpan="7" className="px-4 py-3">
                      <div className="p-2">
                        <h4 className="font-medium mb-1">Failed Jobs</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          {r.failedJobs.map((f, i) => (
                            <li key={i}>
                              <strong>{f.jobId}</strong>: {f.reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
