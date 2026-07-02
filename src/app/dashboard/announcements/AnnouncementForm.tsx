"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AnnouncementFormProps {
  editAnnouncement?: {
    id: string;
    title: string;
    content: string;
    targetRoles: string;
  };
  onClose?: () => void;
}

export default function AnnouncementForm({ editAnnouncement, onClose }: AnnouncementFormProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(!!editAnnouncement);
  const [loading, setLoading] = useState(false);

  const isEdit = !!editAnnouncement;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const body = {
      title: form.get("title"),
      content: form.get("content"),
      targetRoles: form.get("targetRoles"),
    };

    const url = isEdit
      ? `/api/announcements/${editAnnouncement!.id}`
      : "/api/announcements";

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
        New Announcement
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg mx-4">
        <h2 className="text-lg font-semibold mb-4">
          {isEdit ? "Edit Announcement" : "New Announcement"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              name="title"
              required
              defaultValue={editAnnouncement?.title || ""}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              name="content"
              required
              rows={4}
              defaultValue={editAnnouncement?.content || ""}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
            <select
              name="targetRoles"
              defaultValue={editAnnouncement?.targetRoles || "all"}
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
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Post Announcement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
