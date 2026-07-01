import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { dayOfWeek, period, subject, teacherId, room, class: className } = await req.json();
  const entry = await prisma.schedule.create({
    data: { dayOfWeek, period, subject, teacherId, room, class: className },
    include: { teacher: { select: { name: true } } },
  });

  return NextResponse.json(entry);
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || !["admin", "teacher"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entries = await prisma.schedule.findMany({
    orderBy: [{ dayOfWeek: "asc" }, { period: "asc" }],
    include: { teacher: { select: { id: true, name: true } } },
  });

  return NextResponse.json(entries);
}
