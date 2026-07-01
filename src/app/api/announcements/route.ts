import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!["admin", "teacher"].includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, content, targetRoles } = await req.json();
  const announcement = await prisma.announcement.create({
    data: {
      title,
      content,
      targetRoles: targetRoles || "all",
      authorId: session.user.id,
    },
  });

  return NextResponse.json(announcement);
}
