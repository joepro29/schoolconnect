"use client";

import { useState, useEffect, useCallback } from "react";
import { DollarSign, CheckCircle } from "lucide-react";
import PayForm from "./PayForm";
import FeeForm from "./FeeForm";
import FeeActions from "./FeeActions";

interface FeeRecord {
  id: string;
  studentId: string;
  term: string;
  description: string;
  amount: number;
  dueDate: string | null;
  payments: { amount: number }[];
  student: { id: string; name: string; department: string | null };
}

interface StudentOption {
  id: string;
  name: string;
  department: string | null;
}

export default function FeesPage() {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const [feesRes, studentsRes] = await Promise.all([
      fetch("/api/fees"),
      fetch("/api/students"),
    ]);

    if (feesRes.ok) {
      const data = await feesRes.json();
      if (Array.isArray(data) && data.length > 0 && data[0].student) {
        setFees(data);
        setRole("admin");
      } else if (Array.isArray(data)) {
        const parentFees: FeeRecord[] = [];
        data.forEach((child: any) => {
          child.student.fees.forEach((fee: any) => {
            parentFees.push({ ...fee, student: child.student });
          });
        });
        setFees(parentFees);
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

  if (role === "parent") {
    return <ParentView fees={fees} />;
  }

  return <AdminView fees={fees} students={students} onRefresh={fetchData} />;
}

function AdminView({ fees, students, onRefresh }: { fees: FeeRecord[]; students: StudentOption[]; onRefresh: () => void }) {
  const grouped: Record<string, FeeRecord[]> = {};
  fees.forEach((f) => {
    if (!grouped[f.student.name]) grouped[f.student.name] = [];
    grouped[f.student.name].push(f);
  });

  let grandTotal = 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-500 mt-1">Manage fees for all students</p>
        </div>
        <FeeForm students={students} onCreated={onRefresh} />
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No fee records yet</p>
        </div>
      ) : (
        Object.entries(grouped).map(([studentName, studentFees]) => {
          const totalFees = studentFees.reduce((s, f) => s + f.amount, 0);
          const totalPaid = studentFees.reduce((s, f) => s + f.payments.reduce((ps, p) => ps + p.amount, 0), 0);
          const totalBalance = totalFees - totalPaid;
          grandTotal += totalBalance;

          return (
            <div key={studentName} className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{studentName}</h2>
                    <p className="text-sm text-gray-500">{studentFees[0]?.student.department || "N/A"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Balance</p>
                    <p className={`text-2xl font-bold ${totalBalance === 0 ? "text-green-600" : "text-red-600"}`}>
                      ${totalBalance.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-50">
                      <th className="p-4 font-medium">Term</th>
                      <th className="p-4 font-medium">Description</th>
                      <th className="p-4 font-medium text-right">Amount</th>
                      <th className="p-4 font-medium text-right">Paid</th>
                      <th className="p-4 font-medium text-right">Balance</th>
                      <th className="p-4 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentFees.map((fee) => {
                      const paid = fee.payments.reduce((s, p) => s + p.amount, 0);
                      const balance = fee.amount - paid;
                      return (
                        <tr key={fee.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="p-4 text-gray-700">{fee.term}</td>
                          <td className="p-4 text-gray-900 font-medium">{fee.description}</td>
                          <td className="p-4 text-right text-gray-900">${fee.amount.toFixed(2)}</td>
                          <td className="p-4 text-right text-green-600">${paid.toFixed(2)}</td>
                          <td className="p-4 text-right font-medium">
                            {balance <= 0 ? <span className="text-green-600">$0.00</span> : <span className="text-red-600">${balance.toFixed(2)}</span>}
                          </td>
                          <td className="p-4 text-right">
                            <FeeActions fee={fee} students={students} onUpdated={onRefresh} onDeleted={onRefresh} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}

      <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-indigo-600" />
            <div>
              <p className="font-semibold text-indigo-900">Total Outstanding</p>
              <p className="text-sm text-indigo-700">Across all students</p>
            </div>
          </div>
          <p className={`text-3xl font-bold ${grandTotal === 0 ? "text-green-600" : "text-red-600"}`}>
            ${grandTotal.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}

function ParentView({ fees }: { fees: FeeRecord[] }) {
  let grandTotal = 0;

  const grouped: Record<string, FeeRecord[]> = {};
  fees.forEach((f) => {
    if (!grouped[f.student.name]) grouped[f.student.name] = [];
    grouped[f.student.name].push(f);
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">School Fees</h1>
        <p className="text-gray-500 mt-1">View and pay fees for your children</p>
      </div>

      {Object.entries(grouped).map(([studentName, studentFees]) => {
        const totalFees = studentFees.reduce((s, f) => s + f.amount, 0);
        const totalPaid = studentFees.reduce((s, f) => s + f.payments.reduce((ps, p) => ps + p.amount, 0), 0);
        const totalBalance = totalFees - totalPaid;
        grandTotal += totalBalance;

        return (
          <div key={studentName} className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{studentName}</h2>
                  <p className="text-sm text-gray-500">{studentFees[0]?.student.department || "N/A"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Balance</p>
                  <p className={`text-2xl font-bold ${totalBalance === 0 ? "text-green-600" : "text-red-600"}`}>
                    ${totalBalance.toFixed(2)}
                  </p>
                  {totalBalance === 0 && (
                    <span className="inline-flex items-center gap-1 text-sm text-green-600 font-medium">
                      <CheckCircle className="w-4 h-4" /> Fully Paid
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-50">
                    <th className="p-4 font-medium">Term</th>
                    <th className="p-4 font-medium">Description</th>
                    <th className="p-4 font-medium text-right">Amount</th>
                    <th className="p-4 font-medium text-right">Paid</th>
                    <th className="p-4 font-medium text-right">Balance</th>
                    <th className="p-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {studentFees.map((fee) => {
                    const paid = fee.payments.reduce((s, p) => s + p.amount, 0);
                    const balance = fee.amount - paid;
                    return (
                      <tr key={fee.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="p-4 text-gray-700">{fee.term}</td>
                        <td className="p-4 text-gray-900 font-medium">{fee.description}</td>
                        <td className="p-4 text-right text-gray-900">${fee.amount.toFixed(2)}</td>
                        <td className="p-4 text-right text-green-600">${paid.toFixed(2)}</td>
                        <td className="p-4 text-right font-medium">
                          {balance <= 0 ? <span className="text-green-600">$0.00</span> : <span className="text-red-600">${balance.toFixed(2)}</span>}
                        </td>
                        <td className="p-4 text-right">
                          {balance > 0 ? (
                            <PayForm feeId={fee.id} studentName={studentName} description={fee.description} maxAmount={balance} />
                          ) : (
                            <span className="text-xs text-green-600 font-medium">Paid</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DollarSign className="w-6 h-6 text-indigo-600" />
            <div>
              <p className="font-semibold text-indigo-900">Total Outstanding Balance</p>
              <p className="text-sm text-indigo-700">Across all your children</p>
            </div>
          </div>
          <p className={`text-3xl font-bold ${grandTotal === 0 ? "text-green-600" : "text-red-600"}`}>
            ${grandTotal.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
