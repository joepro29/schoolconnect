import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hash } from "bcryptjs";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { name, email, department, phone, canUploadDocs, password } = await req.json();

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (user.role === "admin") return NextResponse.json({ error: "Cannot edit admin" }, { status: 400 });

  const data: any = {};
  if (name !== undefined) data.name = name;
  if (email !== undefined) data.email = email;
  if (department !== undefined) data.department = department;
  if (phone !== undefined) data.phone = phone;
  if (canUploadDocs !== undefined) data.canUploadDocs = canUploadDocs;
  if (password) data.password = await hash(password, 12);

  const updated = await prisma.user.update({ where: { id }, data });

  return NextResponse.json({ id: updated.id, name: updated.name, email: updated.email, role: updated.role });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (user.role === "admin") {
    return NextResponse.json({ error: "Cannot delete admin accounts" }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    if (user.role === "teacher") {
      await tx.announcement.deleteMany({ where: { authorId: id } });
      await tx.schedule.deleteMany({ where: { teacherId: id } });
      await tx.leaveRequest.deleteMany({ where: { userId: id } });
      await tx.attendance.deleteMany({ where: { userId: id } });
      await tx.document.deleteMany({ where: { uploadedById: id } });
    }
    if (user.role === "parent") {
      await tx.studentParent.deleteMany({ where: { parentId: id } });
    }
    await tx.user.delete({ where: { id } });
  });

  return NextResponse.json({ success: true });
}
