"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UploadForm() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/documents", {
      method: "POST",
      body: JSON.stringify({
        title: form.get("title"),
        description: form.get("description"),
        fileUrl: form.get("fileUrl"),
        category: form.get("category"),
        accessRoles: form.get("accessRoles"),
      }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      setShowForm(false);
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
        Upload Document
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-semibold mb-4">Upload Document</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              name="title"
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              name="description"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">File URL</label>
            <input
              name="fileUrl"
              type="url"
              required
              placeholder="https://example.com/doc.pdf"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="general">General</option>
              <option value="policy">Policy</option>
              <option value="form">Form</option>
              <option value="resource">Resource</option>
              <option value="curriculum">Curriculum</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Access</label>
            <select
              name="accessRoles"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="all">Everyone</option>
              <option value="teacher,admin">Staff Only</option>
              <option value="student">Students Only</option>
              <option value="parent">Parents Only</option>
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
