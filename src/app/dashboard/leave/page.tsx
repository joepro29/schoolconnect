"use client";

import { useState, useEffect, useCallback } from "react";
import { Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";
import LeaveForm from "./LeaveForm";
import LeaveActions from "./LeaveActions";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

const statusIcons: Record<string, any> = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
};

interface LeaveData {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  user: { name: string; role: string };
}

export default function LeavePage() {
  const [leaves, setLeaves] = useState<LeaveData[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = useCallback(async () => {
    const res = await fetch("/api/leave");
    if (res.ok) {
      const data = await res.json();
      setLeaves(data.leaves || []);
      setIsAdmin(data.isAdmin || false);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  if (loading) return <div className="max-w-4xl mx-auto p-8 text-center text-gray-400">Loading...</div>;

  const pendingCount = leaves.filter((l) => l.status === "pending").length;
  const approvedCount = leaves.filter((l) => l.status === "approved").length;
  const rejectedCount = leaves.filter((l) => l.status === "rejected").length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-500 mt-1">
            {isAdmin ? "Manage all staff leave requests" : "Request and track your time off"}
          </p>
        </div>
        <LeaveForm onCreated={fetchLeaves} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Pending", value: pendingCount, icon: Clock, color: "bg-yellow-500" },
          { label: "Approved", value: approvedCount, icon: CheckCircle, color: "bg-green-500" },
          { label: "Rejected", value: rejectedCount, icon: XCircle, color: "bg-red-500" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Leave History</h2>
          {leaves.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No leave requests yet</p>
          ) : (
            <div className="space-y-3">
              {leaves.map((leave) => {
                const StatusIcon = statusIcons[leave.status];
                return (
                  <div
                    key={leave.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatDate(new Date(leave.startDate))} - {formatDate(new Date(leave.endDate))}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{leave.reason}</p>
                        {isAdmin && (
                          <p className="text-xs text-gray-400 mt-0.5">{leave.user.name}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 capitalize ${
                          statusColors[leave.status]
                        }`}
                      >
                        <StatusIcon className="w-3 h-3" />
                        {leave.status}
                      </span>
                      {isAdmin && (
                        <LeaveActions
                          leaveId={leave.id}
                          status={leave.status}
                          onUpdated={fetchLeaves}
                          onDeleted={fetchLeaves}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
