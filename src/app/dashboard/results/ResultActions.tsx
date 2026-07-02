"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

interface ResultData {
  id: string;
  studentId: string;
  term: string;
  subject: string;
  score: number;
  grade: string;
  remarks: string | null;
}

interface StudentOption {
  id: string;
  name: string;
  department: string | null;
}

function autoGrade(score: number): string {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "E";
}

export default function ResultActions({
  result,
  students,
  onUpdated,
  onDeleted,
}: {
  result: ResultData;
  students: StudentOption[];
  onUpdated?: () => void;
  onDeleted?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [score, setScore] = useState(String(result.score));
  const [grade, setGrade] = useState(result.grade);

  function handleScoreChange(val: string) {
    setScore(val);
    if (val !== "") setGrade(autoGrade(parseFloat(val)));
  }

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);

    const res = await fetch(`/api/results/${result.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: form.get("studentId"),
        term: form.get("term"),
        subject: form.get("subject"),
        score: form.get("score"),
        grade: form.get("grade"),
        remarks: form.get("remarks") || null,
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
    if (!confirm("Delete this result record?")) return;
    setLoading(true);
    const res = await fetch(`/api/results/${result.id}`, { method: "DELETE" });
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Result</h2>
            {error && <p className="text-red-600 text-sm mb-3 bg-red-50 p-2 rounded">{error}</p>}
            <form onSubmit={handleUpdate} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student *</label>
                <select name="studentId" defaultValue={result.studentId} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} {s.department ? `(${s.department})` : ""}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Term *</label>
                <input name="term" defaultValue={result.term} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                <input name="subject" defaultValue={result.subject} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Score (%) *</label>
                  <input name="score" type="number" min="0" max="100" value={score} onChange={(e) => handleScoreChange(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Grade *</label>
                  <input name="grade" value={grade} onChange={(e) => setGrade(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
                <input name="remarks" defaultValue={result.remarks || ""} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
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
