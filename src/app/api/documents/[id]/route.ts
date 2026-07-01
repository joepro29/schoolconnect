import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { title, description, fileUrl, category, accessRoles } = await req.json();

  const doc = await prisma.document.update({
    where: { id },
    data: {
      title,
      description: description || null,
      fileUrl,
      category: category || "general",
      accessRoles: accessRoles || "all",
    },
  });

  return NextResponse.json(doc);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.document.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
