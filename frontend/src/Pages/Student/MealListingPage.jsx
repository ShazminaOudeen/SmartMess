import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, SlidersHorizontal, Plus, Check, AlertCircle, Utensils, X, Star, ChevronDown } from "lucide-react";
import { canteenAPI, cartAPI } from "../../api/studentApi";

const CATEGORIES = ["All", "Breakfast", "Lunch", "Dinner", "Dessert", "Drinks", "Snacks", "Other"];

const PRICE_OPTIONS = [
  { label: "Any Price",    value: "" },
  { label: "Under RS 5",  value: "5" },
  { label: "Under RS 10", value: "10" },
  { label: "Under RS 15", value: "15" },
  { label: "Under RS 20", value: "20" },
  { label: "Under RS 30", value: "30" },
  { label: "Under RS 50", value: "50" },
];

const TEMP_STUDENT_ID = "64f1a2b3c4d5e6f7a8b9c0d1";

function MealSkeleton() {
  return (
    <div className="card">
      <div className="skeleton w-full h-36 mb-3" />
      <div className="skeleton h-3 w-16 mb-2" />
      <div className="skeleton h-5 w-3/4 mb-2" />
      <div className="skeleton h-3 w-full mb-1" />
      <div className="skeleton h-3 w-2/3 mb-4" />
      <div className="flex justify-between items-center">
        <div className="skeleton h-5 w-16" />
        <div className="skeleton h-9 w-28 rounded-xl" />
      </div>
    </div>
  );
}

export default function MealListingPage() {
  const { canteenId } = useParams();
  const navigate = useNavigate();
  const [canteen, setCanteen]     = useState(null);
  const [meals, setMeals]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [category, setCategory]   = useState("All");
  const [maxPrice, setMaxPrice]   = useState("");
  const [addedMap, setAddedMap]   = useState({});
  const [toast, setToast]         = useState("");
  const [ratingModal, setRatingModal] = useState(false);
  const [canteenRating, setCanteenRating] = useState(0);
  const [canteenReview, setCanteenReview] = useState("");
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  useEffect(() => {
    canteenAPI.getById(canteenId).then((res) => {
      if (res.success) setCanteen(res.data);
    });
    fetchMeals();
  }, [canteenId]);

  const fetchMeals = async (cat = "All", price = "") => {
    setLoading(true);
    let filters = "";
    if (cat !== "All") filters += `category=${cat}&`;
    if (price) filters += `maxPrice=${price}&`;
    filters += "available=true";
    const res = await canteenAPI.getMeals(canteenId, filters);
    if (res.success) setMeals(res.data);
    setLoading(false);
  };

  const handleCategoryFilter = (cat) => {
    setCategory(cat);
    fetchMeals(cat, maxPrice);
  };

  const handlePriceFilter = (e) => {
    const price = e.target.value;
    setMaxPrice(price);
    fetchMeals(category, price);
  };

  const handleAddToCart = async (meal) => {
    const res = await cartAPI.addToCart({
      studentId: TEMP_STUDENT_ID,
      mealId: meal._id,
      quantity: 1,
    });
    if (res.success) {
      setAddedMap((prev) => ({ ...prev, [meal._id]: true }));
      setToast(`${meal.name} added to cart!`);
      setTimeout(() => setToast(""), 2500);
      setTimeout(() => setAddedMap((prev) => ({ ...prev, [meal._id]: false })), 2000);
    }
  };

  const submitCanteenRating = () => {
    if (canteenRating === 0) return;
    setRatingSubmitted(true);
    setTimeout(() => {
      setRatingModal(false);
      setRatingSubmitted(false);
      setCanteenRating(0);
      setCanteenReview("");
    }, 1500);
  };

  const selectedPriceLabel = PRICE_OPTIONS.find((o) => o.value === maxPrice)?.label || "Any Price";

  return (
    <div className="min-h-screen px-6 py-8">
      <div className="max-w-6xl mx-auto">

        {/* Back */}
        <button onClick={() => navigate("/student/canteens")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-green-600 transition-colors mb-6 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Canteens
        </button>

        {/* Canteen Header */}
        {canteen && (
          <div className="glass-card mb-6 animate-fade-down">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center overflow-hidden flex-shrink-0">
                {canteen.image
                  ? <img src={canteen.image} alt={canteen.name} className="w-full h-full object-cover" />
                  : <Utensils size={24} className="text-green-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">{canteen.name}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{canteen.description}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setRatingModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-semibold hover:bg-amber-100 transition-colors"
                >
                  <Star size={13} fill="currentColor" /> Rate Canteen
                </button>
                <button
                  onClick={() => alert("Report an Issue — coming soon (Admin module)")}
                  className="btn-secondary flex items-center gap-2 text-xs"
                >
                  <AlertCircle size={13} /> Report
                </button>
                <button onClick={() => navigate("/student/cart")} className="btn-primary flex items-center gap-2">
                  <ShoppingCart size={15} /> Cart
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rate Canteen Modal */}
        {ratingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 w-80 animate-scale-up">
              {ratingSubmitted ? (
                <div className="text-center py-4">
                  <div className="w-14 h-14 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-3">
                    <Check size={28} className="text-green-600" />
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white">Thank you!</p>
                  <p className="text-sm text-gray-500 mt-1">Your rating has been submitted</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 dark:text-white">Rate {canteen?.name}</h3>
                    <button onClick={() => setRatingModal(false)}>
                      <X size={18} className="text-gray-400 hover:text-gray-600" />
                    </button>
                  </div>
                  <div className="flex justify-center gap-2 mb-4">
                    {[1,2,3,4,5].map((star) => (
                      <button key={star} onClick={() => setCanteenRating(star)}>
                        <Star size={32}
                          className={`transition-all duration-150 ${star <= canteenRating ? "text-amber-400" : "text-gray-200 dark:text-gray-600"}`}
                          fill={star <= canteenRating ? "currentColor" : "none"} />
                      </button>
                    ))}
                  </div>
                  <p className="text-center text-xs text-gray-500 mb-4">
                    {["Tap to rate","Poor","Fair","Good","Very Good","Excellent!"][canteenRating]}
                  </p>
                  <textarea
                    placeholder="Leave a review (optional)..."
                    value={canteenReview}
                    onChange={(e) => setCanteenReview(e.target.value)}
                    rows={3}
                    className="input-field w-full text-sm resize-none mb-4"
                  />
                  <button onClick={submitCanteenRating} disabled={canteenRating === 0}
                    className="btn-primary w-full disabled:opacity-40">
                    Submit Rating
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="card mb-6 animate-fade-up">
          <div className="flex items-center justify-between gap-4">
            {/* Category pills */}
            <div className="flex flex-wrap gap-2 flex-1">
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => handleCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    category === cat
                      ? "text-white shadow-sm"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700"
                  }`}
                  style={category === cat ? { background: "linear-gradient(135deg, #16a34a, #15803d)" } : {}}>
                  {cat}
                </button>
              ))}
            </div>

            {/* ✅ Price filter dropdown */}
            <div className="relative flex-shrink-0">
              <div className="flex items-center gap-1.5 pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 z-10">
                <SlidersHorizontal size={13} className={maxPrice ? "text-green-600" : "text-gray-400"} />
              </div>
              <select
                value={maxPrice}
                onChange={handlePriceFilter}
                className={`appearance-none pl-8 pr-8 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 ${
                  maxPrice
                    ? "border-green-400 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400"
                    : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:border-green-300"
                }`}
              >
                {PRICE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown size={13} className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          {/* Active filter indicator */}
          {(category !== "All" || maxPrice) && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <span className="text-xs text-gray-400">Active filters:</span>
              {category !== "All" && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium border border-green-200 dark:border-green-800">
                  {category}
                  <button onClick={() => handleCategoryFilter("All")}><X size={10} /></button>
                </span>
              )}
              {maxPrice && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-medium border border-green-200 dark:border-green-800">
                  {selectedPriceLabel}
                  <button onClick={() => { setMaxPrice(""); fetchMeals(category, ""); }}><X size={10} /></button>
                </span>
              )}
              <button
                onClick={() => { setCategory("All"); setMaxPrice(""); fetchMeals("All", ""); }}
                className="text-xs text-red-500 hover:text-red-600 ml-auto">
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Toast */}
        {toast && (
          <div className="fixed top-5 right-5 flex items-center gap-2.5 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-xl animate-slide-left z-50"
            style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
            <Check size={15} /> {toast}
          </div>
        )}

        {/* Meals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading && [1,2,3,4,5,6].map((i) => <MealSkeleton key={i} />)}
          {!loading && meals.map((meal, i) => (
            <div key={meal._id}
              className={`card group animate-fade-up animation-delay-${Math.min((i+1)*100, 500)} flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all duration-300`}>
              <div className="w-full h-36 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-600 mb-3 overflow-hidden flex items-center justify-center">
                {meal.image
                  ? <img src={meal.image} alt={meal.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  : <Utensils size={32} className="text-green-200 dark:text-gray-500" />}
              </div>
              <span className="badge badge-green mb-2 self-start text-[11px]">{meal.category}</span>
              <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug mb-1">{meal.name}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed mb-3 flex-1 line-clamp-2">{meal.description}</p>
              <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-50 dark:border-gray-700">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  <span className="text-xs font-medium text-gray-400 mr-0.5">RS</span>
                  {meal.price?.toFixed(2)}
                </span>
                <button
                  onClick={() => handleAddToCart(meal)}
                  disabled={addedMap[meal._id]}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    addedMap[meal._id]
                      ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 cursor-not-allowed"
                      : "btn-primary"
                  }`}>
                  {addedMap[meal._id] ? <><Check size={13} /> Added</> : <><Plus size={13} /> Add to Cart</>}
                </button>
              </div>
            </div>
          ))}
        </div>

        {!loading && meals.length === 0 && (
          <div className="card text-center py-20 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-3">
              <Utensils size={24} className="text-gray-400" />
            </div>
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">No meals found</p>
            <p className="text-sm text-gray-400">Try adjusting your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
