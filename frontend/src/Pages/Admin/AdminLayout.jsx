import { Routes, Route } from "react-router-dom";
import AdminSidebar from "./components/AdminSidebar";

// Placeholder components for admin pages
function DashboardPlaceholder() { return <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center"><div className="text-center"><h2 className="text-2xl font-bold">Dashboard Coming Soon</h2></div></div>; }
function UsersPlaceholder() { return <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center"><div className="text-center"><h2 className="text-2xl font-bold">Users Management Coming Soon</h2></div></div>; }
function AnalyticsPlaceholder() { return <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center"><div className="text-center"><h2 className="text-2xl font-bold">Analytics Coming Soon</h2></div></div>; }
function ComplaintsPlaceholder() { return <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center"><div className="text-center"><h2 className="text-2xl font-bold">Complaints Management Coming Soon</h2></div></div>; }
function CanteenApprovalsPlaceholder() { return <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center"><div className="text-center"><h2 className="text-2xl font-bold">Canteen Approvals Coming Soon</h2></div></div>; }
function ManageCanteensPlaceholder() { return <div className="flex-1 bg-gray-50 dark:bg-gray-900 flex items-center justify-center"><div className="text-center"><h2 className="text-2xl font-bold">Manage Canteens Coming Soon</h2></div></div>; }

export default function AdminLayout() {
  return (
    <div className="flex h-screen">
      <AdminSidebar />
      <Routes>
        <Route path="dashboard" element={<DashboardPlaceholder />} />
        <Route path="users" element={<UsersPlaceholder />} />
        <Route path="analytics" element={<AnalyticsPlaceholder />} />
        <Route path="complaints" element={<ComplaintsPlaceholder />} />
        <Route path="canteens/approvals" element={<CanteenApprovalsPlaceholder />} />
        <Route path="canteens/manage" element={<ManageCanteensPlaceholder />} />
        <Route path="*" element={<DashboardPlaceholder />} />
      </Routes>
    </div>
  );
}