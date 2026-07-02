import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { formatDate } from "@/lib/utils";
import EventForm from "./EventForm";
import EventActions from "./EventActions";

const typeColors: Record<string, string> = {
  academic: "bg-blue-100 text-blue-800",
  staff: "bg-purple-100 text-purple-800",
  holiday: "bg-green-100 text-green-800",
  sport: "bg-orange-100 text-orange-800",
  general: "bg-gray-100 text-gray-800",
};

export default async function CalendarPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const role = session.user!.role;
  const isAdmin = role === "admin";

  const events = await prisma.event.findMany({
    orderBy: { date: "asc" },
    where: {
      OR: [
        { targetRoles: "all" },
        { targetRoles: { contains: role } },
      ],
    },
  });

  const grouped = events.reduce<Record<string, typeof events>>((acc, event) => {
    const month = new Date(event.date).toLocaleDateString("en", {
      month: "long",
      year: "numeric",
    });
    if (!acc[month]) acc[month] = [];
    acc[month].push(event);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">School Calendar</h1>
          <p className="text-gray-500 mt-1">Upcoming events, holidays, and important dates</p>
        </div>
        {isAdmin && <EventForm />}
      </div>

      {Object.keys(grouped).length === 0 && (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <CalendarDays className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No events scheduled</p>
        </div>
      )}

      {Object.entries(grouped).map(([month, monthEvents]) => (
        <div key={month}>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">{month}</h2>
          <div className="space-y-3">
            {monthEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-start gap-4"
              >
                <div className="text-center min-w-[56px] bg-indigo-50 rounded-lg p-2">
                  <p className="text-2xl font-bold text-indigo-600">
                    {new Date(event.date).getDate()}
                  </p>
                  <p className="text-xs text-gray-500 uppercase">
                    {new Date(event.date).toLocaleDateString("en", { weekday: "short" })}
                  </p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                        typeColors[event.type] || typeColors.general
                      }`}
                    >
                      {event.type}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                  )}
                  {event.location && (
                    <p className="text-xs text-gray-400 mt-1">📍 {event.location}</p>
                  )}
                  {event.endDate && (
                    <p className="text-xs text-gray-400 mt-1">
                      Until {formatDate(event.endDate)}
                    </p>
                  )}
                </div>
                {isAdmin && (
                  <EventActions event={event} />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
