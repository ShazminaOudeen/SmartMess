import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { trackingAPI } from "../../api/studentApi";

const TEMP_STUDENT_ID = "64f1a2b3c4d5e6f7a8b9c0d1";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function ExpenseDashboard() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const navigate = useNavigate();

  useEffect(() => {
    fetchExpenses();
  }, [year]);

  const fetchExpenses = async () => {
    setLoading(true);
    const res = await trackingAPI.getExpenses(TEMP_STUDENT_ID, year);
    if (res.success) setExpenses(res.data);
    setLoading(false);
  };

  const totalYear = expenses.reduce((sum, m) => sum + m.totalSpent, 0);
  const totalOrders = expenses.reduce((sum, m) => sum + m.orderCount, 0);
  const maxSpent = Math.max(...expenses.map((m) => m.totalSpent), 1);
  const avgMonthly = totalYear / 12;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="animate-fade-down mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-jungle-700 dark:text-primary-400">
              📊 Expense Summary
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Your monthly canteen spending
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setYear((y) => y - 1)}
              className="btn-secondary px-3 py-2 text-sm"
            >
              ←
            </button>
            <span className="font-bold text-gray-800 dark:text-white text-lg">{year}</span>
            <button
              onClick={() => setYear((y) => y + 1)}
              disabled={year >= new Date().getFullYear()}
              className="btn-secondary px-3 py-2 text-sm disabled:opacity-40"
            >
              →
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Spent", value: `RM ${totalYear.toFixed(2)}`, icon: "💰", color: "text-jungle-700 dark:text-primary-400" },
            { label: "Total Orders", value: totalOrders, icon: "🧾", color: "text-blue-600 dark:text-blue-400" },
            { label: "Monthly Average", value: `RM ${avgMonthly.toFixed(2)}`, icon: "📈", color: "text-purple-600 dark:text-purple-400" },
          ].map((stat, i) => (
            <div key={i} className={`card animate-fade-up animation-delay-${(i + 1) * 100} text-center`}>
              <p className="text-3xl mb-2">{stat.icon}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Bar Chart */}
        <div className="card animate-fade-up animation-delay-300 mb-8">
          <h2 className="font-bold text-gray-800 dark:text-white text-lg mb-6">
            📅 Monthly Breakdown
          </h2>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin-slow text-3xl">📊</div>
            </div>
          ) : (
            <div className="flex items-end gap-2 h-48">
              {expenses.map((month, i) => {
                const heightPct = (month.totalSpent / maxSpent) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    {/* Amount tooltip on hover */}
                    <div className="relative group flex flex-col items-center w-full">
                      {month.totalSpent > 0 && (
                        <span className="absolute -top-6 text-xs font-bold text-jungle-700 dark:text-primary-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          RM {month.totalSpent.toFixed(0)}
                        </span>
                      )}
                      <div
                        className="w-full rounded-t-lg transition-all duration-500 cursor-pointer"
                        style={{
                          height: `${Math.max(heightPct, 4)}%`,
                          minHeight: "4px",
                          background: month.totalSpent > 0
                            ? "linear-gradient(to top, #16a34a, #4ade80)"
                            : "#e5e7eb",
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {MONTHS[i]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Monthly Table */}
        <div className="card animate-fade-up animation-delay-400">
          <h2 className="font-bold text-gray-800 dark:text-white text-lg mb-4">
            🗓️ Month-by-Month Details
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2 text-gray-500 dark:text-gray-400 font-medium">Month</th>
                  <th className="text-right py-2 text-gray-500 dark:text-gray-400 font-medium">Orders</th>
                  <th className="text-right py-2 text-gray-500 dark:text-gray-400 font-medium">Spent</th>
                  <th className="text-right py-2 text-gray-500 dark:text-gray-400 font-medium">Avg/Order</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((month, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="py-2.5 font-medium text-gray-800 dark:text-white">
                      {MONTHS[i]}
                    </td>
                    <td className="py-2.5 text-right text-gray-600 dark:text-gray-400">
                      {month.orderCount}
                    </td>
                    <td className="py-2.5 text-right font-bold text-jungle-700 dark:text-primary-400">
                      {month.totalSpent > 0 ? `RM ${month.totalSpent.toFixed(2)}` : "—"}
                    </td>
                    <td className="py-2.5 text-right text-gray-600 dark:text-gray-400">
                      {month.orderCount > 0
                        ? `RM ${(month.totalSpent / month.orderCount).toFixed(2)}`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate("/student/orders")}
          className="btn-secondary w-full mt-6 animate-fade-up animation-delay-500"
        >
          ← Back to Orders
        </button>
      </div>
    </div>
  );
}