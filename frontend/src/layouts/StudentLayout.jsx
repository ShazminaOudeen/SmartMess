import { Outlet } from "react-router-dom";
import StudentSidebar from "../components/StudentSidebar";

export default function StudentLayout() {
  return (
    <div className="flex min-h-screen bg-gray-900">
      <StudentSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}