import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const NAV_ITEMS = [
  { icon: "🏪", label: "Canteens", path: "/student/canteens" },
  { icon: "🛒", label: "Cart", path: "/student/cart" },
  { icon: "📋", label: "My Orders", path: "/student/orders" },
  { icon: "📊", label: "Expenses", path: "/student/expenses" },
];

export default function StudentSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      className={`h-screen sticky top-0 flex flex-col bg-gray-900 border-r border-gray-700 transition-all duration-300 ${
        collapsed ? "w-16" : "w-56"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-gray-700">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍱</span>
            <span className="text-jungle-400 font-bold text-lg">SmartMess</span>
          </div>
        )}
        {collapsed && <span className="text-2xl mx-auto">🍱</span>}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white transition-colors ml-auto"
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Student Profile */}
      {!collapsed && (
        <div className="px-4 py-4 border-b border-gray-700 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-lg">
              S
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Test Student</p>
              <p className="text-gray-400 text-xs">Student</p>
            </div>
          </div>
        </div>
      )}

      {collapsed && (
        <div className="flex justify-center py-4 border-b border-gray-700">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
            S
          </div>
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-primary-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              {!collapsed && (
                <span className="font-medium text-sm">{item.label}</span>
              )}
              {!collapsed && isActive && (
                <span className="ml-auto w-2 h-2 rounded-full bg-white"></span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-4 border-t border-gray-700 space-y-1">
        <button
          onClick={() => navigate("/")}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-200"
        >
          <span className="text-xl flex-shrink-0">🏠</span>
          {!collapsed && <span className="font-medium text-sm">Home</span>}
        </button>
        <button
          className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-900/20 hover:text-red-300 transition-all duration-200"
        >
          <span className="text-xl flex-shrink-0">🚪</span>
          {!collapsed && <span className="font-medium text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );
}