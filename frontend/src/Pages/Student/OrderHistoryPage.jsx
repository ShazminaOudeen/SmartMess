import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { trackingAPI, orderAPI } from "../../api/studentApi";

const TEMP_STUDENT_ID = "64f1a2b3c4d5e6f7a8b9c0d1";

const STATUS_STYLES = {
  pending:   { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", icon: "⏳" },
  accepted:  { bg: "bg-blue-100 dark:bg-blue-900/30",   text: "text-blue-700 dark:text-blue-400",   icon: "✅" },
  preparing: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-400", icon: "👨‍🍳" },
  ready:     { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", icon: "🔔" },
  completed: { bg: "bg-gray-100 dark:bg-gray-700",      text: "text-gray-600 dark:text-gray-400",   icon: "🎉" },
  cancelled: { bg: "bg-red-100 dark:bg-red-900/30",     text: "text-red-600 dark:text-red-400",     icon: "❌" },
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState("");
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    trackingAPI.getHistory(TEMP_STUDENT_ID).then((res) => {
      if (res.success) setOrders(res.data);
      setLoading(false);
    });
  }, []);

  const handleCancel = async (orderId) => {
    setCancelling(orderId);
    const res = await orderAPI.cancelOrder(orderId);
    if (res.success) {
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: "cancelled" } : o))
      );
    }
    setCancelling("");
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin-slow text-5xl">📋</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="animate-fade-down mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-jungle-700 dark:text-primary-400">
              📋 Order History
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Track and manage your orders
            </p>
          </div>
          <button
            onClick={() => navigate("/student/expenses")}
            className="btn-secondary text-sm"
          >
            📊 Expenses
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap mb-6 animate-fade-up">
          {["all", "pending", "preparing", "ready", "completed", "cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-all ${
                filter === s
                  ? "bg-primary-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-primary-400"
              }`}
            >
              {STATUS_STYLES[s]?.icon || "📋"} {s}
            </button>
          ))}
        </div>

        {/* Empty */}
        {filtered.length === 0 && (
          <div className="card text-center py-16 animate-fade-in">
            <p className="text-5xl mb-3">📭</p>
            <p className="text-gray-500 dark:text-gray-400">No orders found</p>
            <button onClick={() => navigate("/student/canteens")} className="btn-primary mt-4">
              Order Now
            </button>
          </div>
        )}

        {/* Orders List */}
        <div className="space-y-4">
          {filtered.map((order, i) => {
            const style = STATUS_STYLES[order.status] || STATUS_STYLES.pending;
            return (
              <div key={order._id} className={`card animate-fade-up animation-delay-${(i + 1) * 100}`}>
                {/* Top Row */}
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-800 dark:text-white">
                      🏪 {order.canteen?.name || "Canteen"}
                    </p>
                    <p className="text-xs text-gray-400 font-mono mt-0.5">
                      #{order._id?.slice(-8).toUpperCase()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${style.bg} ${style.text}`}>
                    {style.icon} {order.status}
                  </span>
                </div>

                {/* Items */}
                <div className="space-y-1 mb-3">
                  {order.items?.map((item, j) => (
                    <div key={j} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {item.name} × {item.quantity}
                      </span>
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        RM {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                  <div>
                    <p className="font-bold text-jungle-700 dark:text-primary-400">
                      RM {order.totalAmount?.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString("en-MY", {
                        day: "numeric", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {order.status === "completed" && (
                      <button
                        onClick={() => navigate(`/student/rating/${order._id}/${order.canteen?._id}`)}
                        className="btn-secondary text-xs"
                      >
                        ⭐ Rate
                      </button>
                    )}
                    {order.status === "pending" && (
                      <button
                        onClick={() => handleCancel(order._id)}
                        disabled={cancelling === order._id}
                        className="px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium hover:bg-red-200 transition-colors"
                      >
                        {cancelling === order._id ? "Cancelling..." : "Cancel"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}