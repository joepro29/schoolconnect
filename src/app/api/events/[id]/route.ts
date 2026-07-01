import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { title, description, date, endDate, location, type, targetRoles } = await req.json();

  const event = await prisma.event.update({
    where: { id },
    data: {
      title,
      description,
      date: new Date(date),
      endDate: endDate ? new Date(endDate) : null,
      location,
      type: type || "general",
      targetRoles: targetRoles || "all",
    },
  });

  return NextResponse.json(event);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.event.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
