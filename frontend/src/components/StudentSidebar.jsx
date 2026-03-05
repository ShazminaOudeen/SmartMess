import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Store, ShoppingCart, ClipboardList, BarChart2,
  Home, LogOut, ChevronLeft, ChevronRight, UtensilsCrossed, Search
} from "lucide-react";

const NAV_ITEMS = [
  { icon: Store,         label: "Canteens",  path: "/student/canteens" },
  { icon: Search,        label: "Search",    path: "/student/search" },
  { icon: ShoppingCart,  label: "Cart",      path: "/student/cart" },
  { icon: ClipboardList, label: "My Orders", path: "/student/orders" },
  { icon: BarChart2,     label: "Expenses",  path: "/student/expenses" },
];

export default function StudentSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside
      className={`h-screen sticky top-0 flex flex-col transition-all duration-300 ease-in-out z-20 ${
        collapsed ? "w-[70px]" : "w-[220px]"
      }`}
      style={{
        background: "linear-gradient(180deg, #0f1f14 0%, #0a1a0f 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {!collapsed && (
          <div className="flex items-center gap-2.5 animate-fade-in">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #16a34a, #4ade80)" }}>
              <UtensilsCrossed size={16} color="white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-white font-bold text-sm leading-none">SmartMess</p>
              <p className="text-green-500 text-[10px] font-medium tracking-widest uppercase mt-0.5">Student</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto"
            style={{ background: "linear-gradient(135deg, #16a34a, #4ade80)" }}>
            <UtensilsCrossed size={16} color="white" strokeWidth={2.5} />
          </div>
        )}
        {!collapsed && (
          <button onClick={() => setCollapsed(true)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all duration-200">
            <ChevronLeft size={15} />
          </button>
        )}
      </div>

      {collapsed && (
        <button onClick={() => setCollapsed(false)}
          className="mx-auto mt-3 w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all duration-200">
          <ChevronRight size={15} />
        </button>
      )}

      {/* Profile */}
      <div className={`px-3 py-4 ${!collapsed ? "mx-1" : ""}`}
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        {!collapsed ? (
          <div className="flex items-center gap-3 px-2 py-2.5 rounded-xl bg-white/5">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #16a34a, #4ade80)" }}>
              TS
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">Test Student</p>
              <p className="text-gray-500 text-[10px] truncate">student@test.com</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "linear-gradient(135deg, #16a34a, #4ade80)" }}>
              TS
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {!collapsed && (
          <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-widest px-3 mb-2">Menu</p>
        )}
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <button key={item.path} onClick={() => navigate(item.path)}
              title={collapsed ? item.label : ""}
              className={`w-full flex items-center gap-3 rounded-xl transition-all duration-200 group
                ${collapsed ? "px-0 py-3 justify-center" : "px-3 py-2.5"}
                ${isActive ? "text-white" : "text-gray-500 hover:text-gray-200 hover:bg-white/5"}`}
              style={isActive ? {
                background: "linear-gradient(135deg, rgba(22,163,74,0.25), rgba(22,163,74,0.1))",
                borderLeft: collapsed ? "none" : "2px solid #16a34a",
              } : {}}>
              <Icon size={17} strokeWidth={isActive ? 2.5 : 2}
                className={`flex-shrink-0 transition-colors ${isActive ? "text-green-400" : "group-hover:text-green-500"}`} />
              {!collapsed && (
                <span className={`text-sm font-medium ${isActive ? "text-white" : ""}`}>{item.label}</span>
              )}
              {!collapsed && isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-2 py-3 space-y-0.5"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <button onClick={() => navigate("/")} title={collapsed ? "Home" : ""}
          className={`w-full flex items-center gap-3 rounded-xl text-gray-500 hover:text-gray-200 hover:bg-white/5 transition-all duration-200
            ${collapsed ? "px-0 py-3 justify-center" : "px-3 py-2.5"}`}>
          <Home size={17} strokeWidth={2} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Home</span>}
        </button>
        <button title={collapsed ? "Logout" : ""}
          className={`w-full flex items-center gap-3 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200
            ${collapsed ? "px-0 py-3 justify-center" : "px-3 py-2.5"}`}>
          <LogOut size={17} strokeWidth={2} className="flex-shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
