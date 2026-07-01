"use client";

import { useSession } from "next-auth/react";
import { getInitials } from "@/lib/utils";

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold text-gray-900">
          Welcome back, {user?.name?.split(" ")[0] || "User"}
        </h1>
        <p className="text-sm text-gray-500 capitalize">{user?.role} Portal</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
          </div>
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {getInitials(user?.name || "User")}
          </div>
        </div>
      </div>
    </header>
  );
}
