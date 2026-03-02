import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cartAPI } from "../../api/studentApi";

// 🔴 TEMPORARY: Replace with real student ID once Member 1 adds auth
const TEMP_STUDENT_ID = "64f1a2b3c4d5e6f7a8b9c0d1";

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    const res = await cartAPI.getCart(TEMP_STUDENT_ID);
    if (res.success) setCart(res.data);
    setLoading(false);
  };

  const handleUpdate = async (mealId, quantity) => {
    setUpdating(mealId);
    const res = await cartAPI.updateItem({
      studentId: TEMP_STUDENT_ID,
      mealId,
      quantity,
    });
    if (res.success) setCart(res.data);
    setUpdating("");
  };

  const handleRemove = async (mealId) => {
    setUpdating(mealId);
    const res = await cartAPI.removeItem({
      studentId: TEMP_STUDENT_ID,
      mealId,
    });
    if (res.success) setCart(res.data);
    setUpdating("");
  };

  const handleClear = async () => {
    await cartAPI.clearCart(TEMP_STUDENT_ID);
    setCart(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin-slow text-5xl">🛒</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="animate-fade-down flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-jungle-700 dark:text-primary-400">
              🛒 Your Cart
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              Review your items before checkout
            </p>
          </div>
          <button
            onClick={() => navigate("/student/canteens")}
            className="btn-secondary text-sm"
          >
            ← Continue Shopping
          </button>
        </div>

        {/* Empty Cart */}
        {(!cart || cart.items.length === 0) && (
          <div className="card text-center py-16 animate-fade-in">
            <p className="text-6xl mb-4">🛒</p>
            <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Add some delicious meals first!
            </p>
            <button
              onClick={() => navigate("/student/canteens")}
              className="btn-primary"
            >
              Browse Canteens
            </button>
          </div>
        )}

        {/* Cart Items */}
        {cart && cart.items.length > 0 && (
          <>
            {/* Canteen Info */}
            <div className="card mb-4 animate-fade-up flex items-center gap-3">
              <span className="text-2xl">🏪</span>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Ordering from</p>
                <p className="font-bold text-gray-800 dark:text-white">
                  {cart.canteen?.name || "Canteen"}
                </p>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3 mb-4">
              {cart.items.map((item, i) => (
                <div
                  key={item.meal?._id || i}
                  className={`card animate-fade-up animation-delay-${(i + 1) * 100} flex items-center gap-4`}
                >
                  {/* Meal Image */}
                  <div className="w-16 h-16 rounded-lg bg-jungle-50 dark:bg-gray-700 flex items-center justify-center text-2xl overflow-hidden flex-shrink-0">
                    {item.meal?.image ? (
                      <img src={item.meal.image} alt={item.meal.name} className="w-full h-full object-cover" />
                    ) : "🍛"}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 dark:text-white">
                      {item.meal?.name || "Meal"}
                    </h3>
                    <p className="text-jungle-600 dark:text-primary-400 font-semibold text-sm">
                      RM {item.price?.toFixed(2)} each
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdate(item.meal?._id, item.quantity - 1)}
                      disabled={updating === item.meal?._id}
                      className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold hover:bg-primary-100 transition-colors flex items-center justify-center"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-bold text-gray-800 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdate(item.meal?._id, item.quantity + 1)}
                      disabled={updating === item.meal?._id}
                      className="w-8 h-8 rounded-full bg-primary-600 text-white font-bold hover:bg-primary-700 transition-colors flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right min-w-[70px]">
                    <p className="font-bold text-gray-800 dark:text-white">
                      RM {(item.price * item.quantity).toFixed(2)}
                    </p>
                    <button
                      onClick={() => handleRemove(item.meal?._id)}
                      disabled={updating === item.meal?._id}
                      className="text-red-400 hover:text-red-600 text-xs mt-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="card animate-fade-up mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-400">
                  Items ({cart.items.length})
                </span>
                <span className="text-gray-800 dark:text-white font-medium">
                  RM {cart.totalAmount?.toFixed(2)}
                </span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800 dark:text-white">
                  Total
                </span>
                <span className="text-2xl font-bold text-jungle-700 dark:text-primary-400">
                  RM {cart.totalAmount?.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 animate-fade-up">
              <button
                onClick={handleClear}
                className="btn-secondary flex-1"
              >
                🗑️ Clear Cart
              </button>
              <button
                onClick={() => navigate("/student/checkout")}
                className="btn-primary flex-1 text-lg"
              >
                Proceed to Checkout →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}