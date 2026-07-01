import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { studentId, term, description, amount, dueDate } = await req.json();

  const fee = await prisma.fee.update({
    where: { id },
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

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.payment.deleteMany({ where: { feeId: id } });
  await prisma.fee.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
