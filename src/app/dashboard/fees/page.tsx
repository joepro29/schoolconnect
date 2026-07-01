import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { DollarSign, CheckCircle } from "lucide-react";
import PayForm from "./PayForm";

export default async function FeesPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user!.role !== "parent") redirect("/dashboard");

  const children = await prisma.studentParent.findMany({
    where: { parentId: session.user!.id },
    include: {
      student: {
        include: {
          fees: {
            include: { payments: true },
            orderBy: { term: "asc" },
          },
        },
      },
    },
  });

  if (children.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">School Fees</h1>
        <p className="text-gray-500">No children linked to your account.</p>
      </div>
    );
  }

  let grandTotal = 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">School Fees</h1>
          <p className="text-gray-500 mt-1">View and pay fees for your children</p>
        </div>
      </div>

      {children.map(({ student, relation }) => {
        const feeDetails = student.fees.map((fee) => {
          const paid = fee.payments.reduce((sum, p) => sum + p.amount, 0);
          const balance = Math.max(0, fee.amount - paid);
          return { ...fee, paid, balance };
        });

        const totalFees = feeDetails.reduce((s, f) => s + f.amount, 0);
        const totalPaid = feeDetails.reduce((s, f) => s + f.paid, 0);
        const totalBalance = totalFees - totalPaid;
        grandTotal += totalBalance;

        return (
          <div key={student.id} className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{student.name}</h2>
                  <p className="text-sm text-gray-500 capitalize">Class: {student.department || "N/A"} • {relation}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Total Balance</p>
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
                  {feeDetails.map((fee) => (
                    <tr key={fee.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="p-4 text-gray-700">{fee.term}</td>
                      <td className="p-4 text-gray-900 font-medium">{fee.description}</td>
                      <td className="p-4 text-right text-gray-900">${fee.amount.toFixed(2)}</td>
                      <td className="p-4 text-right text-green-600">${fee.paid.toFixed(2)}</td>
                      <td className="p-4 text-right font-medium">
                        {fee.balance === 0 ? (
                          <span className="text-green-600">$0.00</span>
                        ) : (
                          <span className="text-red-600">${fee.balance.toFixed(2)}</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {fee.balance > 0 ? (
                          <PayForm feeId={fee.id} studentName={student.name} description={fee.description} maxAmount={fee.balance} />
                        ) : (
                          <span className="text-xs text-green-600 font-medium">Paid</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50 font-semibold">
                    <td colSpan={2} className="p-4 text-gray-900">Total</td>
                    <td className="p-4 text-right text-gray-900">${totalFees.toFixed(2)}</td>
                    <td className="p-4 text-right text-green-600">${totalPaid.toFixed(2)}</td>
                    <td className="p-4 text-right text-gray-900">${totalBalance.toFixed(2)}</td>
                    <td className="p-4" />
                  </tr>
                </tfoot>
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
