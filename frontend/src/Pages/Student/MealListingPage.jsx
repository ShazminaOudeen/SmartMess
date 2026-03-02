import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { canteenAPI, cartAPI } from "../../api/studentApi";

const CATEGORIES = ["All", "Rice", "Noodles", "Drinks", "Snacks", "Desserts", "Other"];
const TEMP_STUDENT_ID = "64f1a2b3c4d5e6f7a8b9c0d1";

export default function MealListingPage() {
  const { canteenId } = useParams();
  const navigate = useNavigate();
  const [canteen, setCanteen] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState("");
  const [addedMap, setAddedMap] = useState({});
  const [toast, setToast] = useState("");

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

  const handleFilter = (cat, price) => {
    setCategory(cat);
    setMaxPrice(price);
    fetchMeals(cat, price);
  };

  const handleAddToCart = async (meal) => {
    const res = await cartAPI.addToCart({
      studentId: TEMP_STUDENT_ID,
      mealId: meal._id,
      quantity: 1,
    });
    if (res.success) {
      setAddedMap((prev) => ({ ...prev, [meal._id]: true }));
      setToast(`✅ ${meal.name} added to cart!`);
      setTimeout(() => setToast(""), 2500);
      setTimeout(() => setAddedMap((prev) => ({ ...prev, [meal._id]: false })), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <div className="max-w-6xl mx-auto">

        {/* Back button */}
        <button
          onClick={() => navigate("/student/canteens")}
          className="btn-secondary mb-6 text-sm"
        >
          ← Back to Canteens
        </button>

        {/* Canteen Header */}
        {canteen && (
          <div className="card mb-6 animate-fade-down flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-jungle-100 dark:bg-gray-700 flex items-center justify-center text-3xl overflow-hidden flex-shrink-0">
              {canteen.image ? (
                <img src={canteen.image} alt={canteen.name} className="w-full h-full object-cover" />
              ) : "🍱"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-jungle-700 dark:text-primary-400">
                {canteen.name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {canteen.description || "Browse our delicious meals"}
              </p>
            </div>

            {/* ✅ Report + View Cart buttons */}
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => alert('🚧 Report an Issue feature coming soon! This will be implemented by the Admin module.')}
                className="btn-secondary text-sm"
              >
                🚨 Report an Issue
              </button>
              <button
                onClick={() => navigate("/student/cart")}
                className="btn-primary"
              >
                🛒 View Cart
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card mb-6 animate-fade-up">
          <div className="flex flex-wrap gap-2 mb-4">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleFilter(cat, maxPrice)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  category === cat
                    ? "bg-primary-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 dark:text-gray-400">Max Price (RM):</label>
            <input
              type="number"
              placeholder="e.g. 10"
              value={maxPrice}
              onChange={(e) => handleFilter(category, e.target.value)}
              className="input-field w-32"
            />
            {maxPrice && (
              <button
                onClick={() => handleFilter(category, "")}
                className="text-sm text-red-500 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className="fixed top-6 right-6 bg-jungle-600 text-white px-5 py-3 rounded-xl shadow-lg animate-slide-left z-50">
            {toast}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="animate-spin-slow text-4xl">🍴</div>
          </div>
        )}

        {/* Meals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {!loading && meals.map((meal, i) => (
            <div
              key={meal._id}
              className={`card animate-fade-up animation-delay-${(i + 1) * 100} flex flex-col`}
            >
              <div className="w-full h-36 rounded-lg bg-jungle-50 dark:bg-gray-700 mb-3 overflow-hidden flex items-center justify-center">
                {meal.image ? (
                  <img src={meal.image} alt={meal.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl">🍛</span>
                )}
              </div>
              <span className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded-full w-fit mb-2">
                {meal.category}
              </span>
              <h3 className="font-bold text-gray-800 dark:text-white text-lg">{meal.name}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 flex-1">
                {meal.description || ""}
              </p>
              <div className="flex items-center justify-between mt-auto">
                <span className="text-jungle-700 dark:text-primary-400 font-bold text-lg">
                  RM {meal.price?.toFixed(2)}
                </span>
                <button
                  onClick={() => handleAddToCart(meal)}
                  disabled={addedMap[meal._id]}
                  className={`btn-primary text-sm transition-all ${addedMap[meal._id] ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  {addedMap[meal._id] ? "✅ Added" : "+ Add to Cart"}
                </button>
              </div>
            </div>
          ))}
        </div>

        {!loading && meals.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <p className="text-6xl mb-3">🍽️</p>
            <p className="text-gray-500 dark:text-gray-400">No meals found for this filter</p>
          </div>
        )}
      </div>
    </div>
  );
}