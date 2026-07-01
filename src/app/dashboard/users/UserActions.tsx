"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";

interface UserActionsProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    department: string | null;
    phone: string | null;
    canUploadDocs: boolean;
  };
}

export default function UserActions({ user }: UserActionsProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    const msg = `Delete ${user.role} "${user.name}"?\n\nThis will permanently remove their account and all associated data.`;
    if (!confirm(msg)) return;
    const res = await fetch(`/api/users/${user.id}`, { method: "DELETE" });
    if (res.ok) router.refresh();
  }

  async function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);

    const body: any = {
      name: form.get("name"),
      email: form.get("email"),
      department: form.get("department"),
    };
    const password = form.get("password");
    if (password) body.password = password;
    if (user.role === "teacher") {
      body.canUploadDocs = form.get("canUploadDocs") === "on";
    }

    const res = await fetch(`/api/users/${user.id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      setEditing(false);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to update");
    }
    setLoading(false);
  }

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <button
          onClick={() => setEditing(true)}
          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
          title="Edit user"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={handleDelete}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          title="Delete user"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-1">Edit {user.role}</h2>
            <p className="text-sm text-gray-500 mb-4">{user.email}</p>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  name="name"
                  defaultValue={user.name}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  name="email"
                  type="email"
                  defaultValue={user.email}
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password <span className="text-gray-400 font-normal">(leave blank to keep current)</span>
                </label>
                <input
                  name="password"
                  type="password"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  name="department"
                  defaultValue={user.department || ""}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              {user.role === "teacher" && (
                <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    name="canUploadDocs"
                    type="checkbox"
                    defaultChecked={user.canUploadDocs}
                    className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Can upload documents</span>
                </label>
              )}

              {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
