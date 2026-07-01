import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Clock } from "lucide-react";
import ScheduleForm from "./ScheduleForm";
import ScheduleActions from "./ScheduleActions";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default async function SchedulePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const role = session.user!.role;
  if (!["admin", "teacher"].includes(role)) redirect("/dashboard");

  const schedule = await prisma.schedule.findMany({
    orderBy: [{ dayOfWeek: "asc" }, { period: "asc" }],
    include: { teacher: { select: { id: true, name: true } } },
  });

  const byDay = schedule.reduce<Record<number, typeof schedule>>(
    (acc, s) => {
      if (!acc[s.dayOfWeek]) acc[s.dayOfWeek] = [];
      acc[s.dayOfWeek].push(s);
      return acc;
    },
    {}
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Class Schedule</h1>
          <p className="text-gray-500 mt-1">Weekly timetable for all classes</p>
        </div>
        {role === "admin" && <ScheduleForm />}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {days.map((day, idx) => {
          const dayNum = idx + 1;
          const slots = byDay[dayNum] || [];
          const isToday = new Date().getDay() === dayNum;

          return (
            <div
              key={day}
              className={`bg-white rounded-xl border shadow-sm ${
                isToday ? "border-indigo-300 ring-1 ring-indigo-100" : "border-gray-100"
              }`}
            >
              <div className={`p-3 rounded-t-xl ${
                isToday ? "bg-indigo-50" : "bg-gray-50"
              }`}>
                <p className="font-semibold text-sm text-gray-900">
                  {day}
                  {isToday && <span className="text-indigo-600 ml-1">• Today</span>}
                </p>
              </div>
              <div className="p-3 space-y-2">
                {slots.length === 0 && (
                  <p className="text-xs text-gray-400 text-center py-4">No classes</p>
                )}
                {slots.map((s) => (
                  <div
                    key={s.id}
                    className="p-2.5 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div className="flex items-center justify-between gap-1 text-xs text-gray-400 mb-1">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Period {s.period}</span>
                      </div>
                      {role === "admin" && <ScheduleActions entry={s} />}
                    </div>
                    <p className="font-medium text-sm text-gray-900">{s.subject}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {s.teacher.name} • Room {s.room}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.class}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
