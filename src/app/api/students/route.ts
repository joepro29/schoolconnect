import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const students = await prisma.student.findMany({
    orderBy: { name: "asc" },
    include: {
      parents: { include: { parent: { select: { id: true, name: true, email: true } } } },
      fees: { select: { id: true } },
      results: { select: { id: true } },
    },
  });

  return NextResponse.json(students);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, email, department } = await req.json();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const student = await prisma.student.create({
    data: { name, email: email || null, department: department || null },
  });

  return NextResponse.json(student);
}
