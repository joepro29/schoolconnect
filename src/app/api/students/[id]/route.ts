import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { name, email, department } = await req.json();

  const student = await prisma.student.update({
    where: { id },
    data: { name, email: email || null, department: department || null },
  });

  return NextResponse.json(student);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  await prisma.payment.deleteMany({ where: { studentId: id } });
  await prisma.fee.deleteMany({ where: { studentId: id } });
  await prisma.result.deleteMany({ where: { studentId: id } });
  await prisma.studentParent.deleteMany({ where: { studentId: id } });
  await prisma.student.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
