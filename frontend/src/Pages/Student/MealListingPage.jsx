import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ShoppingCart, SlidersHorizontal, Plus, Check, AlertCircle, Utensils, X } from "lucide-react";
import { canteenAPI, cartAPI } from "../../api/studentApi";

const CATEGORIES = ["All", "Rice", "Noodles", "Drinks", "Snacks", "Desserts", "Other"];
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
  const [canteen, setCanteen] = useState(null);
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState("");
  const [addedMap, setAddedMap] = useState({});
  const [toast, setToast] = useState("");
  const [showFilters, setShowFilters] = useState(false);

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
    const res = await cartAPI.addToCart({ studentId: TEMP_STUDENT_ID, mealId: meal._id, quantity: 1 });
    if (res.success) {
      setAddedMap((prev) => ({ ...prev, [meal._id]: true }));
      setToast(`${meal.name} added to cart`);
      setTimeout(() => setToast(""), 2500);
      setTimeout(() => setAddedMap((prev) => ({ ...prev, [meal._id]: false })), 2000);
    }
  };

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
                  onClick={() => alert('Report an Issue — coming soon (Admin module)')}
                  className="btn-secondary flex items-center gap-2 text-xs"
                >
                  <AlertCircle size={13} />
                  Report Issue
                </button>
                <button onClick={() => navigate("/student/cart")} className="btn-primary flex items-center gap-2">
                  <ShoppingCart size={15} />
                  Cart
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="card mb-6 animate-fade-up">
          <div className="flex items-center justify-between mb-3">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => handleFilter(cat, maxPrice)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    category === cat
                      ? "text-white shadow-sm"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700"
                  }`}
                  style={category === cat ? { background: "linear-gradient(135deg, #16a34a, #15803d)" } : {}}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                showFilters || maxPrice
                  ? "border-green-400 text-green-600 bg-green-50 dark:bg-green-900/20"
                  : "border-gray-200 dark:border-gray-600 text-gray-500 hover:border-gray-300"
              }`}>
              <SlidersHorizontal size={13} />
              Filter
              {maxPrice && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
            </button>
          </div>

          {showFilters && (
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-700 animate-fade-in">
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">Max Price (RM)</label>
              <input type="number" placeholder="e.g. 10" value={maxPrice}
                onChange={(e) => handleFilter(category, e.target.value)}
                className="input-field w-28 text-xs py-1.5" />
              {maxPrice && (
                <button onClick={() => handleFilter(category, "")}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600">
                  <X size={12} /> Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* Toast */}
        {toast && (
          <div className="fixed top-5 right-5 flex items-center gap-2.5 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-xl animate-slide-left z-50"
            style={{ background: "linear-gradient(135deg, #16a34a, #15803d)" }}>
            <Check size={15} />
            {toast}
          </div>
        )}

        {/* Meals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading && [1, 2, 3, 4, 5, 6].map((i) => <MealSkeleton key={i} />)}

          {!loading && meals.map((meal, i) => (
            <div key={meal._id}
              className={`card group animate-fade-up animation-delay-${Math.min((i + 1) * 100, 500)} flex flex-col hover:shadow-md hover:-translate-y-0.5 transition-all duration-300`}>
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
                  <span className="text-xs font-medium text-gray-400 mr-0.5">RM</span>
                  {meal.price?.toFixed(2)}
                </span>
                <button
                  onClick={() => handleAddToCart(meal)}
                  disabled={addedMap[meal._id]}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    addedMap[meal._id]
                      ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 cursor-not-allowed"
                      : "btn-primary"
                  }`}
                >
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
