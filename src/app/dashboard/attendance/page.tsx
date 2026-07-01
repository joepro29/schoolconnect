"use client";

import { useState, useEffect, useCallback } from "react";
import { formatDate, formatTime } from "@/lib/utils";
import { ClipboardCheck, Users } from "lucide-react";
import CheckInOut from "./CheckInOut";

interface AttendanceRecord {
  id: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  user: { id: string; name: string; role: string };
}

interface StaffMember {
  id: string;
  name: string;
  role: string;
}

export default function AttendancePage() {
  const [todayRecord, setTodayRecord] = useState<any>(null);
  const [history, setHistory] = useState<AttendanceRecord[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([]);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [selfRes, allRes] = await Promise.all([
      fetch("/api/attendance"),
      fetch("/api/attendance/all"),
    ]);

    if (selfRes.ok) {
      const data = await selfRes.json();
      setTodayRecord(data.todayRecord);
      setHistory(data.history || []);
      setRole(data.role);
    }

    if (allRes.ok) {
      const data = await allRes.json();
      setTodayRecords(data.todayRecords || []);
      setStaff(data.staff || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="max-w-4xl mx-auto p-8 text-center text-gray-400">Loading...</div>;

  const isAdmin = role === "admin";

  const stats = {
    present: history.filter((a) => a.status === "present").length,
    absent: history.filter((a) => a.status === "absent").length,
    late: history.filter((a) => a.status === "late").length,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-500 mt-1">
          {isAdmin ? "Staff attendance overview" : "Track your daily check-in and check-out"}
        </p>
      </div>

      <CheckInOut record={todayRecord} onUpdated={fetchData} />

      {isAdmin && (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <h2 className="font-semibold text-gray-900">Today&apos;s Staff Attendance</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50">
                  <th className="p-4 font-medium">Name</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium">Check In</th>
                  <th className="p-4 font-medium">Check Out</th>
                  <th className="p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((s) => {
                  const record = todayRecords.find((r) => r.user.id === s.id);
                  return (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-4 font-medium text-gray-900">{s.name}</td>
                      <td className="p-4 text-gray-500 capitalize">{s.role}</td>
                      <td className="p-4 text-gray-700">
                        {record?.checkIn ? formatTime(new Date(record.checkIn)) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="p-4 text-gray-700">
                        {record?.checkOut ? formatTime(new Date(record.checkOut)) : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="p-4">
                        {record ? (
                          <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                            record.status === "present" ? "bg-green-100 text-green-800" :
                            record.status === "late" ? "bg-orange-100 text-orange-800" :
                            "bg-red-100 text-red-800"
                          }`}>{record.status}</span>
                        ) : (
                          <span className="text-xs text-gray-300">No record</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Present", value: stats.present, color: "bg-green-500" },
          { label: "Late", value: stats.late, color: "bg-orange-500" },
          { label: "Absent", value: stats.absent, color: "bg-red-500" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className={`${stat.color} p-2 rounded-lg`}>
                <ClipboardCheck className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Recent Attendance</h2>
          {history.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No attendance records yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Check In</th>
                    <th className="pb-3 font-medium">Check Out</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((a) => (
                    <tr key={a.id} className="border-b border-gray-50">
                      <td className="py-3 text-gray-900">{formatDate(new Date(a.date))}</td>
                      <td className="py-3 text-gray-700">
                        {a.checkIn ? formatTime(new Date(a.checkIn)) : "—"}
                      </td>
                      <td className="py-3 text-gray-700">
                        {a.checkOut ? formatTime(new Date(a.checkOut)) : "—"}
                      </td>
                      <td className="py-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full capitalize ${
                            a.status === "present"
                              ? "bg-green-100 text-green-800"
                              : a.status === "late"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
