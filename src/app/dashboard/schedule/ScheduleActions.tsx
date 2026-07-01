"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import ScheduleForm from "./ScheduleForm";

interface ScheduleActionsProps {
  entry: {
    id: string;
    dayOfWeek: number;
    period: number;
    subject: string;
    teacherId: string;
    room: string;
    class: string;
  };
}

export default function ScheduleActions({ entry }: ScheduleActionsProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this schedule entry?")) return;
    const res = await fetch(`/api/schedule/${entry.id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  if (editing) {
    return (
      <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-100">
        <ScheduleForm initial={entry} onClose={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className="flex gap-1 mt-1">
      <button
        onClick={() => setEditing(true)}
        className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
        title="Edit"
      >
        <Pencil className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={handleDelete}
        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
        title="Delete"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
