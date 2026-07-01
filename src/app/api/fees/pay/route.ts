import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "parent") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { feeId, amount, method, reference } = await req.json();

  const fee = await prisma.fee.findUnique({
    where: { id: feeId },
    include: { payments: true },
  });

  if (!fee) {
    return NextResponse.json({ error: "Fee not found" }, { status: 404 });
  }

  const paid = fee.payments.reduce((sum, p) => sum + p.amount, 0);
  const balance = fee.amount - paid;

  if (amount <= 0 || amount > balance) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const payment = await prisma.payment.create({
    data: {
      feeId,
      studentId: fee.studentId,
      amount,
      method: method || "cash",
      reference: reference || null,
    },
  });

  return NextResponse.json(payment);
}
