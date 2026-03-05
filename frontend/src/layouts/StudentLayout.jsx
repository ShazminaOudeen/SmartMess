import { Outlet, useLocation, useNavigate } from "react-router-dom";
import StudentSidebar from "../components/StudentSidebar";
import NotificationBell from "../components/NotificationBell";

const PAGE_TITLES = {
  "/student/canteens": "Canteens",
  "/student/search":   "Search Meals",
  "/student/cart":     "Cart",
  "/student/checkout": "Checkout",
  "/student/orders":   "My Orders",
  "/student/expenses": "Expenses",
  "/student/rating":   "Rate Order",
};

export default function StudentLayout() {
  const location = useLocation();
  const navigate  = useNavigate();

  const title = Object.entries(PAGE_TITLES).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] || "SmartMess";

  return (
    <div className="flex min-h-screen bg-mesh">
      <StudentSidebar />

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">

        {/* ── Top bar ── */}
        <header
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-3"
          style={{
            background: "linear-gradient(135deg, #0f1f14 0%, #0a1a0f 100%)",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {/* Left — breadcrumb style */}
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-xs font-medium">SmartMess</span>
            <span className="text-gray-700 text-xs">/</span>
            <span className="text-green-400 text-xs font-semibold">{title}</span>
          </div>

          {/* Right — bell + avatar */}
          <div className="flex items-center gap-3">
            <NotificationBell />

            {/* Avatar */}
            <div
              className="flex items-center gap-2 pl-3 cursor-pointer group"
              style={{ borderLeft: "1px solid rgba(255,255,255,0.08)" }}
              onClick={() => navigate("/student/canteens")}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #16a34a, #4ade80)" }}
              >
                TS
              </div>
              <div className="hidden sm:block">
                <p className="text-white text-xs font-semibold leading-none">Test Student</p>
                <p className="text-gray-500 text-[10px] mt-0.5">Student</p>
              </div>
            </div>
          </div>
        </header>

        {/* ── Page content ── */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
