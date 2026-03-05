import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, ArrowLeft, Minus, Plus, Trash2, Store, ChevronRight } from "lucide-react";
import { cartAPI } from "../../api/studentApi";

const TEMP_STUDENT_ID = "64f1a2b3c4d5e6f7a8b9c0d1";

function CartSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2].map((i) => (
        <div key={i} className="card flex items-center gap-4">
          <div className="skeleton w-16 h-16 rounded-xl flex-shrink-0" />
          <div className="flex-1">
            <div className="skeleton h-4 w-2/3 mb-2" />
            <div className="skeleton h-3 w-1/3" />
          </div>
          <div className="skeleton h-8 w-24 rounded-xl" />
          <div className="skeleton h-5 w-16" />
        </div>
      ))}
    </div>
  );
}

export default function CartPage() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState("");
  const navigate = useNavigate();

  useEffect(() => { fetchCart(); }, []);

  const fetchCart = async () => {
    const res = await cartAPI.getCart(TEMP_STUDENT_ID);
    if (res.success) setCart(res.data);
    setLoading(false);
  };

  const handleUpdate = async (mealId, quantity) => {
    setUpdating(mealId);
    const res = await cartAPI.updateItem({ studentId: TEMP_STUDENT_ID, mealId, quantity });
    if (res.success) setCart(res.data);
    setUpdating("");
  };

  const handleRemove = async (mealId) => {
    setUpdating(mealId);
    const res = await cartAPI.removeItem({ studentId: TEMP_STUDENT_ID, mealId });
    if (res.success) setCart(res.data);
    setUpdating("");
  };

  const handleClear = async () => {
    await cartAPI.clearCart(TEMP_STUDENT_ID);
    setCart(null);
  };

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="page-header animate-fade-down">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="section-title">Your <span className="text-gradient">Cart</span></h1>
              <p className="section-subtitle">Review items before checkout</p>
            </div>
            <button onClick={() => navigate("/student/canteens")}
              className="btn-secondary flex items-center gap-2 text-sm">
              <ArrowLeft size={14} /> Continue Shopping
            </button>
          </div>
        </div>

        {loading && <CartSkeleton />}

        {/* Empty */}
        {!loading && (!cart || cart.items.length === 0) && (
          <div className="card text-center py-20 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
              <ShoppingCart size={28} className="text-gray-400" />
            </div>
            <p className="font-bold text-gray-800 dark:text-white text-lg mb-1">Your cart is empty</p>
            <p className="text-gray-500 text-sm mb-6">Add some meals to get started</p>
            <button onClick={() => navigate("/student/canteens")} className="btn-primary mx-auto">
              Browse Canteens
            </button>
          </div>
        )}

        {/* Cart Content */}
        {!loading && cart && cart.items.length > 0 && (
          <>
            {/* Canteen info */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/30 mb-4 animate-fade-up">
              <Store size={16} className="text-green-600 dark:text-green-400" />
              <div>
                <p className="text-[11px] text-green-600 dark:text-green-500 font-medium">Ordering from</p>
                <p className="text-sm font-bold text-green-800 dark:text-green-300">{cart.canteen?.name || "Canteen"}</p>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3 mb-5">
              {cart.items.map((item, i) => (
                <div key={item.meal?._id || i}
                  className={`card flex items-center gap-4 animate-fade-up animation-delay-${(i + 1) * 100} hover:shadow-md transition-all`}>
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {item.meal?.image
                      ? <img src={item.meal.image} alt={item.meal.name} className="w-full h-full object-cover" />
                      : <ShoppingCart size={20} className="text-green-300" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{item.meal?.name || "Meal"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">RM {item.price?.toFixed(2)} each</p>
                  </div>

                  {/* Qty controls */}
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 rounded-xl p-1">
                    <button onClick={() => handleUpdate(item.meal?._id, item.quantity - 1)}
                      disabled={updating === item.meal?._id}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-gray-800 dark:hover:text-white hover:bg-white dark:hover:bg-gray-600 transition-all disabled:opacity-40">
                      <Minus size={13} />
                    </button>
                    <span className="w-6 text-center text-sm font-bold text-gray-800 dark:text-white">{item.quantity}</span>
                    <button onClick={() => handleUpdate(item.meal?._id, item.quantity + 1)}
                      disabled={updating === item.meal?._id}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white hover:opacity-90 transition-all disabled:opacity-40"
                      style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
                      <Plus size={13} />
                    </button>
                  </div>

                  <div className="text-right min-w-[70px]">
                    <p className="font-bold text-gray-900 dark:text-white text-sm">RM {(item.price * item.quantity).toFixed(2)}</p>
                    <button onClick={() => handleRemove(item.meal?._id)} disabled={updating === item.meal?._id}
                      className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-600 mt-1 ml-auto transition-colors">
                      <Trash2 size={10} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="glass-card mb-5 animate-fade-up">
              <div className="flex justify-between items-center text-sm mb-3">
                <span className="text-gray-500">Subtotal ({cart.items.length} items)</span>
                <span className="font-medium text-gray-800 dark:text-white">RM {cart.totalAmount?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm mb-4">
                <span className="text-gray-500">Service fee</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex justify-between items-center">
                <span className="font-bold text-gray-900 dark:text-white">Total</span>
                <span className="text-2xl font-bold text-gradient">RM {cart.totalAmount?.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 animate-fade-up">
              <button onClick={handleClear}
                className="flex items-center gap-2 btn-danger">
                <Trash2 size={14} /> Clear Cart
              </button>
              <button onClick={() => navigate("/student/checkout")}
                className="btn-primary flex-1 flex items-center justify-center gap-2 py-3 text-base">
                Proceed to Checkout
                <ChevronRight size={17} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
