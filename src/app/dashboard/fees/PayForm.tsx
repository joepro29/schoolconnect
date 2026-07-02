"use client";

import { useState } from "react";

interface PayFormProps {
  feeId: string;
  studentName: string;
  description: string;
  maxAmount: number;
  onUpdated?: () => void;
}

export default function PayForm({ feeId, studentName, description, maxAmount, onUpdated }: PayFormProps) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/fees/pay", {
      method: "POST",
      body: JSON.stringify({
        feeId,
        amount: parseFloat(form.get("amount") as string),
        method: form.get("method"),
        reference: form.get("reference"),
      }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      setShowForm(false);
      onUpdated?.();
    }
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setShowForm(true)}
        className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
      >
        Pay Now
      </button>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-1">Make a Payment</h2>
            <p className="text-sm text-gray-500 mb-4">
              {studentName} — {description}
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (max ${maxAmount.toFixed(2)})
                </label>
                <input
                  name="amount"
                  type="number"
                  step="0.01"
                  max={maxAmount}
                  required
                  defaultValue={maxAmount}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  name="method"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile_money">Mobile Money</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reference (optional)</label>
                <input
                  name="reference"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Transaction ID or note"
                />
              </div>
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
                  {loading ? "Processing..." : "Confirm Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
