import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, ArrowLeft, CheckCircle, AlertCircle, Utensils } from "lucide-react";
import { trackingAPI } from "../../api/studentApi";

const TEMP_STUDENT_ID = "64f1a2b3c4d5e6f7a8b9c0d1";

const STAR_LABELS = ["", "Poor", "Fair", "Good", "Great", "Excellent"];
const QUICK_TAGS  = ["Delicious", "Good Portion", "Fast Service", "Value for Money", "Clean", "Friendly Staff"];

export default function RatingFeedbackForm() {
  const { orderId, canteenId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating]     = useState(0);
  const [hovered, setHovered]   = useState(0);
  const [feedback, setFeedback] = useState("");
  const [tags, setTags]         = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [error, setError]           = useState("");

  const toggleTag = (tag) => setTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);

  const handleSubmit = async () => {
    if (rating === 0) { setError("Please select a star rating to continue."); return; }
    setSubmitting(true);
    setError("");
    const fullFeedback = [feedback, ...tags].filter(Boolean).join(" · ");
    const res = await trackingAPI.submitRating({ studentId: TEMP_STUDENT_ID, canteenId, orderId, rating, feedback: fullFeedback });
    if (res.success) { setSubmitted(true); }
    else { setError(res.message || "Something went wrong. Please try again."); }
    setSubmitting(false);
  };

  const activeRating = hovered || rating;

  /* Success */
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="card max-w-md w-full text-center animate-scale-up py-10">
          <div className="w-20 h-20 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={38} className="text-green-600" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Thank You!</h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            Your feedback helps improve the canteen experience for everyone.
          </p>
          <div className="flex gap-3">
            <button onClick={() => navigate("/student/orders")} className="btn-primary flex-1">Back to Orders</button>
            <button onClick={() => navigate("/student/canteens")} className="btn-secondary flex-1">Browse More</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-8 flex items-start justify-center">
      <div className="max-w-lg w-full">

        {/* Header */}
        <div className="page-header animate-fade-down">
          <button onClick={() => navigate("/student/orders")}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-600 transition-colors mb-4 group">
            <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
            Back to Orders
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
              <Star size={20} className="text-amber-500" fill="currentColor" />
            </div>
            <div>
              <h1 className="section-title">Rate Your Order</h1>
              <p className="section-subtitle">Share your dining experience</p>
            </div>
          </div>
        </div>

        <div className="card animate-fade-up space-y-6">

          {/* Stars */}
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">How would you rate your experience?</p>
            <div className="flex items-center gap-3 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="transition-all duration-150 hover:scale-110 active:scale-95">
                  <Star
                    size={36}
                    className={`transition-colors duration-150 ${
                      star <= activeRating ? "text-amber-400" : "text-gray-200 dark:text-gray-700"
                    }`}
                    fill={star <= activeRating ? "currentColor" : "none"}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
              {activeRating > 0 && (
                <span className="ml-2 text-sm font-semibold text-amber-600 dark:text-amber-400 animate-fade-in">
                  {STAR_LABELS[activeRating]}
                </span>
              )}
            </div>
          </div>

          {/* Quick Tags */}
          <div>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Quick tags <span className="text-gray-400 font-normal">(optional)</span></p>
            <div className="flex flex-wrap gap-2">
              {QUICK_TAGS.map((tag) => (
                <button key={tag} onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                    tags.includes(tag)
                      ? "border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                      : "border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300"
                  }`}>
                  {tags.includes(tag) && <span className="mr-1">✓</span>}
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Additional comments <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value.slice(0, 300))}
              placeholder="Tell us what you liked or what could be improved..."
              rows={4}
              className="input-field resize-none text-sm"
            />
            <p className="text-xs text-gray-400 text-right mt-1">{feedback.length}/300</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-fade-in">
              <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-1">
            <button onClick={() => navigate("/student/orders")} className="btn-secondary flex-1">Skip</button>
            <button onClick={handleSubmit} disabled={submitting}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              {submitting
                ? "Submitting..."
                : <><Star size={14} fill="currentColor" /> Submit Rating</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
