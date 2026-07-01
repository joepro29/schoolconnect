import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (session.user.role === "admin") {
    const results = await prisma.result.findMany({
      orderBy: [{ term: "asc" }, { subject: "asc" }],
      include: { student: { select: { id: true, name: true, department: true } } },
    });
    return NextResponse.json(results);
  }

  if (session.user.role === "parent") {
    const children = await prisma.studentParent.findMany({
      where: { parentId: session.user.id },
      include: {
        student: {
          include: { results: { orderBy: [{ term: "asc" }, { subject: "asc" }] } },
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

  const { studentId, term, subject, score, grade, remarks } = await req.json();
  if (!studentId || !term || !subject || score == null || !grade) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const result = await prisma.result.create({
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
