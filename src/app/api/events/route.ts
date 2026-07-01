import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, date, endDate, location, type, targetRoles } = await req.json();

  const event = await prisma.event.create({
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
