import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { Megaphone } from "lucide-react";
import { can } from "@/lib/roles";
import AnnouncementForm from "./AnnouncementForm";
import AnnouncementActions from "./AnnouncementActions";

export default async function AnnouncementsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const role = session.user!.role;

  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true, role: true } } },
    where: {
      OR: [
        { targetRoles: "all" },
        { targetRoles: { contains: role } },
      ],
    },
  });

  const canPost = can("announcement_post", role);
  const canEdit = ["admin", "teacher"].includes(role);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-500 mt-1">School-wide notices and updates</p>
        </div>
        {canPost && <AnnouncementForm />}
      </div>

      <div className="space-y-4">
        {announcements.length === 0 && (
          <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
            <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No announcements yet</p>
          </div>
        )}
        {announcements.map((a) => (
          <div key={a.id} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{a.title}</h3>
                <p className="text-gray-600 mt-2 whitespace-pre-wrap">{a.content}</p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <span className="text-xs capitalize bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full whitespace-nowrap">
                  {a.targetRoles}
                </span>
                {canEdit && <AnnouncementActions announcement={a} />}
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4 text-sm text-gray-400">
              <span className="font-medium text-gray-600">{a.author.name}</span>
              <span>•</span>
              <span className="capitalize">{a.author.role}</span>
              <span>•</span>
              <span>{formatDate(a.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
