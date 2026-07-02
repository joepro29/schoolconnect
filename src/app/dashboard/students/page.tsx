"use client";

import { useState, useEffect, useCallback } from "react";
import { GraduationCap, Link2 } from "lucide-react";
import LinkParentForm from "./LinkParentForm";
import StudentForm from "./StudentForm";
import StudentActions from "./StudentActions";

interface StudentData {
  id: string;
  name: string;
  email: string | null;
  department: string | null;
  parents: { id: string; parent: { id: string; name: string; email: string } }[];
  fees: { id: string }[];
  results: { id: string }[];
}

export default function StudentsPage() {
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = useCallback(async () => {
    const res = await fetch("/api/students");
    if (res.ok) {
      const data = await res.json();
      setStudents(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500 mt-1">Manage student records and parent links</p>
        </div>
        <StudentForm onCreated={fetchStudents} />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100 bg-gray-50">
                <th className="p-4 font-medium">Student</th>
                <th className="p-4 font-medium">Class</th>
                <th className="p-4 font-medium">Linked Parent(s)</th>
                <th className="p-4 font-medium text-center">Fees</th>
                <th className="p-4 font-medium text-center">Results</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="p-8 text-center text-gray-400">Loading...</td></tr>
              )}
              {!loading && students.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    <GraduationCap className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                    No students found
                  </td>
                </tr>
              )}
              {students.map((student) => (
                <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-medium text-gray-900">{student.name}</p>
                    <p className="text-xs text-gray-400">{student.email}</p>
                  </td>
                  <td className="p-4 text-gray-700">{student.department || "—"}</td>
                  <td className="p-4">
                    {student.parents.length === 0 ? (
                      <span className="text-xs text-gray-400">No parent linked</span>
                    ) : (
                      <div className="space-y-1">
                        {student.parents.map((sp) => (
                          <div key={sp.id} className="flex items-center gap-2">
                            <Link2 className="w-3 h-3 text-indigo-500" />
                            <span className="text-sm text-gray-700">{sp.parent.name}</span>
                            <span className="text-xs text-gray-400">({sp.parent.email})</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-sm text-gray-700">{student.fees.length}</span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="text-sm text-gray-700">{student.results.length}</span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <LinkParentForm
                        studentId={student.id}
                        studentName={student.name}
                        linkedParents={student.parents.map(sp => ({ id: sp.parent.id, name: sp.parent.name, email: sp.parent.email }))}
                        onUpdated={fetchStudents}
                      />
                      <StudentActions student={student} onUpdated={fetchStudents} onDeleted={fetchStudents} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
