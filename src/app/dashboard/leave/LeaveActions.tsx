"use client";

import { useState } from "react";
import { CheckCircle, XCircle, Trash2 } from "lucide-react";

export default function LeaveActions({
  leaveId,
  status,
  onUpdated,
  onDeleted,
}: {
  leaveId: string;
  status: string;
  onUpdated?: () => void;
  onDeleted?: () => void;
}) {
  const [loading, setLoading] = useState(false);

  async function handleAction(newStatus: "approved" | "rejected") {
    setLoading(true);
    const res = await fetch(`/api/leave/${leaveId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) onUpdated?.();
    else setLoading(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this leave request?")) return;
    setLoading(true);
    const res = await fetch(`/api/leave/${leaveId}`, { method: "DELETE" });
    if (res.ok) onDeleted?.();
    else setLoading(false);
  }

  if (status !== "pending") {
    return (
      <button onClick={handleDelete} disabled={loading} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
        <Trash2 className="w-4 h-4" />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => handleAction("approved")}
        disabled={loading}
        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
        title="Approve"
      >
        <CheckCircle className="w-4 h-4" />
      </button>
      <button
        onClick={() => handleAction("rejected")}
        disabled={loading}
        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        title="Reject"
      >
        <XCircle className="w-4 h-4" />
      </button>
    </div>
  );
}
