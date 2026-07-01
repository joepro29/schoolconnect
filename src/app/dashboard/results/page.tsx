"use client";

import { useState, useEffect, useCallback } from "react";
import { Award } from "lucide-react";
import ResultForm from "./ResultForm";
import ResultActions from "./ResultActions";

const gradeColors: Record<string, string> = {
  A: "bg-green-100 text-green-800",
  B: "bg-blue-100 text-blue-800",
  C: "bg-yellow-100 text-yellow-800",
  D: "bg-orange-100 text-orange-800",
  E: "bg-red-100 text-red-800",
};

interface ResultRecord {
  id: string;
  studentId: string;
  term: string;
  subject: string;
  score: number;
  grade: string;
  remarks: string | null;
  student: { id: string; name: string; department: string | null };
}

interface StudentOption {
  id: string;
  name: string;
  department: string | null;
}

export default function ResultsPage() {
  const [results, setResults] = useState<ResultRecord[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [resultsRes, studentsRes] = await Promise.all([
      fetch("/api/results"),
      fetch("/api/students"),
    ]);

    if (resultsRes.ok) {
      const data = await resultsRes.json();
      if (Array.isArray(data) && data.length > 0 && data[0].student && data[0].subject) {
        setResults(data);
        setRole("admin");
      } else if (Array.isArray(data)) {
        const parentResults: ResultRecord[] = [];
        data.forEach((child: any) => {
          child.student.results.forEach((r: any) => {
            parentResults.push({ ...r, student: child.student });
          });
        });
        setResults(parentResults);
        setRole("parent");
      }
    }

    if (studentsRes.ok) {
      const data = await studentsRes.json();
      setStudents(data.map((s: any) => ({ id: s.id, name: s.name, department: s.department })));
    }

    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="max-w-4xl mx-auto p-8 text-center text-gray-400">Loading...</div>;

  return role === "admin" ? (
    <AdminView results={results} students={students} onRefresh={fetchData} />
  ) : (
    <ParentView results={results} />
  );
}

function AdminView({ results, students, onRefresh }: { results: ResultRecord[]; students: StudentOption[]; onRefresh: () => void }) {
  const grouped: Record<string, ResultRecord[]> = {};
  results.forEach((r) => {
    if (!grouped[r.student.name]) grouped[r.student.name] = [];
    grouped[r.student.name].push(r);
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Results Management</h1>
          <p className="text-gray-500 mt-1">Manage academic results for all students</p>
        </div>
        <ResultForm students={students} onCreated={onRefresh} />
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <Award className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No results yet</p>
        </div>
      ) : (
        Object.entries(grouped).map(([studentName, studentResults]) => {
          const byTerm = studentResults.reduce<Record<string, ResultRecord[]>>((acc, r) => {
            if (!acc[r.term]) acc[r.term] = [];
            acc[r.term].push(r);
            return acc;
          }, {});

          return (
            <div key={studentName} className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">{studentName}</h2>
                <p className="text-sm text-gray-500">{studentResults[0]?.student.department || "N/A"}</p>
              </div>
              {Object.entries(byTerm).map(([term, termResults]) => {
                const avg = termResults.reduce((s, r) => s + r.score, 0) / termResults.length;
                return (
                  <div key={term} className="p-6 border-b border-gray-100 last:border-0">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">{term}</h3>
                      <span className="text-sm text-gray-500">Average: {avg.toFixed(1)}%</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-500 border-b border-gray-100">
                            <th className="pb-2 font-medium">Subject</th>
                            <th className="pb-2 font-medium text-right">Score</th>
                            <th className="pb-2 font-medium text-center">Grade</th>
                            <th className="pb-2 font-medium">Remarks</th>
                            <th className="pb-2 font-medium text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {termResults.map((r) => (
                            <tr key={r.id} className="border-b border-gray-50">
                              <td className="py-2.5 text-gray-900 font-medium">{r.subject}</td>
                              <td className="py-2.5 text-right text-gray-700">{r.score}%</td>
                              <td className="py-2.5 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${gradeColors[r.grade] || "bg-gray-100 text-gray-800"}`}>{r.grade}</span>
                              </td>
                              <td className="py-2.5 text-gray-500">{r.remarks || "—"}</td>
                              <td className="py-2.5 text-right">
                                <ResultActions result={r} students={students} onUpdated={onRefresh} onDeleted={onRefresh} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })
      )}
    </div>
  );
}

function ParentView({ results }: { results: ResultRecord[] }) {
  if (results.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Results</h1>
        <p className="text-gray-500">No children linked to your account or no results available.</p>
      </div>
    );
  }

  const grouped: Record<string, ResultRecord[]> = {};
  results.forEach((r) => {
    if (!grouped[r.student.name]) grouped[r.student.name] = [];
    grouped[r.student.name].push(r);
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Results</h1>
        <p className="text-gray-500 mt-1">Academic performance for your children</p>
      </div>

      {Object.entries(grouped).map(([studentName, studentResults]) => {
        const byTerm = studentResults.reduce<Record<string, ResultRecord[]>>((acc, r) => {
          if (!acc[r.term]) acc[r.term] = [];
          acc[r.term].push(r);
          return acc;
        }, {});

        return (
          <div key={studentName} className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{studentName}</h2>
              <p className="text-sm text-gray-500">Class: {studentResults[0]?.student.department || "N/A"}</p>
            </div>
            {Object.entries(byTerm).map(([term, termResults]) => {
              const avg = termResults.reduce((s, r) => s + r.score, 0) / termResults.length;
              return (
                <div key={term} className="p-6 border-b border-gray-100 last:border-0">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900">{term}</h3>
                    <span className="text-sm text-gray-500">Average: {avg.toFixed(1)}%</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-gray-500 border-b border-gray-100">
                          <th className="pb-2 font-medium">Subject</th>
                          <th className="pb-2 font-medium text-right">Score</th>
                          <th className="pb-2 font-medium text-center">Grade</th>
                          <th className="pb-2 font-medium">Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {termResults.map((r) => (
                          <tr key={r.id} className="border-b border-gray-50">
                            <td className="py-2.5 text-gray-900 font-medium">{r.subject}</td>
                            <td className="py-2.5 text-right text-gray-700">{r.score}%</td>
                            <td className="py-2.5 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${gradeColors[r.grade] || "bg-gray-100 text-gray-800"}`}>{r.grade}</span>
                            </td>
                            <td className="py-2.5 text-gray-500">{r.remarks || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
