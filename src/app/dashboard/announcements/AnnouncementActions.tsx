"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import AnnouncementForm from "./AnnouncementForm";

interface AnnouncementActionsProps {
  announcement: {
    id: string;
    title: string;
    content: string;
    targetRoles: string;
  };
}

export default function AnnouncementActions({ announcement }: AnnouncementActionsProps) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this announcement?")) return;
    const res = await fetch(`/api/announcements/${announcement.id}`, {
      method: "DELETE",
    });
    if (res.ok) router.refresh();
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setShowEdit(true)}
          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
          title="Edit"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {showEdit && (
        <AnnouncementForm
          editAnnouncement={announcement}
          onClose={() => setShowEdit(false)}
        />
      )}
    </>
  );
}
