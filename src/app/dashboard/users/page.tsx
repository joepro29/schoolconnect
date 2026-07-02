import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { GraduationCap, UserPlus } from "lucide-react";
import UserForm from "./UserForm";
import UserActions from "./UserActions";

export default async function UsersPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user!.role !== "admin") redirect("/dashboard");

  const users = await prisma.user.findMany({
    where: { role: { in: ["teacher", "parent"] } },
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: {
      id: true, name: true, email: true, role: true, department: true, phone: true, canUploadDocs: true,
      _count: { select: { announcements: true, schedules: true, children: true } },
    },
  });

  const teachers = users.filter((u) => u.role === "teacher");
  const parents = users.filter((u) => u.role === "parent");

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Accounts</h1>
          <p className="text-gray-500 mt-1">Manage teacher and parent logins</p>
        </div>
        <UserForm />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-indigo-600" />
          Teachers ({teachers.length})
        </h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Department</th>
                <th className="p-4 font-medium text-center">Docs</th>
                <th className="p-4 font-medium text-center">Annc.</th>
                <th className="p-4 font-medium text-center">Classes</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{t.name}</td>
                  <td className="p-4 text-gray-600">{t.email}</td>
                  <td className="p-4 text-gray-600">{t.department || "—"}</td>
                  <td className="p-4 text-center">{t.canUploadDocs ? <span className="text-green-600 font-medium">Yes</span> : <span className="text-gray-400">No</span>}</td>
                  <td className="p-4 text-center text-gray-600">{t._count.announcements}</td>
                  <td className="p-4 text-center text-gray-600">{t._count.schedules}</td>
                  <td className="p-4 text-right">
                    <UserActions user={t} />
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-gray-400">No teachers yet</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-green-600" />
          Parents ({parents.length})
        </h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Email</th>
                <th className="p-4 font-medium">Department</th>
                <th className="p-4 font-medium text-center">Children</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {parents.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{p.name}</td>
                  <td className="p-4 text-gray-600">{p.email}</td>
                  <td className="p-4 text-gray-600">{p.department || "—"}</td>
                  <td className="p-4 text-center text-gray-600">{p._count.children}</td>
                  <td className="p-4 text-right">
                    <UserActions user={p} />
                  </td>
                </tr>
              ))}
              {parents.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">No parents yet</td></tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      </div>
    </div>
  );
}
