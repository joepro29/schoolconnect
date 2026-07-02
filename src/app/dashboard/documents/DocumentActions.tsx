"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

interface DocData {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  category: string;
  accessRoles: string;
}

export default function DocumentActions({
  doc,
  onUpdated,
  onDeleted,
}: {
  doc: DocData;
  onUpdated?: () => void;
  onDeleted?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);

    const res = await fetch(`/api/documents/${doc.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        description: form.get("description") || null,
        fileUrl: form.get("fileUrl"),
        category: form.get("category") || "general",
        accessRoles: form.get("accessRoles") || "all",
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to update");
      setLoading(false);
      return;
    }

    setEditing(false);
    setLoading(false);
    onUpdated?.();
  }

  async function handleDelete() {
    if (!confirm(`Delete document "${doc.title}"?`)) return;
    setLoading(true);
    const res = await fetch(`/api/documents/${doc.id}`, { method: "DELETE" });
    if (res.ok) onDeleted?.();
    else setLoading(false);
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <button onClick={() => setEditing(true)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
          <Pencil className="w-4 h-4" />
        </button>
        <button onClick={handleDelete} disabled={loading} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Document</h2>
            {error && <p className="text-red-600 text-sm mb-3 bg-red-50 p-2 rounded">{error}</p>}
            <form onSubmit={handleUpdate} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input name="title" defaultValue={doc.title} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input name="description" defaultValue={doc.description || ""} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">File URL *</label>
                <input name="fileUrl" defaultValue={doc.fileUrl} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select name="category" defaultValue={doc.category} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="policy">Policy</option>
                    <option value="form">Form</option>
                    <option value="resource">Resource</option>
                    <option value="curriculum">Curriculum</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Access</label>
                  <select name="accessRoles" defaultValue={doc.accessRoles} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="all">All</option>
                    <option value="admin">Admin Only</option>
                    <option value="teacher">Teachers</option>
                    <option value="parent">Parents</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">{loading ? "Saving..." : "Save"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
