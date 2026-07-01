import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || !["admin", "teacher"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { title, content, targetRoles } = await req.json();

  const announcement = await prisma.announcement.update({
    where: { id },
    data: { title, content, targetRoles: targetRoles || "all" },
  });

  return NextResponse.json(announcement);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || !["admin", "teacher"].includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.announcement.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
