"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/cn";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Megaphone,
  Clock,
  CalendarRange,
  ClipboardCheck,
  FileText,
  DollarSign,
  Award,
  GraduationCap,
  UserPlus,
  LogOut,
} from "lucide-react";
import { SIDEBAR_ITEMS } from "@/lib/roles";

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Calendar,
  Users,
  Megaphone,
  Clock,
  CalendarRange,
  ClipboardCheck,
  FileText,
  DollarSign,
  Award,
  GraduationCap,
  UserPlus,
};

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role || "parent";

  const visibleItems = SIDEBAR_ITEMS.filter((item) =>
    item.roles.includes(role)
  );

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      <div className="p-6 border-b border-gray-200">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">SC</span>
          </div>
          <span className="font-semibold text-gray-900">SchoolConnect</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {visibleItems.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              {Icon && <Icon className="w-5 h-5" />}
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
