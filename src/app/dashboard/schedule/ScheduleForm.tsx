"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Teacher {
  id: string;
  name: string;
}

interface ScheduleFormProps {
  initial?: {
    id: string;
    dayOfWeek: number;
    period: number;
    subject: string;
    teacherId: string;
    room: string;
    class: string;
  };
  onClose?: () => void;
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function ScheduleForm({ initial, onClose }: ScheduleFormProps) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const isEdit = !!initial;

  useEffect(() => {
    if (show || isEdit) {
      fetch("/api/schedule")
        .then((r) => r.json())
        .then((data) => {
          const unique = new Map(data.map((s: any) => [s.teacher.id, s.teacher]));
          setTeachers(Array.from(unique.values()) as Teacher[]);
        })
        .catch(() => {});
    }
  }, [show, isEdit]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(e.currentTarget);

    const body = {
      dayOfWeek: parseInt(form.get("dayOfWeek") as string),
      period: parseInt(form.get("period") as string),
      subject: form.get("subject"),
      teacherId: form.get("teacherId"),
      room: form.get("room"),
      class: form.get("class"),
    };

    const url = isEdit ? `/api/schedule/${initial.id}` : "/api/schedule";
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      setShow(false);
      onClose?.();
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error || "Failed to save");
    }
    setLoading(false);
  }

  if (!isEdit && !show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
      >
        Add Class
      </button>
    );
  }

  if (isEdit) {
    return (
      <form onSubmit={handleSubmit} className="space-y-3">
        <input type="hidden" name="dayOfWeek" value={initial.dayOfWeek} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Day</label>
            <select
              name="dayOfWeek"
              defaultValue={initial.dayOfWeek}
              className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {days.map((d, i) => <option key={i + 1} value={i + 1}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Period</label>
            <input
              name="period"
              type="number"
              min={1}
              max={10}
              defaultValue={initial.period}
              required
              className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Subject</label>
          <input
            name="subject"
            defaultValue={initial.subject}
            required
            className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Teacher</label>
            <select
              name="teacherId"
              defaultValue={initial.teacherId}
              className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Select teacher</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Room</label>
            <input
              name="room"
              defaultValue={initial.room}
              required
              className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Class</label>
          <input
            name="class"
            defaultValue={initial.class}
            required
            className="w-full px-2 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs text-gray-700 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    );
  }

  const formContent = (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-lg font-semibold mb-4">Add Class</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
              <select
                name="dayOfWeek"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {days.map((d, i) => <option key={i + 1} value={i + 1}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
              <input
                name="period"
                type="number"
                min={1}
                max={10}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              name="subject"
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
              <select
                name="teacherId"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="">Select teacher</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
              <input
                name="room"
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <input
              name="class"
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShow(false)}
              className="px-4 py-2 text-gray-700 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Add Class"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setShow(true)}
        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
      >
        Add Class
      </button>
      {show && formContent}
    </>
  );
}
