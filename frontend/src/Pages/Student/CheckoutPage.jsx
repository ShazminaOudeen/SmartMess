import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BarChart2, ChevronLeft, ChevronRight, Wallet, ShoppingBag,
  TrendingUp, ArrowLeft, Download, Star, StarOff, AlertTriangle,
  Flame, Settings, X
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { trackingAPI, canteenAPI } from "../../api/studentApi";

const TEMP_STUDENT_ID = "64f1a2b3c4d5e6f7a8b9c0d1";
const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const STORAGE_KEY_FAV    = "smartmess_fav_canteens";
const STORAGE_KEY_BUDGET = "smartmess_budget_limit";

function StatSkeleton() {
  return (
    <div className="card flex items-center gap-4">
      <div className="skeleton w-12 h-12 rounded-2xl flex-shrink-0" />
      <div><div className="skeleton h-6 w-24 mb-2" /><div className="skeleton h-3 w-20" /></div>
    </div>
  );
}

export default function ExpenseDashboard() {
  const [expenses, setExpenses]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [year, setYear]                 = useState(new Date().getFullYear());
  const [mostOrdered, setMostOrdered]   = useState([]);
  const [canteens, setCanteens]         = useState([]);
  const [favCanteens, setFavCanteens]   = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY_FAV)) || []; } catch { return []; }
  });
  const [budgetLimit, setBudgetLimit]   = useState(() => {
    return parseFloat(localStorage.getItem(STORAGE_KEY_BUDGET)) || 0;
  });
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetInput, setBudgetInput]   = useState("");
  const navigate = useNavigate();

  useEffect(() => { fetchExpenses(); }, [year]);

  useEffect(() => {
    canteenAPI.getAll().then((res) => { if (res.success) setCanteens(res.data); });
    canteenAPI.getMostOrdered(TEMP_STUDENT_ID).then((res) => { if (res.success) setMostOrdered(res.data); });
  }, []);

  const fetchExpenses = async () => {
    setLoading(true);
    const res = await trackingAPI.getExpenses(TEMP_STUDENT_ID, year);
    if (res.success) setExpenses(res.data);
    setLoading(false);
  };

  const totalYear   = expenses.reduce((s, m) => s + m.totalSpent, 0);
  const totalOrders = expenses.reduce((s, m) => s + m.orderCount, 0);
  const maxSpent    = Math.max(...expenses.map((m) => m.totalSpent), 1);
  const avgMonthly  = totalYear / 12;

  // Current month spending
  const currentMonth = new Date().getMonth();
  const currentMonthSpent = expenses[currentMonth]?.totalSpent || 0;
  const budgetUsedPct = budgetLimit > 0 ? Math.min((currentMonthSpent / budgetLimit) * 100, 100) : 0;
  const overBudget = budgetLimit > 0 && currentMonthSpent > budgetLimit;

  const toggleFav = (id) => {
    const updated = favCanteens.includes(id)
      ? favCanteens.filter((f) => f !== id)
      : [...favCanteens, id];
    setFavCanteens(updated);
    localStorage.setItem(STORAGE_KEY_FAV, JSON.stringify(updated));
  };

  const saveBudget = () => {
    const val = parseFloat(budgetInput);
    if (!isNaN(val) && val > 0) {
      setBudgetLimit(val);
      localStorage.setItem(STORAGE_KEY_BUDGET, val.toString());
    }
    setShowBudgetModal(false);
    setBudgetInput("");
  };

  const clearBudget = () => {
    setBudgetLimit(0);
    localStorage.removeItem(STORAGE_KEY_BUDGET);
    setShowBudgetModal(false);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFillColor(22, 163, 74);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22); doc.setFont("helvetica", "bold");
    doc.text("SmartMess", 14, 16);
    doc.setFontSize(11); doc.setFont("helvetica", "normal");
    doc.text("Monthly Expense Report", 14, 25);
    doc.text(`Year: ${year}`, 14, 33);
    doc.setFontSize(9);
    doc.text(`Generated: ${new Date().toLocaleDateString("en-MY")}`, 196, 33, { align: "right" });

    doc.setTextColor(40, 40, 40); doc.setFontSize(10); doc.setFont("helvetica", "bold");
    doc.text("SUMMARY", 14, 52);
    doc.setDrawColor(229, 231, 235); doc.setFillColor(248, 255, 250);
    doc.roundedRect(14, 56, 182, 28, 3, 3, "FD");
    doc.setFontSize(9); doc.setFont("helvetica", "normal"); doc.setTextColor(100, 100, 100);
    doc.text("Total Spent", 30, 66); doc.text("Total Orders", 95, 66); doc.text("Monthly Average", 155, 66);
    doc.setFontSize(12); doc.setFont("helvetica", "bold");
    doc.setTextColor(22, 163, 74); doc.text(`RM ${totalYear.toFixed(2)}`, 30, 76);
    doc.setTextColor(37, 99, 235); doc.text(`${totalOrders}`, 95, 76);
    doc.setTextColor(147, 51, 234); doc.text(`RM ${avgMonthly.toFixed(2)}`, 155, 76);

    doc.setTextColor(40, 40, 40); doc.setFontSize(10); doc.setFont("helvetica", "bold");
    doc.text("MONTHLY BREAKDOWN", 14, 96);

    autoTable(doc, {
      startY: 100,
      head: [["Month", "Orders", "Amount Spent (RM)", "Avg per Order (RM)"]],
      body: expenses.map((m, i) => [
        MONTHS[i], m.orderCount || 0,
        m.totalSpent > 0 ? `RM ${m.totalSpent.toFixed(2)}` : "—",
        m.orderCount > 0 ? `RM ${(m.totalSpent / m.orderCount).toFixed(2)}` : "—",
      ]),
      headStyles: { fillColor: [22, 163, 74], textColor: 255, fontStyle: "bold", fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: [50, 50, 50] },
      alternateRowStyles: { fillColor: [248, 255, 250] },
      columnStyles: { 0: { fontStyle: "bold" }, 2: { textColor: [22, 163, 74], fontStyle: "bold" } },
      styles: { cellPadding: 4, lineColor: [229, 231, 235], lineWidth: 0.3 },
      foot: [["TOTAL", totalOrders, `RM ${totalYear.toFixed(2)}`, `RM ${avgMonthly.toFixed(2)}`]],
      footStyles: { fillColor: [240, 253, 244], textColor: [22, 163, 74], fontStyle: "bold", fontSize: 9 },
    });

    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(8); doc.setTextColor(150, 150, 150);
    doc.text("SmartMess — Student Expense Report", 14, pageHeight - 10);
    doc.text("Page 1 of 1", 196, pageHeight - 10, { align: "right" });
    doc.save(`SmartMess_Expenses_${year}.pdf`);
  };

  const STATS = [
    { label: "Total Spent",     value: `RM ${totalYear.toFixed(2)}`,  Icon: Wallet,      color: "text-green-600 dark:text-green-400",   bg: "bg-green-50 dark:bg-green-900/20" },
    { label: "Total Orders",    value: totalOrders,                    Icon: ShoppingBag, color: "text-blue-600 dark:text-blue-400",     bg: "bg-blue-50 dark:bg-blue-900/20" },
    { label: "Monthly Average", value: `RM ${avgMonthly.toFixed(2)}`, Icon: TrendingUp,  color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-900/20" },
  ];

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-4xl mx-auto">

        {/* Budget Modal */}
        {showBudgetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-80 animate-scale-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white">Set Monthly Budget</h3>
                <button onClick={() => setShowBudgetModal(false)}>
                  <X size={18} className="text-gray-400" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mb-3">Get alerted when you exceed your monthly spending limit.</p>
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">RM</span>
                <input type="number" placeholder="e.g. 200" value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  className="input-field flex-1" autoFocus />
              </div>
              <div className="flex gap-2">
                {budgetLimit > 0 && (
                  <button onClick={clearBudget} className="btn-danger flex-1 text-xs">Remove Limit</button>
                )}
                <button onClick={saveBudget} className="btn-primary flex-1">Save</button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="page-header animate-fade-down flex items-start justify-between">
          <div>
            <h1 className="section-title">Expense <span className="text-gradient">Summary</span></h1>
            <p className="section-subtitle">Your monthly canteen spending overview</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={generatePDF} disabled={loading || totalYear === 0}
              className="btn-primary flex items-center gap-2 text-sm disabled:opacity-40">
              <Download size={15} /> Export PDF
            </button>
            <button onClick={() => setShowBudgetModal(true)}
              className="btn-secondary flex items-center gap-1.5 text-sm">
              <Settings size={14} /> Budget
            </button>
            <button onClick={() => setYear((y) => y - 1)}
              className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:border-green-400 hover:text-green-600 transition-all">
              <ChevronLeft size={16} />
            </button>
            <span className="font-bold text-gray-900 dark:text-white text-base px-1 min-w-[50px] text-center">{year}</span>
            <button onClick={() => setYear((y) => y + 1)} disabled={year >= new Date().getFullYear()}
              className="w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-500 hover:border-green-400 hover:text-green-600 transition-all disabled:opacity-30">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Budget Alert Banner */}
        {budgetLimit > 0 && (
          <div className={`mb-6 p-4 rounded-2xl border animate-fade-up ${
            overBudget
              ? "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800"
              : budgetUsedPct > 80
              ? "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
              : "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className={overBudget ? "text-red-500" : budgetUsedPct > 80 ? "text-yellow-500" : "text-green-500"} />
                <p className={`text-sm font-semibold ${overBudget ? "text-red-700 dark:text-red-400" : budgetUsedPct > 80 ? "text-yellow-700 dark:text-yellow-400" : "text-green-700 dark:text-green-400"}`}>
                  {overBudget ? "Over budget this month!" : budgetUsedPct > 80 ? "Approaching budget limit" : "Budget on track"}
                </p>
              </div>
              <p className="text-xs text-gray-500">
                RM {currentMonthSpent.toFixed(2)} / RM {budgetLimit.toFixed(2)}
              </p>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${budgetUsedPct}%`,
                  background: overBudget ? "#ef4444" : budgetUsedPct > 80 ? "#f59e0b" : "linear-gradient(90deg, #16a34a, #4ade80)"
                }} />
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {loading ? [1,2,3].map((i) => <StatSkeleton key={i} />)
            : STATS.map(({ label, value, Icon, color, bg }, i) => (
              <div key={i} className={`card animate-fade-up animation-delay-${(i+1)*100} flex items-center gap-4`}>
                <div className={`w-12 h-12 rounded-2xl ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon size={22} className={color} />
                </div>
                <div>
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
                </div>
              </div>
            ))
          }
        </div>

        {/* Most Ordered Meals */}
        {mostOrdered.length > 0 && (
          <div className="card mb-6 animate-fade-up animation-delay-200">
            <div className="flex items-center gap-2 mb-4">
              <Flame size={16} className="text-orange-500" />
              <h2 className="font-bold text-gray-900 dark:text-white">Your Most Ordered Meals</h2>
            </div>
            <div className="space-y-2">
              {mostOrdered.map((meal, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    i === 0 ? "bg-amber-100 text-amber-600" : i === 1 ? "bg-gray-100 text-gray-600" : "bg-orange-50 text-orange-500"
                  }`}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{meal.name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-green-600">{meal.count}× ordered</p>
                    <p className="text-[11px] text-gray-400">RM {meal.totalSpent?.toFixed(2)} total</p>
                  </div>
                  <div className="w-20 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full"
                      style={{
                        width: `${(meal.count / (mostOrdered[0]?.count || 1)) * 100}%`,
                        background: "linear-gradient(90deg, #16a34a, #4ade80)"
                      }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Favourite Canteens */}
        {canteens.length > 0 && (
          <div className="card mb-6 animate-fade-up animation-delay-300">
            <div className="flex items-center gap-2 mb-4">
              <Star size={16} className="text-amber-500" fill="currentColor" />
              <h2 className="font-bold text-gray-900 dark:text-white">Favourite Canteens</h2>
              <span className="text-xs text-gray-400 ml-auto">Tap star to save</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {canteens.map((c) => {
                const isFav = favCanteens.includes(c._id);
                return (
                  <div key={c._id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 cursor-pointer ${
                      isFav
                        ? "border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-800"
                        : "border-gray-100 dark:border-gray-700 hover:border-gray-200"
                    }`}
                    onClick={() => navigate(`/student/canteens/${c._id}/meals`)}>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {c.image
                        ? <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                        : <ShoppingBag size={14} className="text-green-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">{c.name}</p>
                      <p className="text-[11px] text-gray-400 truncate">{c.location || "On Campus"}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); toggleFav(c._id); }}
                      className="flex-shrink-0 transition-transform hover:scale-110">
                      {isFav
                        ? <Star size={16} className="text-amber-500" fill="currentColor" />
                        : <StarOff size={16} className="text-gray-300 dark:text-gray-600" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bar Chart */}
        <div className="card animate-fade-up animation-delay-300 mb-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart2 size={16} className="text-green-600" />
            <h2 className="font-bold text-gray-900 dark:text-white">Monthly Breakdown</h2>
            <span className="ml-auto text-xs text-gray-400">{year}</span>
          </div>
          {loading ? (
            <div className="flex items-end gap-2 h-44">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="flex-1 flex flex-col gap-1 items-center">
                  <div className="skeleton w-full rounded-t-lg" style={{ height: `${20 + Math.random()*60}%` }} />
                  <div className="skeleton h-2 w-6 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-end gap-1.5 h-44">
              {expenses.map((month, i) => {
                const pct = (month.totalSpent / maxSpent) * 100;
                const isCurrent = i === new Date().getMonth() && year === new Date().getFullYear();
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="relative group flex flex-col items-center w-full">
                      {month.totalSpent > 0 && (
                        <span className="absolute -top-7 left-1/2 -translate-x-1/2 text-[10px] font-bold text-green-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-white dark:bg-gray-800 px-1.5 py-0.5 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 z-10">
                          RM{month.totalSpent.toFixed(0)}
                        </span>
                      )}
                      <div className="w-full rounded-t-lg transition-all duration-700 cursor-pointer hover:opacity-80"
                        style={{
                          height: `${Math.max(pct * 1.6, 4)}px`,
                          minHeight: "4px", maxHeight: "160px",
                          background: month.totalSpent > 0
                            ? isCurrent
                              ? "linear-gradient(to top, #f59e0b, #fcd34d)"
                              : "linear-gradient(to top, #16a34a, #4ade80)"
                            : "#f3f4f6",
                        }} />
                    </div>
                    <span className={`text-[10px] mt-0.5 ${isCurrent ? "text-amber-500 font-bold" : "text-gray-400"}`}>
                      {MONTHS[i]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
          <p className="text-[10px] text-gray-400 mt-3 text-center">
            <span className="inline-block w-2 h-2 rounded-sm bg-amber-400 mr-1" />Current month
            <span className="inline-block w-2 h-2 rounded-sm bg-green-400 ml-3 mr-1" />Past months
          </p>
        </div>

        {/* Table */}
        <div className="card animate-fade-up animation-delay-400 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 size={16} className="text-green-600" />
            <h2 className="font-bold text-gray-900 dark:text-white">Month-by-Month Details</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  {["Month","Orders","Spent","Avg / Order"].map((h) => (
                    <th key={h} className={`py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider ${h === "Month" ? "text-left" : "text-right"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expenses.map((month, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors">
                    <td className="py-3 font-medium text-gray-800 dark:text-white text-sm">{MONTHS[i]}</td>
                    <td className="py-3 text-right text-gray-500 text-sm">{month.orderCount || "—"}</td>
                    <td className="py-3 text-right font-bold text-sm">
                      {month.totalSpent > 0
                        ? <span className="text-green-600 dark:text-green-400">RM {month.totalSpent.toFixed(2)}</span>
                        : <span className="text-gray-300 dark:text-gray-600">—</span>}
                    </td>
                    <td className="py-3 text-right text-gray-500 text-sm">
                      {month.orderCount > 0 ? `RM ${(month.totalSpent / month.orderCount).toFixed(2)}` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <button onClick={() => navigate("/student/orders")}
          className="btn-secondary w-full flex items-center justify-center gap-2 animate-fade-up animation-delay-500">
          <ArrowLeft size={14} /> Back to Orders
        </button>
      </div>
    </div>
  );
}
