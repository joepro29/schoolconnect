import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { studentId, term, subject, score, grade, remarks } = await req.json();

  const result = await prisma.result.update({
    where: { id },
    data: {
      studentId,
      term,
      subject,
      score: parseFloat(score),
      grade,
      remarks: remarks || null,
    },
  });

  return NextResponse.json(result);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.result.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
