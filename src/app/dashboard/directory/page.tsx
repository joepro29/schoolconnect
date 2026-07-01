import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Mail, Phone, Building2 } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { can } from "@/lib/roles";

const roleColors: Record<string, string> = {
  admin: "bg-purple-100 text-purple-800",
  teacher: "bg-blue-100 text-blue-800",
  student: "bg-green-100 text-green-800",
  parent: "bg-orange-100 text-orange-800",
};

export default async function DirectoryPage() {
  const session = await auth();
  if (!session) redirect("/login");
  const role = session.user!.role;
  const isFullAccess = can("directory_full", role);

  const whereFilter = isFullAccess
    ? {}
    : { role: { in: ["admin", "teacher"] } };

  const users = await prisma.user.findMany({
    where: whereFilter,
    orderBy: [{ role: "asc" }, { name: "asc" }],
    select: isFullAccess
      ? { id: true, name: true, email: true, role: true, department: true, phone: true }
      : { id: true, name: true, email: true, role: true, department: true },
  });

  const groups = users.reduce<Record<string, typeof users>>((acc, user) => {
    const key = user.role.charAt(0).toUpperCase() + user.role.slice(1) + "s";
    if (!acc[key]) acc[key] = [];
    acc[key].push(user);
    return acc;
  }, {});

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Directory</h1>
        <p className="text-gray-500 mt-1">
          {isFullAccess ? "Find contact information for school staff" : "View school staff"}
        </p>
      </div>

      {Object.entries(groups).map(([group, members]) => (
        <div key={group}>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">{group}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex items-start gap-4"
              >
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold flex-shrink-0">
                  {getInitials(user.name)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 truncate">{user.name}</h3>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                        roleColors[user.role] || "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                  {user.department && (
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {user.department}
                    </p>
                  )}
                  {isFullAccess && (
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                      <a
                        href={`mailto:${user.email}`}
                        className="flex items-center gap-1 hover:text-indigo-600"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Email
                      </a>
                      {(user as any).phone && (
                        <a
                          href={`tel:${(user as any).phone}`}
                          className="flex items-center gap-1 hover:text-indigo-600"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          Call
                        </a>
                      )}
                    </div>
                  )}
                  {!isFullAccess && (
                    <p className="text-xs text-gray-400 mt-2">{user.email}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
