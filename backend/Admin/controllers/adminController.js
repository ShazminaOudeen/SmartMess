const User = require('../../Auth/models/User');
const Canteen = require('../../models/Canteen');
const Order = require('../../models/Order');
const Activity = require('../../models/Activity');
const Complaint = require('../../models/Complaint');
const Review = require('../../models/Review');
const sendEmail = require('../../utils/sendEmail');

// ===================== DASHBOARD =====================

// GET /api/admin/dashboard/stats
const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalApprovedCanteens, totalOrders] = await Promise.all([
      User.countDocuments(),
      Canteen.countDocuments({ isApproved: true }),
      Order.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: { totalUsers, totalApprovedCanteens, totalOrders },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/dashboard/orders-by-canteen
const getOrdersByCanteen = async (req, res) => {
  try {
    const data = await Order.aggregate([
      { $group: { _id: '$canteen', totalOrders: { $sum: 1 } } },
      {
        $lookup: {
          from: 'canteens',
          localField: '_id',
          foreignField: '_id',
          as: 'canteen',
        },
      },
      { $unwind: '$canteen' },
      {
        $project: {
          _id: 0,
          canteenName: '$canteen.name',
          totalOrders: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/dashboard/activity
const getActivity = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      Activity.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      Activity.countDocuments(),
    ]);

    res.status(200).json({ success: true, data, total });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/admin/dashboard/activity
const createActivity = async (req, res) => {
  try {
    const { type, description } = req.body;

    const activity = await Activity.create({
      type,
      description,
      performedBy: {
        name: req.user.name,
        role: req.user.role,
      },
    });

    res.status(201).json({ success: true, data: activity });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== USERS =====================

// GET /api/admin/users/stats
const getUserStats = async (req, res) => {
  try {
    const [total, active, blocked] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
    ]);

    res.status(200).json({
      success: true,
      data: { total, active, blocked },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('name email phone createdAt isActive');

    const data = users.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
      isBlocked: !user.isActive,
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/users/:id/block
const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({ success: true, message: 'User blocked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/users/:id/unblock
const unblockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = true;
    await user.save();

    res.status(200).json({ success: true, message: 'User unblocked successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== CANTEENS =====================

// GET /api/admin/canteens/stats
const getCanteenStats = async (req, res) => {
  try {
    const [total, approved, pending] = await Promise.all([
      Canteen.countDocuments(),
      Canteen.countDocuments({ isApproved: true }),
      Canteen.countDocuments({ isApproved: false, isRejected: false }),
    ]);

    res.status(200).json({
      success: true,
      data: { total, approved, pending },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/canteens
const getCanteens = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};

    if (status === 'pending') {
      filter = { isApproved: false, isRejected: false };
    } else if (status === 'approved') {
      filter = { isApproved: true };
    } else if (status === 'rejected') {
      filter = { isRejected: true };
    }
    // 'all' or no status => no filter

    const canteens = await Canteen.find(filter).populate('owner', 'name email phone');

    const data = canteens.map((c) => ({
      _id: c._id,
      name: c.name,
      ownerName: c.owner ? c.owner.name : '',
      ownerEmail: c.owner ? c.owner.email : '',
      phone: c.owner ? c.owner.phone : '',
      location: c.location,
      createdAt: c.createdAt,
      description: c.description,
      images: [c.image],
      isApproved: c.isApproved,
      isRejected: c.isRejected,
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/canteens/:id/approve
const approveCanteen = async (req, res) => {
  try {
    const canteen = await Canteen.findById(req.params.id);
    if (!canteen) {
      return res.status(404).json({ success: false, message: 'Canteen not found' });
    }

    canteen.isApproved = true;
    canteen.isRejected = false;
    await canteen.save();

    await Activity.create({
      type: 'canteen_approved',
      description: `Canteen "${canteen.name}" has been approved`,
      performedBy: {
        name: req.user.name,
        role: req.user.role,
      },
    });

    res.status(200).json({ success: true, message: 'Canteen approved successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/canteens/:id/reject
const rejectCanteen = async (req, res) => {
  try {
    const { reason } = req.body;

    const canteen = await Canteen.findById(req.params.id);
    if (!canteen) {
      return res.status(404).json({ success: false, message: 'Canteen not found' });
    }

    canteen.isRejected = true;
    canteen.isApproved = false;
    canteen.rejectionReason = reason || '';
    await canteen.save();

    await Activity.create({
      type: 'canteen_rejected',
      description: `Canteen "${canteen.name}" has been rejected. Reason: ${reason || 'N/A'}`,
      performedBy: {
        name: req.user.name,
        role: req.user.role,
      },
    });

    res.status(200).json({ success: true, message: 'Canteen rejected successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/canteens/visibility-stats
const getCanteenVisibilityStats = async (req, res) => {
  try {
    const [operating, visible, hidden] = await Promise.all([
      Canteen.countDocuments({ isApproved: true }),
      Canteen.countDocuments({ isApproved: true, isActive: true }),
      Canteen.countDocuments({ isApproved: true, isActive: false }),
    ]);

    res.status(200).json({
      success: true,
      data: { operating, visible, hidden },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/canteens/approved-list
const getApprovedCanteens = async (req, res) => {
  try {
    const canteens = await Canteen.find({ isApproved: true }).populate('owner', 'name');

    const data = await Promise.all(
      canteens.map(async (c) => {
        const [reviewAgg, totalOrders] = await Promise.all([
          Review.aggregate([
            { $match: { canteen: c._id } },
            { $group: { _id: null, averageRating: { $avg: '$rating' } } },
          ]),
          Order.countDocuments({ canteen: c._id }),
        ]);

        return {
          _id: c._id,
          name: c.name,
          ownerName: c.owner ? c.owner.name : '',
          isActive: c.isActive,
          averageRating: reviewAgg.length > 0 ? Math.round(reviewAgg[0].averageRating * 10) / 10 : 0,
          totalOrders,
          complaintCount: 0,
          images: [c.image],
        };
      })
    );

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/canteens/:id/visibility
const toggleCanteenVisibility = async (req, res) => {
  try {
    const { isActive } = req.body;

    const canteen = await Canteen.findById(req.params.id);
    if (!canteen) {
      return res.status(404).json({ success: false, message: 'Canteen not found' });
    }

    canteen.isActive = isActive;
    await canteen.save();

    res.status(200).json({
      success: true,
      message: `Canteen visibility ${isActive ? 'enabled' : 'disabled'} successfully`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== COMPLAINTS =====================

// GET /api/admin/complaints/stats
const getComplaintStats = async (req, res) => {
  try {
    const [total, pending, resolved] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'pending' }),
      Complaint.countDocuments({ status: 'resolved' }),
    ]);

    res.status(200).json({
      success: true,
      data: { total, pending, resolved },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/complaints
const getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/complaints/:id/status
const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.status = status;
    await complaint.save();

    res.status(200).json({ success: true, message: 'Complaint status updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/admin/complaints/send-email
const sendComplaintEmail = async (req, res) => {
  try {
    const { complaintId, to, subject, body } = req.body;

    await sendEmail({
      email: to,
      subject,
      message: body,
    });

    res.status(200).json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== ANALYTICS =====================

// GET /api/admin/analytics/canteens
const getCanteenAnalytics = async (req, res) => {
  try {
    const month = parseInt(req.query.month) || (new Date().getMonth() + 1);
    const year = parseInt(req.query.year) || new Date().getFullYear();

    const canteens = await Canteen.find({ isApproved: true });

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const canteenMetrics = await Promise.all(
      canteens.map(async (c) => {
        const [monthlyAgg, totalAgg] = await Promise.all([
          Order.aggregate([
            {
              $match: {
                canteen: c._id,
                createdAt: { $gte: startDate, $lt: endDate },
              },
            },
            {
              $group: {
                _id: null,
                monthlyOrders: { $sum: 1 },
                monthlyRevenue: { $sum: '$totalAmount' },
              },
            },
          ]),
          Order.aggregate([
            { $match: { canteen: c._id } },
            {
              $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: '$totalAmount' },
              },
            },
          ]),
        ]);

        return {
          canteenId: c._id,
          canteenName: c.name,
          monthlyOrders: monthlyAgg.length > 0 ? monthlyAgg[0].monthlyOrders : 0,
          monthlyRevenue: monthlyAgg.length > 0 ? monthlyAgg[0].monthlyRevenue : 0,
          totalOrders: totalAgg.length > 0 ? totalAgg[0].totalOrders : 0,
          totalRevenue: totalAgg.length > 0 ? totalAgg[0].totalRevenue : 0,
        };
      })
    );

    const totalRevenue = canteenMetrics.reduce((sum, c) => sum + c.totalRevenue, 0);
    const totalOrders = canteenMetrics.reduce((sum, c) => sum + c.totalOrders, 0);
    const topCanteen = canteenMetrics.reduce(
      (top, c) => (c.totalRevenue > (top ? top.totalRevenue : 0) ? c : top),
      null
    );

    const summary = {
      totalRevenue,
      totalOrders,
      topCanteen: topCanteen ? topCanteen.canteenName : null,
    };

    res.status(200).json({ success: true, data: canteenMetrics, summary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/admin/analytics/monthly-trend
const getMonthlyTrend = async (req, res) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const canteens = await Canteen.find({ isApproved: true });

    const data = [];

    for (let m = 0; m < 12; m++) {
      const startDate = new Date(year, m, 1);
      const endDate = new Date(year, m + 1, 1);

      const entry = { month: monthNames[m] };

      for (const c of canteens) {
        const count = await Order.countDocuments({
          canteen: c._id,
          createdAt: { $gte: startDate, $lt: endDate },
        });
        entry[c.name] = count;
      }

      data.push(entry);
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== CREATE ADMIN =====================

// POST /api/admin/create-admin
const createAdmin = async (req, res) => {
  try {
    const { name, email, password, phone, nic } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: 'admin',
      phone: phone || '',
      nic: nic || '',
    });

    res.status(201).json({ success: true, message: 'Admin created successfully', data: user });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===================== PROFILE =====================

// PUT /api/admin/profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, nic, profilePicture } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (name !== undefined) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (nic !== undefined) user.nic = nic;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        name: user.name,
        phone: user.phone,
        nic: user.nic,
        profilePicture: user.profilePicture,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/admin/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  // Dashboard
  getDashboardStats,
  getOrdersByCanteen,
  getActivity,
  createActivity,
  // Users
  getUserStats,
  getUsers,
  blockUser,
  unblockUser,
  // Canteens
  getCanteenStats,
  getCanteens,
  approveCanteen,
  rejectCanteen,
  getCanteenVisibilityStats,
  getApprovedCanteens,
  toggleCanteenVisibility,
  // Complaints
  getComplaintStats,
  getComplaints,
  updateComplaintStatus,
  sendComplaintEmail,
  // Analytics
  getCanteenAnalytics,
  getMonthlyTrend,
  // Create Admin
  createAdmin,
  // Profile
  updateProfile,
  changePassword,
};
