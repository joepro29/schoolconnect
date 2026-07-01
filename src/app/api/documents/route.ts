import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "admin" && !session.user.canUploadDocs) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, description, fileUrl, category, accessRoles } = await req.json();
  const doc = await prisma.document.create({
    data: {
      title,
      description,
      fileUrl,
      category: category || "general",
      accessRoles: accessRoles || "all",
      uploadedById: session.user.id,
    },
  });

  return NextResponse.json(doc);
}
