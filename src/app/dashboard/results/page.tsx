import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Award } from "lucide-react";

const gradeColors: Record<string, string> = {
  A: "bg-green-100 text-green-800",
  B: "bg-blue-100 text-blue-800",
  C: "bg-yellow-100 text-yellow-800",
  D: "bg-orange-100 text-orange-800",
  E: "bg-red-100 text-red-800",
};

export default async function ResultsPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user!.role !== "parent") redirect("/dashboard");

  const children = await prisma.studentParent.findMany({
    where: { parentId: session.user!.id },
    include: {
      student: {
        include: {
          results: {
            orderBy: [{ term: "asc" }, { subject: "asc" }],
          },
        },
      },
    },
  });

  if (children.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Results</h1>
        <p className="text-gray-500">No children linked to your account.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Student Results</h1>
        <p className="text-gray-500 mt-1">Academic performance for your children</p>
      </div>

      {children.map(({ student }) => {
        const byTerm = student.results.reduce<Record<string, typeof student.results>>(
          (acc, r) => {
            if (!acc[r.term]) acc[r.term] = [];
            acc[r.term].push(r);
            return acc;
          },
          {}
        );

        if (Object.keys(byTerm).length === 0) {
          return (
            <div key={student.id} className="bg-white rounded-xl p-8 border border-gray-100 shadow-sm text-center">
              <Award className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <h2 className="text-lg font-semibold text-gray-900">{student.name}</h2>
              <p className="text-sm text-gray-500 mt-1">No results available yet.</p>
            </div>
          );
        }

        return (
          <div key={student.id} className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{student.name}</h2>
              <p className="text-sm text-gray-500">Class: {student.department || "N/A"}</p>
            </div>
            {Object.entries(byTerm).map(([term, results]) => {
              const avg = results.reduce((s, r) => s + r.score, 0) / results.length;
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
                        {results.map((r) => (
                          <tr key={r.id} className="border-b border-gray-50">
                            <td className="py-2.5 text-gray-900 font-medium">{r.subject}</td>
                            <td className="py-2.5 text-right text-gray-700">{r.score}%</td>
                            <td className="py-2.5 text-center">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                                  gradeColors[r.grade] || "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {r.grade}
                              </span>
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
