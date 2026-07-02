"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/cn";
import { signOut } from "next-auth/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

export default function Sidebar({
  open,
  onClose,
  onOpen,
}: {
  open: boolean;
  onClose: () => void;
  onOpen: () => void;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = session?.user?.role || "parent";

  const visibleItems = SIDEBAR_ITEMS.filter((item) =>
    item.roles.includes(role)
  );

  return (
    <>
      {!open && (
        <button
          onClick={onOpen}
          className="fixed top-1/2 -translate-y-1/2 left-0 z-50 bg-indigo-600 text-white p-1.5 rounded-r-lg shadow-lg lg:hidden hover:bg-indigo-700 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2" onClick={onClose}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SC</span>
            </div>
            <span className="font-semibold text-gray-900">SchoolConnect</span>
          </Link>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 lg:hidden"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {visibleItems.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
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
    </>
  );
}
