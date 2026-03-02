import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./Pages/Home/homepage";
import LoginPortal from "./Pages/Home/LoginPortal";

// Layout
import StudentLayout from "./layouts/StudentLayout";

// Student Pages
import CanteenListingPage from "./Pages/Student/CanteenListingPage";
import MealListingPage from "./Pages/Student/MealListingPage";
import CartPage from "./Pages/Student/CartPage";
import CheckoutPage from "./Pages/Student/CheckoutPage";
import OrderHistoryPage from "./Pages/Student/OrderHistoryPage";
import ExpenseDashboard from "./Pages/Student/ExpenseDashboard";
import RatingFeedbackForm from "./Pages/Student/RatingFeedbackForm";

function RegisterPlaceholder() {
  return <h1 style={{ padding: "100px", textAlign: "center" }}>Register Page (Coming Soon)</h1>;
}
function LoginPagePlaceholder() {
  return <h1 style={{ padding: "100px", textAlign: "center" }}>Login Page (Coming Soon)</h1>;
}

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPlaceholder />} />
        <Route path="/login" element={<LoginPortal />} />
        <Route path="/login/user" element={<LoginPagePlaceholder />} />
        <Route path="/login/canteen" element={<LoginPagePlaceholder />} />
        <Route path="/login/admin" element={<LoginPagePlaceholder />} />

        {/* ✅ Student Routes WITH Sidebar Layout */}
        <Route element={<StudentLayout />}>
          <Route path="/student/canteens" element={<CanteenListingPage />} />
          <Route path="/student/canteens/:canteenId/meals" element={<MealListingPage />} />
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