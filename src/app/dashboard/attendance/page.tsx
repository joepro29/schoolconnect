import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { formatDate, formatTime } from "@/lib/utils";
import { ClipboardCheck } from "lucide-react";
import CheckInOut from "./CheckInOut";

export default async function AttendancePage() {
  const session = await auth();
  if (!session) redirect("/login");
  const role = session.user!.role;

  if (!["admin", "teacher"].includes(role)) {
    redirect("/dashboard");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayRecord = await prisma.attendance.findFirst({
    where: {
      userId: session.user!.id,
      date: { gte: today },
    },
  });

  const history = await prisma.attendance.findMany({
    where: { userId: session.user!.id },
    orderBy: { date: "desc" },
    take: 30,
  });

  const stats = {
    present: history.filter((a) => a.status === "present").length,
    absent: history.filter((a) => a.status === "absent").length,
    late: history.filter((a) => a.status === "late").length,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
        <p className="text-gray-500 mt-1">Track your daily check-in and check-out</p>
      </div>

      <CheckInOut record={todayRecord} />

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
                      <td className="py-3 text-gray-900">{formatDate(a.date)}</td>
                      <td className="py-3 text-gray-700">
                        {a.checkIn ? formatTime(a.checkIn) : "—"}
                      </td>
                      <td className="py-3 text-gray-700">
                        {a.checkOut ? formatTime(a.checkOut) : "—"}
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
