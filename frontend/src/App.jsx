import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./Pages/Home/homepage";
import LoginPortal from "./Pages/Home/LoginPortal";
import LoginPage from "./Pages/Auth/LoginPage";
import StudentRegister from "./Pages/Auth/StudentRegister";
import CanteenRegister from "./Pages/Auth/CanteenRegister";
import ProfilePage from "./Pages/Auth/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./Pages/Admin/AdminLayout";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPortal />} />
        <Route path="/login/:role" element={<LoginPage />} />
        <Route path="/register/student" element={<StudentRegister />} />
        <Route path="/register/canteen" element={<CanteenRegister />} />

        {/* Protected routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route path="/admin/*" element={<AdminLayout />} />
      </Routes>
    </Router>
  );
}

export default App;