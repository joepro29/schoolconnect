import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { can } from "@/lib/roles";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const role = session.user.role;
  const isAdmin = can("leave_approve", role);

  const leaveRequests = await prisma.leaveRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, role: true } } },
    where: isAdmin ? {} : { userId: session.user.id },
  });

  return NextResponse.json({ leaves: leaveRequests, isAdmin });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { startDate, endDate, reason } = await req.json();
  const leave = await prisma.leaveRequest.create({
    data: {
      userId: session.user.id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
    },
  });

  return NextResponse.json(leave);
}
