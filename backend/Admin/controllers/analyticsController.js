const mongoose = require('mongoose');
const getCollection = (name) => mongoose.connection.db.collection(name);

// ── GET /api/admin/analytics/canteens?month=3&year=2026 ───────────────────────
const getCanteenAnalytics = async (req, res) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year  = parseInt(req.query.year)  || new Date().getFullYear();

    // Date range for the selected month
    const startDate = new Date(year, month - 1, 1);
    const endDate   = new Date(year, month, 1);

    // Get all approved canteens
    const canteens = await getCollection('canteens')
      .find({ isApproved: true })
      .toArray();

    const enriched = await Promise.all(canteens.map(async (c) => {
      // Monthly orders and revenue
      const monthlyOrders = await getCollection('orders').aggregate([
        { $match: { canteen: c._id, createdAt: { $gte: startDate, $lt: endDate }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
      ]).toArray();

      // All-time orders and revenue
      const totalOrders = await getCollection('orders').aggregate([
        { $match: { canteen: c._id, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, count: { $sum: 1 }, revenue: { $sum: '$totalAmount' } } },
      ]).toArray();

      return {
        _id:            c._id,
        name:           c.name,
        images:         c.images,
        monthlyOrders:  monthlyOrders[0]?.count   || 0,
        monthlyRevenue: monthlyOrders[0]?.revenue  || 0,
        totalOrders:    totalOrders[0]?.count      || 0,
        totalRevenue:   totalOrders[0]?.revenue    || 0,
      };
    }));

    // Sort by monthly revenue descending
    enriched.sort((a, b) => b.monthlyRevenue - a.monthlyRevenue);

    const totalRevenue = enriched.reduce((s, c) => s + c.monthlyRevenue, 0);
    const totalOrders  = enriched.reduce((s, c) => s + c.monthlyOrders,  0);
    const topCanteen   = enriched[0]?.name || '—';

    res.json({
      success: true,
      data: enriched,
      summary: { totalRevenue, totalOrders, topCanteen },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/admin/analytics/monthly-trend?year=2026 ─────────────────────────
const getMonthlyTrend = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();

    // Get all approved canteens
    const canteens = await getCollection('canteens')
      .find({ isApproved: true }, { projection: { name: 1 } })
      .toArray();

    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    // Build monthly data for each canteen
    const data = await Promise.all(MONTHS.map(async (monthLabel, i) => {
      const startDate = new Date(year, i, 1);
      const endDate   = new Date(year, i + 1, 1);

      const row = { month: monthLabel };

      await Promise.all(canteens.map(async (c) => {
        const result = await getCollection('orders').aggregate([
          { $match: { canteen: c._id, createdAt: { $gte: startDate, $lt: endDate }, status: { $ne: 'cancelled' } } },
          { $group: { _id: null, count: { $sum: 1 } } },
        ]).toArray();
        row[c.name] = result[0]?.count || 0;
      }));

      return row;
    }));

    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getCanteenAnalytics, getMonthlyTrend };

