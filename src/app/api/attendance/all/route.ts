import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const allAttendance = await prisma.attendance.findMany({
    orderBy: { date: "desc" },
    take: 200,
    include: { user: { select: { id: true, name: true, role: true } } },
  });

  const todayRecords = allAttendance.filter((a) => {
    const d = new Date(a.date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });

  const staff = await prisma.user.findMany({
    where: { role: { in: ["admin", "teacher"] } },
    select: { id: true, name: true, role: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ allAttendance, todayRecords, staff });
}
