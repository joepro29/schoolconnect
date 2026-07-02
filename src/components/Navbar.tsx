"use client";

import { useSession } from "next-auth/react";
import { getInitials } from "@/lib/utils";
import { Menu } from "lucide-react";

export default function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-gray-900">
            Welcome back, {user?.name?.split(" ")[0] || "User"}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 capitalize">{user?.role} Portal</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-right">
          <p className="text-sm font-medium text-gray-900">{user?.name}</p>
          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
        </div>
        <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm">
          {getInitials(user?.name || "User")}
        </div>
      </div>
    </header>
  );
}
