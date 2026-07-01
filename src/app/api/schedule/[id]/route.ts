import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { dayOfWeek, period, subject, teacherId, room, class: className } = await req.json();

  const entry = await prisma.schedule.update({
    where: { id },
    data: { dayOfWeek, period, subject, teacherId, room, class: className },
    include: { teacher: { select: { name: true } } },
  });

  return NextResponse.json(entry);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.schedule.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
