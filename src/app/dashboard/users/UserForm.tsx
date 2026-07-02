"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function UserForm() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("teacher");
  const [canUploadDocs, setCanUploadDocs] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/users", {
      method: "POST",
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
        role: form.get("role"),
        department: form.get("department"),
        canUploadDocs: role === "teacher" ? canUploadDocs : false,
      }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      setShowForm(false);
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to create user");
    }
    setLoading(false);
  }

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
      >
        Add User
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-semibold mb-4">Create New Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              name="name"
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              placeholder="user@school.edu"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="teacher">Teacher</option>
              <option value="parent">Parent</option>
            </select>
          </div>
          {role === "teacher" && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  name="department"
                  placeholder="e.g. Mathematics"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={canUploadDocs}
                  onChange={(e) => setCanUploadDocs(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Can upload documents</span>
              </label>
            </>
          )}

          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}

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
              {loading ? "Creating..." : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
