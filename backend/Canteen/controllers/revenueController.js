const mongoose = require('mongoose');

const TEMP_CANTEEN_ID = '69aac230df75a9778e441db5';

const getOrders = () => mongoose.connection.db.collection('orders');

// ── GET /api/canteen/revenue?year=2026&month=3 ────────────────────────────────
const getRevenue = async (req, res) => {
  try {
    const year  = parseInt(req.query.year)  || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth   = new Date(year, month, 0, 23, 59, 59);

    // ── Completed orders for this month ──────────────────────────────────────
    const completedOrders = await getOrders().find({
      canteenId:  new mongoose.Types.ObjectId(TEMP_CANTEEN_ID),
      status:     'completed',
      createdAt:  { $gte: startOfMonth, $lte: endOfMonth },
    }).toArray();

    // ── Summary ───────────────────────────────────────────────────────────────
    const totalRevenue   = completedOrders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const totalOrders    = completedOrders.length;
    const avgOrderValue  = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // ── Daily breakdown ───────────────────────────────────────────────────────
    const daysInMonth = new Date(year, month, 0).getDate();
    const dailyMap = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const key = `${String(d).padStart(2, '0')}/${String(month).padStart(2, '0')}`;
      dailyMap[key] = { date: key, revenue: 0, orders: 0 };
    }
    completedOrders.forEach(o => {
      const d   = new Date(o.createdAt);
      const key = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (dailyMap[key]) {
        dailyMap[key].revenue += o.totalAmount || 0;
        dailyMap[key].orders  += 1;
      }
    });
    const daily = Object.values(dailyMap);

    // ── Monthly breakdown (full year) ─────────────────────────────────────────
    const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const allYearOrders = await getOrders().find({
      canteenId: new mongoose.Types.ObjectId(TEMP_CANTEEN_ID),
      status:    'completed',
      createdAt: { $gte: new Date(year, 0, 1), $lte: new Date(year, 11, 31, 23, 59, 59) },
    }).toArray();

    const monthlyMap = {};
    MONTH_NAMES.forEach((m, i) => {
      monthlyMap[i] = { month: m, revenue: 0, orders: 0 };
    });
    allYearOrders.forEach(o => {
      const m = new Date(o.createdAt).getMonth();
      monthlyMap[m].revenue += o.totalAmount || 0;
      monthlyMap[m].orders  += 1;
    });
    const monthly = Object.values(monthlyMap);

    // ── Popular meals ─────────────────────────────────────────────────────────
    const mealMap = {};
    completedOrders.forEach(o => {
      o.items?.forEach(item => {
        if (!mealMap[item.name]) {
          mealMap[item.name] = { name: item.name, totalOrders: 0, totalRevenue: 0 };
        }
        mealMap[item.name].totalOrders  += item.quantity || 1;
        mealMap[item.name].totalRevenue += (item.price * (item.quantity || 1));
      });
    });
    const popularMeals = Object.values(mealMap)
      .sort((a, b) => b.totalOrders - a.totalOrders)
      .slice(0, 5);

    res.json({
      success: true,
      data: {
        summary:      { totalRevenue, totalOrders, avgOrderValue },
        daily,
        monthly,
        popularMeals,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getRevenue };
