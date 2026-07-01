import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { studentId, parentEmail } = await req.json();

  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const parent = await prisma.user.findUnique({
    where: { email: parentEmail },
  });
  if (!parent || parent.role !== "parent") {
    return NextResponse.json({ error: "Parent not found. Ensure the email belongs to a parent account." }, { status: 404 });
  }

  const existing = await prisma.studentParent.findFirst({
    where: { parentId: parent.id, studentId },
  });

  if (existing) {
    return NextResponse.json({ error: "This parent is already linked to the student." }, { status: 400 });
  }

  const link = await prisma.studentParent.create({
    data: { parentId: parent.id, studentId, relation: "parent" },
  });

  return NextResponse.json(link);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { studentId, parentId } = await req.json();

  const link = await prisma.studentParent.findFirst({
    where: { parentId, studentId },
  });

  if (!link) {
    return NextResponse.json({ error: "Link not found" }, { status: 404 });
  }

  await prisma.studentParent.delete({ where: { id: link.id } });

  return NextResponse.json({ success: true });
}
