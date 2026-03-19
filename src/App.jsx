import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./Pages/Home/homepage";
import LoginPortal from "./Pages/Home/LoginPortal";

// Auth (Member 1)
import LoginPage from "./Pages/Auth/LoginPage";
import StudentRegister from "./Pages/Auth/StudentRegister";
import CanteenRegister from "./Pages/Auth/CanteenRegister";
import ProfilePage from "./Pages/Auth/ProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";

// Admin (Member 4)
import AdminLayout from "./Pages/Admin/AdminLayout";

// Student Layout
import StudentLayout from "./layouts/StudentLayout";

// Student Pages
import CanteenListingPage from "./Pages/Student/CanteenListingPage";
import MealListingPage from "./Pages/Student/MealListingPage";
import CartPage from "./Pages/Student/CartPage";
import CheckoutPage from "./Pages/Student/CheckoutPage";
import OrderHistoryPage from "./Pages/Student/OrderHistoryPage";
import ExpenseDashboard from "./Pages/Student/ExpenseDashboard";
import RatingFeedbackForm from "./Pages/Student/RatingFeedbackForm";
import GlobalSearchPage from "./Pages/Student/GlobalSearchPage";

//canteen pages
import CanteenLayout from "./Pages/Canteen/CanteenLayout";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPortal />} />
        <Route path="/login/:role" element={<LoginPage />} />
        <Route path="/register/student" element={<StudentRegister />} />
        <Route path="/register/canteen" element={<CanteenRegister />} />

        {/* Protected Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route path="/admin/*" element={<AdminLayout />} />

        {/*canteen Routes*/}
        <Route path="/canteen/*" element={<CanteenLayout />} />

        {/* Student Routes WITH Sidebar Layout */}
        <Route element={<StudentLayout />}>
          <Route path="/student/canteens" element={<CanteenListingPage />} />
          <Route path="/student/canteens/:canteenId/meals" element={<MealListingPage />} />
          <Route path="/student/search" element={<GlobalSearchPage />} />
          <Route path="/student/cart" element={<CartPage />} />
          <Route path="/student/checkout" element={<CheckoutPage />} />
          <Route path="/student/orders" element={<OrderHistoryPage />} />
          <Route path="/student/expenses" element={<ExpenseDashboard />} />
          <Route path="/student/rating/:orderId/:canteenId" element={<RatingFeedbackForm />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
