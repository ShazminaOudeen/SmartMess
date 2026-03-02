import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { trackingAPI } from "../../api/studentApi";

const TEMP_STUDENT_ID = "64f1a2b3c4d5e6f7a8b9c0d1";

export default function RatingFeedbackForm() {
  const { orderId, canteenId } = useParams();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a star rating!");
      return;
    }
    setSubmitting(true);
    setError("");

    const res = await trackingAPI.submitRating({
      studentId: TEMP_STUDENT_ID,
      canteenId,
      orderId,
      rating,
      feedback,
    });

    if (res.success) {
      setSubmitted(true);
    } else {
      setError(res.message || "Something went wrong. Try again.");
    }
    setSubmitting(false);
  };

  const STAR_LABELS = ["", "Poor 😞", "Fair 😐", "Good 🙂", "Great 😄", "Excellent! 🤩"];

  // Success Screen
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="card max-w-md w-full text-center animate-scale-up">
          <div className="text-6xl mb-4">🌟</div>
          <h2 className="text-2xl font-bold text-jungle-700 dark:text-primary-400 mb-2">
            Thank You!
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Your feedback helps us improve the canteen experience.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/student/orders")}
              className="btn-primary flex-1"
            >
              Back to Orders
            </button>
            <button
              onClick={() => navigate("/student/canteens")}
              className="btn-secondary flex-1"
            >
              Browse More
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8 flex items-center justify-center">
      <div className="max-w-lg w-full">

        {/* Header */}
        <div className="text-center animate-fade-down mb-8">
          <p className="text-5xl mb-3">⭐</p>
          <h1 className="text-3xl font-bold text-jungle-700 dark:text-primary-400">
            Rate Your Order
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
            How was your experience?
          </p>
        </div>

        <div className="card animate-fade-up">

          {/* Star Rating */}
          <div className="text-center mb-6">
            <p className="text-gray-600 dark:text-gray-400 font-medium mb-4">
              Tap a star to rate
            </p>
            <div className="flex justify-center gap-3 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  className="text-4xl transition-all duration-150 hover:scale-125"
                >
                  {star <= (hovered || rating) ? "⭐" : "☆"}
                </button>
              ))}
            </div>
            {(hovered || rating) > 0 && (
              <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 animate-fade-in">
                {STAR_LABELS[hovered || rating]}
              </p>
            )}
          </div>

          {/* Feedback Text */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Feedback <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us what you liked or what could be improved..."
              rows={4}
              className="input-field resize-none"
            />
            <p className="text-xs text-gray-400 mt-1 text-right">
              {feedback.length}/300
            </p>
          </div>

          {/* Quick Tags */}
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Quick Tags
            </p>
            <div className="flex flex-wrap gap-2">
              {["Delicious 😋", "Good Portion 🍱", "Fast Service ⚡", "Value for Money 💰", "Clean 🧹", "Friendly Staff 😊"].map((tag) => (
                <button
                  key={tag}
                  onClick={() =>
                    setFeedback((prev) =>
                      prev.includes(tag) ? prev.replace(tag, "").trim() : `${prev} ${tag}`.trim()
                    )
                  }
                  className={`px-3 py-1.5 rounded-full text-sm transition-all duration-200 ${
                    feedback.includes(tag)
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary-100 dark:hover:bg-primary-900/30"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 mb-4 text-red-600 dark:text-red-400 text-sm animate-fade-in">
              ⚠️ {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/student/orders")}
              className="btn-secondary flex-1"
            >
              Skip
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className={`btn-primary flex-1 ${submitting ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {submitting ? "Submitting..." : "Submit Rating ⭐"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}