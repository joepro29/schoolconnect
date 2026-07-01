import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import {
  Megaphone, Calendar, Clock, Users,
  ClipboardCheck, DollarSign,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const user = session.user!;

  const [announcements, events] = await Promise.all([
    prisma.announcement.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true } } },
      where: {
        OR: [{ targetRoles: "all" }, { targetRoles: { contains: user.role } }],
      },
    }),
    prisma.event.findMany({
      take: 5,
      orderBy: { date: "asc" },
      where: {
        date: { gte: new Date() },
        OR: [{ targetRoles: "all" }, { targetRoles: { contains: user.role } }],
      },
    }),
  ]);

  if (user.role === "parent") {
    const parentData = await prisma.studentParent.findMany({
      where: { parentId: user.id },
      include: {
        student: {
          include: {
            fees: { include: { payments: true } },
            results: true,
          },
        },
      },
    });

    const children = parentData || [];
    let totalBalance = 0;
    children.forEach(({ student }) => {
      student.fees.forEach((fee) => {
        const paid = fee.payments.reduce((s, p) => s + p.amount, 0);
        totalBalance += Math.max(0, fee.amount - paid);
      });
    });

    const stats = [
      { label: "Children", value: children.length.toString(), icon: Users, color: "bg-blue-500" },
      { label: "Outstanding Balance", value: `$${totalBalance.toFixed(2)}`, icon: DollarSign, color: totalBalance === 0 ? "bg-green-500" : "bg-red-500" },
      { label: "Upcoming Events", value: events.length.toString(), icon: Calendar, color: "bg-green-500" },
      { label: "Announcements", value: announcements.length.toString(), icon: Megaphone, color: "bg-purple-500" },
    ];

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Children</h2>
            {children.length === 0 ? (
              <p className="text-sm text-gray-400">No children linked to your account.</p>
            ) : (
              <div className="space-y-4">
                {children.map(({ student, relation }) => {
                  const fees = student.fees;
                  const totalFees = fees.reduce((s, f) => s + f.amount, 0);
                  const totalPaid = fees.reduce((s, f) => s + f.payments.reduce((sp, p) => sp + p.amount, 0), 0);
                  const bal = totalFees - totalPaid;
                  return (
                    <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-500">Class: {student.department || "N/A"} • {relation}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-semibold ${bal === 0 ? "text-green-600" : "text-red-600"}`}>
                          {bal === 0 ? "Fully Paid" : `$${bal.toFixed(2)} due`}
                        </p>
                        {student.results.length > 0 && (
                          <p className="text-xs text-gray-400">{student.results.length} subjects recorded</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
              <Link href="/dashboard/calendar" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View all</Link>
            </div>
            <div className="space-y-4">
              {events.map((e) => (
                <div key={e.id} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="text-center min-w-[48px]">
                    <p className="text-lg font-bold text-indigo-600">{new Date(e.date).getDate()}</p>
                    <p className="text-xs text-gray-500 uppercase">{new Date(e.date).toLocaleDateString("en", { month: "short" })}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{e.title}</p>
                    <p className="text-sm text-gray-500">{e.description}</p>
                  </div>
                </div>
              ))}
              {events.length === 0 && <p className="text-sm text-gray-400">No upcoming events</p>}
            </div>
          </div>
        </div>

        <Link href="/dashboard/fees" className="block bg-indigo-50 rounded-xl p-6 border border-indigo-100 hover:bg-indigo-100 transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DollarSign className="w-6 h-6 text-indigo-600" />
              <div>
                <p className="font-semibold text-indigo-900">View Fee Details</p>
                <p className="text-sm text-indigo-700">See full breakdown and make payments</p>
              </div>
            </div>
            <span className="text-indigo-600 font-medium text-sm">Go to Fees →</span>
          </div>
        </Link>
      </div>
    );
  }

  const todaySchedule = await prisma.schedule.findMany({
    where: { dayOfWeek: new Date().getDay() || 7 },
    include: { teacher: { select: { name: true } } },
    orderBy: { period: "asc" },
  });

  const showSchedule = ["admin", "teacher"].includes(user.role);

  const stats = [
    { label: "Today's Classes", value: todaySchedule.length.toString(), icon: Clock, color: "bg-blue-500", show: showSchedule },
    { label: "Upcoming Events", value: events.length.toString(), icon: Calendar, color: "bg-green-500", show: true },
    { label: "Announcements", value: announcements.length.toString(), icon: Megaphone, color: "bg-purple-500", show: true },
    { label: "Active Staff", value: "24", icon: Users, color: "bg-orange-500", show: user.role === "admin" },
    { label: "Attendance", value: "Today", icon: ClipboardCheck, color: "bg-teal-500", show: showSchedule },
  ].filter((s) => s.show);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Announcements</h2>
            <Link href="/dashboard/announcements" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View all</Link>
          </div>
          <div className="space-y-4">
            {announcements.map((a) => (
              <div key={a.id} className="pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <p className="font-medium text-gray-900">{a.title}</p>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{a.content}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <span>{a.author.name}</span>
                  <span>•</span>
                  <span>{formatDate(a.createdAt)}</span>
                </div>
              </div>
            ))}
            {announcements.length === 0 && <p className="text-sm text-gray-400">No announcements yet</p>}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
            <Link href="/dashboard/calendar" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View all</Link>
          </div>
          <div className="space-y-4">
            {events.map((e) => (
              <div key={e.id} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="text-center min-w-[48px]">
                  <p className="text-lg font-bold text-indigo-600">{new Date(e.date).getDate()}</p>
                  <p className="text-xs text-gray-500 uppercase">{new Date(e.date).toLocaleDateString("en", { month: "short" })}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{e.title}</p>
                  <p className="text-sm text-gray-500">{e.description}</p>
                </div>
              </div>
            ))}
            {events.length === 0 && <p className="text-sm text-gray-400">No upcoming events</p>}
          </div>
        </div>
      </div>

      {showSchedule && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
            <Link href="/dashboard/schedule" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View full schedule</Link>
          </div>
          {todaySchedule.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="pb-3 font-medium">Period</th>
                    <th className="pb-3 font-medium">Subject</th>
                    <th className="pb-3 font-medium">Teacher</th>
                    <th className="pb-3 font-medium">Room</th>
                    <th className="pb-3 font-medium">Class</th>
                  </tr>
                </thead>
                <tbody>
                  {todaySchedule.map((s) => (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 font-medium text-gray-900">{s.period}</td>
                      <td className="py-3 text-gray-700">{s.subject}</td>
                      <td className="py-3 text-gray-700">{s.teacher.name}</td>
                      <td className="py-3 text-gray-700">{s.room}</td>
                      <td className="py-3 text-gray-700">{s.class}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No classes scheduled for today</p>
          )}
        </div>
      )}
    </div>
  );
}
