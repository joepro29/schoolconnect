import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role === "admin") {
    const fees = await prisma.fee.findMany({
      orderBy: [{ term: "asc" }, { description: "asc" }],
      include: {
        student: { select: { id: true, name: true, department: true } },
        payments: true,
      },
    });
    return NextResponse.json(fees);
  }

  if (session.user.role === "parent") {
    const children = await prisma.studentParent.findMany({
      where: { parentId: session.user.id },
      include: {
        student: {
          include: {
            fees: { include: { payments: true }, orderBy: { term: "asc" } },
          },
        },
      },
    });
    return NextResponse.json(children);
  }

  return NextResponse.json([]);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { studentId, term, description, amount, dueDate } = await req.json();
  if (!studentId || !term || !description || amount == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const fee = await prisma.fee.create({
    data: {
      studentId,
      term,
      description,
      amount: parseFloat(amount),
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });

  return NextResponse.json(fee);
}
