"use client";

import { useState } from "react";
import { formatTime } from "@/lib/utils";

interface CheckInOutProps {
  record: {
    id: string;
    checkIn: Date | string | null;
    checkOut: Date | string | null;
    status: string;
  } | null;
}

export default function CheckInOut({ record, onUpdated }: CheckInOutProps & { onUpdated?: () => void }) {
  const [loading, setLoading] = useState(false);

  async function handleCheckIn() {
    setLoading(true);
    await fetch("/api/attendance", { method: "POST" });
    onUpdated?.();
    setLoading(false);
  }

  async function handleCheckOut() {
    setLoading(true);
    await fetch("/api/attendance", { method: "PATCH" });
    onUpdated?.();
    setLoading(false);
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-900">
            {record?.checkIn ? "Checked In Today" : "Not Checked In"}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {record?.checkIn
              ? `Since ${formatTime(record.checkIn)}`
              : "You haven't checked in today"}
          </p>
        </div>
        <div className="flex gap-3">
          {!record?.checkIn && (
            <button
              onClick={handleCheckIn}
              disabled={loading}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
            >
              {loading ? "..." : "Check In"}
            </button>
          )}
          {record?.checkIn && !record?.checkOut && (
            <button
              onClick={handleCheckOut}
              disabled={loading}
              className="px-6 py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium"
            >
              {loading ? "..." : "Check Out"}
            </button>
          )}
          {record?.checkIn && record?.checkOut && (
            <span className="px-6 py-2.5 bg-gray-100 text-gray-500 rounded-lg font-medium">
              Completed
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
