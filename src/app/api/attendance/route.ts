import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayRecord = await prisma.attendance.findFirst({
    where: { userId: session.user!.id, date: { gte: today } },
  });

  const history = await prisma.attendance.findMany({
    where: { userId: session.user!.id },
    orderBy: { date: "desc" },
    take: 30,
  });

  return NextResponse.json({ todayRecord, history, role: session.user.role });
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.attendance.findFirst({
    where: { userId: session.user.id, date: { gte: today } },
  });

  if (existing) {
    return NextResponse.json({ error: "Already checked in today" }, { status: 400 });
  }

  const now = new Date();
  const hour = now.getHours();
  const status = hour >= 9 ? "late" : "present";

  const record = await prisma.attendance.create({
    data: { userId: session.user.id, checkIn: now, status },
  });

  return NextResponse.json(record);
}

export async function PATCH() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.attendance.findFirst({
    where: { userId: session.user.id, date: { gte: today }, checkOut: null },
  });

  if (!existing) {
    return NextResponse.json({ error: "No active check-in found" }, { status: 400 });
  }

  const record = await prisma.attendance.update({
    where: { id: existing.id },
    data: { checkOut: new Date() },
  });

  return NextResponse.json(record);
}
