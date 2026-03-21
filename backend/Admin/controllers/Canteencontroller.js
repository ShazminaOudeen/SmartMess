const mongoose = require('mongoose');
const { logActivity } = require('./dashboardController');

const getCollection = (name) => mongoose.connection.db.collection(name);

// ── GET /api/admin/canteens/stats ─────────────────────────────────────────────
const getCanteenStats = async (req, res) => {
  try {
    const [total, approved, pending] = await Promise.all([
      getCollection('canteens').countDocuments({}),
      getCollection('canteens').countDocuments({ isApproved: true }),
      getCollection('canteens').countDocuments({ isApproved: { $ne: true }, isRejected: { $ne: true } }),
    ]);
    res.json({ success: true, data: { total, approved, pending } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/admin/canteens/visibility-stats ──────────────────────────────────
const getVisibilityStats = async (req, res) => {
  try {
    const [operating, visible, hidden] = await Promise.all([
      getCollection('canteens').countDocuments({ isApproved: true }),
      getCollection('canteens').countDocuments({ isApproved: true, isActive: true }),
      getCollection('canteens').countDocuments({ isApproved: true, isActive: { $ne: true } }),
    ]);
    res.json({ success: true, data: { operating, visible, hidden } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/admin/canteens?status=pending|approved|rejected|all ──────────────
const getCanteens = async (req, res) => {
  try {
    const { status = 'pending' } = req.query;

    let filter = {};
    if (status === 'pending')  filter = { isApproved: { $ne: true }, isRejected: { $ne: true } };
    if (status === 'approved') filter = { isApproved: true };
    if (status === 'rejected') filter = { isRejected: true };
    // 'all' = no filter

    const canteens = await getCollection('canteens')
      .find(filter)
      .sort({ createdAt: -1 })
      .toArray();

    // For each canteen, get order count and complaint count
    const enriched = await Promise.all(canteens.map(async (c) => {
      const [orderCount, complaintCount] = await Promise.all([
        getCollection('orders').countDocuments({ canteen: c._id }),
        getCollection('complaints').countDocuments({ canteen: c._id }).catch(() => 0),
      ]);
      return { ...c, orderCount, complaintCount };
    }));

    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/admin/canteens/approved-list ─────────────────────────────────────
const getApprovedCanteens = async (req, res) => {
  try {
    const canteens = await getCollection('canteens')
      .find({ isApproved: true })
      .sort({ name: 1 })
      .toArray();

    const enriched = await Promise.all(canteens.map(async (c) => {
      const [orderCount, complaintCount] = await Promise.all([
        getCollection('orders').countDocuments({ canteen: c._id }),
        getCollection('complaints').countDocuments({ canteen: c._id }).catch(() => 0),
      ]);
      return { ...c, orderCount, complaintCount };
    }));

    res.json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/admin/canteens/:id/approve ───────────────────────────────────────
const approveCanteen = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await getCollection('canteens').findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: { isApproved: true, isRejected: false, isActive: true, approvedAt: new Date(), approvedBy: req.user?._id } },
      { returnDocument: 'after' }
    );

    if (!result) return res.status(404).json({ success: false, message: 'Canteen not found' });

    await logActivity({
      type: 'CANTEEN_APPROVED',
      description: `Canteen approved: ${result.name}`,
      performedBy: { userId: req.user?._id, name: req.user?.name || 'Admin', role: 'Admin' },
    });

    res.json({ success: true, message: 'Canteen approved successfully', data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/admin/canteens/:id/reject ────────────────────────────────────────
const rejectCanteen = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = '' } = req.body;

    const result = await getCollection('canteens').findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: { isApproved: false, isRejected: true, isActive: false, rejectedAt: new Date(), rejectionReason: reason, rejectedBy: req.user?._id } },
      { returnDocument: 'after' }
    );

    if (!result) return res.status(404).json({ success: false, message: 'Canteen not found' });

    await logActivity({
      type: 'CANTEEN_REJECTED',
      description: `Canteen rejected: ${result.name}${reason ? ` — ${reason}` : ''}`,
      performedBy: { userId: req.user?._id, name: req.user?.name || 'Admin', role: 'Admin' },
    });

    res.json({ success: true, message: 'Canteen rejected', data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/admin/canteens/:id/visibility ────────────────────────────────────
const toggleVisibility = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const result = await getCollection('canteens').findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id) },
      { $set: { isActive: Boolean(isActive) } },
      { returnDocument: 'after' }
    );

    if (!result) return res.status(404).json({ success: false, message: 'Canteen not found' });

    res.json({ success: true, message: `Canteen ${isActive ? 'shown' : 'hidden'} successfully`, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getCanteenStats, getVisibilityStats, getCanteens, getApprovedCanteens, approveCanteen, rejectCanteen, toggleVisibility };