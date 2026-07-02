"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface EventFormProps {
  editEvent?: {
    id: string;
    title: string;
    description: string | null;
    date: string;
    endDate: string | null;
    location: string | null;
    type: string;
    targetRoles: string;
  };
  onClose?: () => void;
}

export default function EventForm({ editEvent, onClose }: EventFormProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(!!editEvent);
  const [loading, setLoading] = useState(false);
  const isEdit = !!editEvent;

  function toDateInput(d: string | Date) {
    return new Date(d).toISOString().slice(0, 10);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const body = {
      title: form.get("title"),
      description: form.get("description"),
      date: form.get("date"),
      endDate: form.get("endDate") || null,
      location: form.get("location") || null,
      type: form.get("type"),
      targetRoles: form.get("targetRoles"),
    };

    const url = isEdit
      ? `/api/events/${editEvent!.id}`
      : "/api/events";

    const res = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      setShowForm(false);
      onClose?.();
      router.refresh();
    }
    setLoading(false);
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
      >
        Add Event
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
        <h2 className="text-lg font-semibold mb-4">
          {isEdit ? "Edit Event" : "New Event"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              name="title"
              required
              defaultValue={editEvent?.title || ""}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              rows={2}
              defaultValue={editEvent?.description || ""}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                name="date"
                type="date"
                required
                defaultValue={editEvent ? toDateInput(editEvent.date) : ""}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                name="endDate"
                type="date"
                defaultValue={editEvent?.endDate ? toDateInput(editEvent.endDate) : ""}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                name="location"
                defaultValue={editEvent?.location || ""}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                name="type"
                defaultValue={editEvent?.type || "general"}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="general">General</option>
                <option value="academic">Academic</option>
                <option value="staff">Staff</option>
                <option value="holiday">Holiday</option>
                <option value="sport">Sport</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Visible To</label>
            <select
              name="targetRoles"
              defaultValue={editEvent?.targetRoles || "all"}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="all">Everyone</option>
              <option value="teacher,admin">Staff Only</option>
              <option value="parent">Parents Only</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                onClose?.();
              }}
              className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
