import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./Pages/Home/homepage";
import LoginPortal from "./Pages/Home/LoginPortal";
import AdminLayout from "./Pages/Admin/AdminLayout";

// Placeholder Pages
function BrowseCanteensPlaceholder() {
  return (
    <h1 style={{ padding: "100px", textAlign: "center" }}>
      Browse Canteens Page (Coming Soon)
    </h1>
  );
}

function RegisterPlaceholder() {
  return (
    <h1 style={{ padding: "100px", textAlign: "center" }}>
      Register Page (Coming Soon)
    </h1>
  );
}

// Simple placeholder for login pages
function LoginPagePlaceholder({ role }) {
  return (
    <h1 style={{ padding: "100px", textAlign: "center" }}>
      Login Page (Coming Soon)
    </h1>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/canteens" element={<BrowseCanteensPlaceholder />} />
        <Route path="/register" element={<RegisterPlaceholder />} />
        <Route path="/login" element={<LoginPortal />} />

         {/* Admin routes */}
        <Route path="/admin/*" element={<AdminLayout />} />

        {/* login routes */}
        <Route path="/login/user" element={<LoginPagePlaceholder />} />
        <Route path="/login/canteen" element={<LoginPagePlaceholder />} />
        <Route path="/login/admin" element={<LoginPagePlaceholder/>} />
      </Routes>
    </Router>
  );
}

export default App;