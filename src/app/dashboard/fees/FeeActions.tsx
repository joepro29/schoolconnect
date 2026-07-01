"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

interface FeeData {
  id: string;
  studentId: string;
  term: string;
  description: string;
  amount: number;
  dueDate: string | null;
}

interface StudentOption {
  id: string;
  name: string;
  department: string | null;
}

export default function FeeActions({
  fee,
  students,
  onUpdated,
  onDeleted,
}: {
  fee: FeeData;
  students: StudentOption[];
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

    const res = await fetch(`/api/fees/${fee.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: form.get("studentId"),
        term: form.get("term"),
        description: form.get("description"),
        amount: form.get("amount"),
        dueDate: form.get("dueDate") || null,
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
    if (!confirm(`Delete this fee record? Payments will also be removed.`)) return;
    setLoading(true);
    const res = await fetch(`/api/fees/${fee.id}`, { method: "DELETE" });
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Fee</h2>
            {error && <p className="text-red-600 text-sm mb-3 bg-red-50 p-2 rounded">{error}</p>}
            <form onSubmit={handleUpdate} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
                <select name="studentId" defaultValue={fee.studentId} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} {s.department ? `(${s.department})` : ""}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Term *</label>
                <input name="term" defaultValue={fee.term} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <input name="description" defaultValue={fee.description} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($) *</label>
                <input name="amount" type="number" step="0.01" min="0" defaultValue={fee.amount} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input name="dueDate" type="date" defaultValue={fee.dueDate ? new Date(fee.dueDate).toISOString().split("T")[0] : ""} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
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
