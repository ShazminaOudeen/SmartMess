import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { canteenAPI } from "../../api/studentApi";

export default function CanteenListingPage() {
  const [canteens, setCanteens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    canteenAPI.getAll().then((res) => {
      if (res.success) setCanteens(res.data);
      setLoading(false);
    });
  }, []);

  const filtered = canteens.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="animate-fade-down mb-8">
          <h1 className="text-3xl font-bold text-jungle-700 dark:text-primary-400 mb-1">
            🍽️ Our Canteens
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Browse and pick your favourite canteen
          </p>
        </div>

        {/* Search */}
        <div className="animate-fade-up mb-6">
          <input
            type="text"
            placeholder="🔍 Search canteens..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field max-w-md"
          />
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin-slow text-4xl">🍴</div>
            <p className="ml-3 text-gray-500">Loading canteens...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <p className="text-6xl mb-4">🏪</p>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No canteens found
            </p>
          </div>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((canteen, i) => (
            <div
              key={canteen._id}
              onClick={() => navigate(`/student/canteens/${canteen._id}/meals`)}
              className={`card cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-up animation-delay-${(i + 1) * 100}`}
            >
              {/* Image */}
              <div className="w-full h-40 rounded-lg bg-jungle-100 dark:bg-gray-700 mb-4 overflow-hidden">
                {canteen.image ? (
                  <img
                    src={canteen.image}
                    alt={canteen.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">
                    🍱
                  </div>
                )}
              </div>

              {/* Info */}
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1">
                {canteen.name}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                {canteen.description || "Delicious meals await!"}
              </p>

              <div className="flex items-center justify-between text-sm">
                <span className="text-jungle-600 dark:text-primary-400 font-medium">
                  🕐 {canteen.operatingHours || "Open Now"}
                </span>
                <span className="bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-1 rounded-full text-xs font-semibold">
                  📍 {canteen.location || "On Campus"}
                </span>
              </div>

              <button className="btn-primary w-full mt-4 text-sm">
                View Meals →
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}