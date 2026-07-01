import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, email, password, role, department, phone, canUploadDocs } = await req.json();

  if (!["teacher", "parent"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "A user with this email already exists" }, { status: 400 });
  }

  const hashed = await hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role, department, phone, canUploadDocs },
  });

  return NextResponse.json({ id: user.id, name: user.name, email: user.email, role: user.role });
}
