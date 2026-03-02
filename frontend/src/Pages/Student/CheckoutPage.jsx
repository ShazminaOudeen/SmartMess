import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cartAPI, orderAPI, paymentAPI } from "../../api/studentApi";

const TEMP_STUDENT_ID = "64f1a2b3c4d5e6f7a8b9c0d1";

const PAYMENT_METHODS = [
  { id: "cash", label: "Cash on Pickup", icon: "💵" },
  { id: "card", label: "Debit / Credit Card", icon: "💳" },
  { id: "ewallet", label: "E-Wallet", icon: "📱" },
];

export default function CheckoutPage() {
  const [cart, setCart] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null); // success | failed
  const [placedOrder, setPlacedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    cartAPI.getCart(TEMP_STUDENT_ID).then((res) => {
      if (res.success) setCart(res.data);
      setLoading(false);
    });
  }, []);

  const handlePlaceOrder = async () => {
    if (!cart || cart.items.length === 0) return;
    setProcessing(true);

    const orderRes = await orderAPI.placeOrder({
      studentId: TEMP_STUDENT_ID,
      paymentMethod,
    });

    if (orderRes.success) {
      const payRes = await paymentAPI.processPayment({
        orderId: orderRes.data._id,
        method: paymentMethod,
      });
      setPlacedOrder(orderRes.data);
      setResult(payRes.success ? "success" : "failed");
    } else {
      setResult("failed");
    }
    setProcessing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin-slow text-5xl">💳</div>
      </div>
    );
  }

  // Payment Result Screen
  if (result) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center animate-scale-up">
          <div className="text-6xl mb-4">
            {result === "success" ? "🎉" : "❌"}
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${result === "success" ? "text-jungle-700 dark:text-primary-400" : "text-red-500"}`}>
            {result === "success" ? "Order Placed!" : "Payment Failed"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            {result === "success"
              ? "Your order has been placed successfully."
              : "Something went wrong. Please try again."}
          </p>
          {placedOrder && result === "success" && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Order ID: <span className="font-mono font-bold text-gray-800 dark:text-white">{placedOrder._id}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Total: <span className="font-bold text-jungle-700 dark:text-primary-400">RM {placedOrder.totalAmount?.toFixed(2)}</span>
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Payment: <span className="font-bold capitalize">{paymentMethod}</span>
              </p>
            </div>
          )}
          <div className="flex gap-3">
            {result === "failed" && (
              <button
                onClick={() => setResult(null)}
                className="btn-secondary flex-1"
              >
                Try Again
              </button>
            )}
            <button
              onClick={() => navigate("/student/orders")}
              className="btn-primary flex-1"
            >
              {result === "success" ? "Track Order →" : "View Orders"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="animate-fade-down mb-8">
          <button onClick={() => navigate("/student/cart")} className="btn-secondary text-sm mb-4">
            ← Back to Cart
          </button>
          <h1 className="text-3xl font-bold text-jungle-700 dark:text-primary-400">
            💳 Checkout
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Review and confirm your order
          </p>
        </div>

        {/* Order Summary */}
        <div className="card mb-5 animate-fade-up">
          <h2 className="font-bold text-gray-800 dark:text-white text-lg mb-4">
            🧾 Order Summary
          </h2>
          {cart?.items.map((item, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
              <div>
                <p className="font-medium text-gray-800 dark:text-white">
                  {item.meal?.name || "Meal"}
                </p>
                <p className="text-xs text-gray-500">x{item.quantity}</p>
              </div>
              <p className="font-semibold text-gray-800 dark:text-white">
                RM {(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
          <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <span className="text-lg font-bold text-gray-800 dark:text-white">Total</span>
            <span className="text-2xl font-bold text-jungle-700 dark:text-primary-400">
              RM {cart?.totalAmount?.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="card mb-6 animate-fade-up animation-delay-200">
          <h2 className="font-bold text-gray-800 dark:text-white text-lg mb-4">
            💰 Payment Method
          </h2>
          <div className="space-y-3">
            {PAYMENT_METHODS.map((method) => (
              <button
                key={method.id}
                onClick={() => setPaymentMethod(method.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                  paymentMethod === method.id
                    ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-primary-300"
                }`}
              >
                <span className="text-2xl">{method.icon}</span>
                <span className={`font-medium ${paymentMethod === method.id ? "text-primary-700 dark:text-primary-400" : "text-gray-700 dark:text-gray-300"}`}>
                  {method.label}
                </span>
                {paymentMethod === method.id && (
                  <span className="ml-auto text-primary-600 dark:text-primary-400 font-bold">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Place Order Button */}
        <button
          onClick={handlePlaceOrder}
          disabled={processing || !cart || cart.items.length === 0}
          className={`btn-primary w-full py-4 text-lg font-bold animate-fade-up animation-delay-300 ${processing ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {processing ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin-slow">⏳</span> Processing...
            </span>
          ) : (
            `🛒 Place Order — RM ${cart?.totalAmount?.toFixed(2) || "0.00"}`
          )}
        </button>
      </div>
    </div>
  );
}