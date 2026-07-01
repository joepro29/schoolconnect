"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Unlink, Link2 } from "lucide-react";

interface LinkParentFormProps {
  studentId: string;
  studentName: string;
  linkedParents: { id: string; name: string; email: string }[];
}

export default function LinkParentForm({ studentId, studentName, linkedParents }: LinkParentFormProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/students/link", {
      method: "POST",
      body: JSON.stringify({ studentId, parentEmail: email }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      setEmail("");
      setError("");
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to link parent");
    }
    setLoading(false);
  }

  async function handleUnlink(parentId: string) {
    if (!confirm("Unlink this parent from the student?")) return;
    setError("");
    const res = await fetch("/api/students/link", {
      method: "DELETE",
      body: JSON.stringify({ studentId, parentId }),
      headers: { "Content-Type": "application/json" },
    });
    if (res.ok) router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
      >
        Manage Parent
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-1">Manage Parents</h2>
            <p className="text-sm text-gray-500 mb-4">{studentName}</p>

            {linkedParents.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">Currently Linked</p>
                <div className="space-y-2">
                  {linkedParents.map((p) => (
                    <div key={p.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-indigo-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleUnlink(p.id)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Unlink parent"
                      >
                        <Unlink className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link New Parent
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="parent@school.edu"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? "Linking..." : "Link Parent"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
