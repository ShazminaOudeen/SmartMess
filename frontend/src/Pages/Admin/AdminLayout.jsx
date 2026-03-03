import { Routes, Route } from "react-router-dom";
import AdminSidebar from "./components/AdminSidebar";
import AdminDashboard from "./AdminDashboard";
import AdminProfile from "./AdminProfile";
import AdminHeader from "./components/AdminHeader";
import CanteenApprovals from './CanteenApprovals';
import CanteenVisibility from './Canteenvisibility';
import UserManagement from './Usermanagement';

// ── Placeholder pages — each gets its own title ───────────────────────────────
/*function UsersPlaceholder() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <AdminHeader title="Users" subtitle="Manage all user accounts" />
      <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-600">
        <div className="text-center">
          <p className="text-4xl mb-3">👥</p>
          <p className="font-semibold text-gray-500 dark:text-gray-400">Users Management</p>
          <p className="text-sm text-gray-400 dark:text-gray-600 mt-1">Coming soon</p>
        </div>
      </div>
    </div>
  );
}*/

function AnalyticsPlaceholder() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <AdminHeader title="Analytics" subtitle="System performance & insights" />
      <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-600">
        <div className="text-center">
          <p className="text-4xl mb-3">📊</p>
          <p className="font-semibold text-gray-500 dark:text-gray-400">Analytics</p>
          <p className="text-sm text-gray-400 dark:text-gray-600 mt-1">Coming soon</p>
        </div>
      </div>
    </div>
  );
}

function ComplaintsPlaceholder() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <AdminHeader title="Complaint Management" subtitle="Review and resolve complaints" />
      <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-600">
        <div className="text-center">
          <p className="text-4xl mb-3">🚨</p>
          <p className="font-semibold text-gray-500 dark:text-gray-400">Complaint Management</p>
          <p className="text-sm text-gray-400 dark:text-gray-600 mt-1">Coming soon</p>
        </div>
      </div>
    </div>
  );
}

/*function CanteenApprovalsPlaceholder() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <AdminHeader title="Canteen Management" subtitle="Approvals & canteen oversight" />
      <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-600">
        <div className="text-center">
          <p className="text-4xl mb-3">🏪</p>
          <p className="font-semibold text-gray-500 dark:text-gray-400">Canteen Approvals</p>
          <p className="text-sm text-gray-400 dark:text-gray-600 mt-1">Coming soon</p>
        </div>
      </div>
    </div>
  );
}

function ManageCanteensPlaceholder() {
  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <AdminHeader title="Canteen Management" subtitle="Manage registered canteens" />
      <div className="flex-1 flex items-center justify-center text-gray-400 dark:text-gray-600">
        <div className="text-center">
          <p className="text-4xl mb-3">🏪</p>
          <p className="font-semibold text-gray-500 dark:text-gray-400">Manage Canteens</p>
          <p className="text-sm text-gray-400 dark:text-gray-600 mt-1">Coming soon</p>
        </div>
      </div>
    </div>
  );
}*/

// ── Layout ────────────────────────────────────────────────────────────────────
export default function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 min-w-0 overflow-hidden">
        <Routes>
          <Route path="dashboard"          element={<AdminDashboard />} />
          <Route path="users"              element={<UserManagement />} />
          <Route path="analytics"          element={<AnalyticsPlaceholder />} />
          <Route path="complaints"         element={<ComplaintsPlaceholder />} />
          <Route path="canteens/approvals" element={<CanteenApprovals />} />
          <Route path="canteens/manage"    element={<CanteenVisibility />} />
          <Route path="profile"            element={<AdminProfile />} />
          <Route path="*"                  element={<AdminDashboard />} />
        </Routes>
      </div>
    </div>
  );
}