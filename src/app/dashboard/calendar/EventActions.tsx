"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import EventForm from "./EventForm";

interface EventActionsProps {
  event: {
    id: string;
    title: string;
    description: string | null;
    date: Date;
    endDate: Date | null;
    location: string | null;
    type: string;
    targetRoles: string;
  };
}

export default function EventActions({ event }: EventActionsProps) {
  const router = useRouter();
  const [showEdit, setShowEdit] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this event?")) return;
    const res = await fetch(`/api/events/${event.id}`, {
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
        <EventForm
          editEvent={{
            ...event,
            date: event.date.toISOString(),
            endDate: event.endDate?.toISOString() || null,
          }}
          onClose={() => setShowEdit(false)}
        />
      )}
    </>
  );
}
