const mongoose = require('mongoose');
const Canteen = require('../../models/Canteen');
const Meal = require('../../models/Meal');
const Order = require('../../models/Order');
const Review = require('../../models/Review');
const User = require('../../Auth/models/User');

// ─── Helper ────────────────────────────────────────────────────────────────────

const getCanteenForOwner = async (userId) => {
  const canteen = await Canteen.findOne({ owner: userId });
  if (!canteen) throw { status: 404, message: 'Canteen not found for this user' };
  return canteen;
};

// ─── Dashboard ─────────────────────────────────────────────────────────────────

exports.getDashboard = async (req, res) => {
  try {
    const canteen = await getCanteenForOwner(req.user._id);
    const canteenId = canteen._id;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const [todayOrders, pendingOrders, totalMeals, todayRevenueAgg, orderStatusBreakdown, popularMeals] =
      await Promise.all([
        Order.countDocuments({ canteen: canteenId, createdAt: { $gte: todayStart, $lte: todayEnd } }),
        Order.countDocuments({ canteen: canteenId, status: 'pending' }),
        Meal.countDocuments({ canteen: canteenId }),
        Order.aggregate([
          { $match: { canteen: canteenId, status: 'completed', createdAt: { $gte: todayStart, $lte: todayEnd } } },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } },
        ]),
        Order.aggregate([
          { $match: { canteen: canteenId } },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        Order.aggregate([
          { $match: { canteen: canteenId } },
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.name',
              totalOrders: { $sum: '$items.quantity' },
              totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            },
          },
          { $project: { _id: 0, name: '$_id', totalOrders: 1, totalRevenue: 1 } },
          { $sort: { totalOrders: -1 } },
        ]),
      ]);

    const todayRevenue = todayRevenueAgg.length > 0 ? todayRevenueAgg[0].total : 0;

    res.json({
      success: true,
      data: { todayOrders, pendingOrders, totalMeals, todayRevenue, orderStatusBreakdown, popularMeals },
    });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ─── Profile ───────────────────────────────────────────────────────────────────

exports.getProfile = async (req, res) => {
  try {
    const canteen = await getCanteenForOwner(req.user._id);
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      data: {
        ownerName: user.name,
        canteenName: canteen.name,
        email: user.email,
        phone: user.phone,
        location: canteen.location,
        description: canteen.description,
        image: canteen.image,
        isApproved: canteen.isApproved,
        isActive: canteen.isActive,
      },
    });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const canteen = await getCanteenForOwner(req.user._id);
    const user = await User.findById(req.user._id);
    const { ownerName, canteenName, email, phone, location, description } = req.body;

    // Update user fields
    if (ownerName) user.name = ownerName;
    if (phone) user.phone = phone;
    await user.save();

    // Update canteen fields
    if (canteenName) canteen.name = canteenName;
    if (description !== undefined) canteen.description = description;
    if (location) canteen.location = location;
    if (req.file) canteen.image = `/uploads/${req.file.filename}`;
    await canteen.save();

    const updatedProfile = {
      ownerName: user.name,
      canteenName: canteen.name,
      email: user.email,
      phone: user.phone,
      location: canteen.location,
      description: canteen.description,
      image: canteen.image,
      isApproved: canteen.isApproved,
      isActive: canteen.isActive,
    };

    res.json({ success: true, data: updatedProfile });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ─── Meals ─────────────────────────────────────────────────────────────────────

exports.getMeals = async (req, res) => {
  try {
    const canteen = await getCanteenForOwner(req.user._id);
    const meals = await Meal.find({ canteen: canteen._id });
    res.json({ success: true, data: meals });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Server error' });
  }
};

exports.createMeal = async (req, res) => {
  try {
    const canteen = await getCanteenForOwner(req.user._id);
    const { name, description, category, basePrice, isAvailable, sizes } = req.body;

    const mealData = {
      canteen: canteen._id,
      name,
      description,
      category,
      basePrice: Number(basePrice),
      isAvailable: isAvailable === 'true' || isAvailable === true,
    };

    if (sizes) {
      mealData.sizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
    }

    if (req.file) {
      mealData.image = `/uploads/${req.file.filename}`;
    }

    const meal = await Meal.create(mealData);
    res.status(201).json({ success: true, message: 'Meal created successfully', data: meal });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Server error' });
  }
};

exports.updateMeal = async (req, res) => {
  try {
    const canteen = await getCanteenForOwner(req.user._id);
    const meal = await Meal.findOne({ _id: req.params.id, canteen: canteen._id });

    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }

    const { name, description, category, basePrice, isAvailable, sizes } = req.body;

    if (name) meal.name = name;
    if (description !== undefined) meal.description = description;
    if (category) meal.category = category;
    if (basePrice !== undefined) meal.basePrice = Number(basePrice);
    if (isAvailable !== undefined) meal.isAvailable = isAvailable === 'true' || isAvailable === true;
    if (sizes) {
      meal.sizes = typeof sizes === 'string' ? JSON.parse(sizes) : sizes;
    }
    if (req.file) {
      meal.image = `/uploads/${req.file.filename}`;
    }

    await meal.save();
    res.json({ success: true, message: 'Meal updated successfully', data: meal });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Server error' });
  }
};

exports.deleteMeal = async (req, res) => {
  try {
    const canteen = await getCanteenForOwner(req.user._id);
    const meal = await Meal.findOneAndDelete({ _id: req.params.id, canteen: canteen._id });

    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }

    res.json({ success: true, message: 'Meal deleted successfully' });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Server error' });
  }
};

exports.toggleMealAvailability = async (req, res) => {
  try {
    const canteen = await getCanteenForOwner(req.user._id);
    const meal = await Meal.findOne({ _id: req.params.id, canteen: canteen._id });

    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }

    meal.isAvailable = req.body.isAvailable;
    await meal.save();

    res.json({ success: true, message: `Meal ${meal.isAvailable ? 'enabled' : 'disabled'} successfully` });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ─── Operating Hours ───────────────────────────────────────────────────────────

exports.getOperatingHours = async (req, res) => {
  try {
    const canteen = await getCanteenForOwner(req.user._id);
    res.json({ success: true, data: canteen.operatingHours });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Server error' });
  }
};

exports.updateOperatingHours = async (req, res) => {
  try {
    const canteen = await getCanteenForOwner(req.user._id);
    canteen.operatingHours = req.body.hours;
    await canteen.save();

    res.json({ success: true, message: 'Operating hours updated successfully' });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ─── Orders ────────────────────────────────────────────────────────────────────

exports.getOrders = async (req, res) => {
  try {
    const canteen = await getCanteenForOwner(req.user._id);
    const orders = await Order.find({ canteen: canteen._id })
      .populate('student', 'name email phone')
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map((order) => ({
      _id: order._id,
      studentName: order.student ? order.student.name : 'Unknown',
      studentEmail: order.student ? order.student.email : '',
      studentPhone: order.student ? order.student.phone : '',
      items: order.items,
      totalAmount: order.totalAmount,
      status: order.status,
      createdAt: order.createdAt,
    }));

    res.json({ success: true, data: formattedOrders });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Server error' });
  }
};

exports.acceptOrder = async (req, res) => {
  try {
    const canteen = await getCanteenForOwner(req.user._id);
    const order = await Order.findOne({ _id: req.params.id, canteen: canteen._id });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = 'accepted';
    await order.save();

    res.json({ success: true, message: 'Order accepted successfully' });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Server error' });
  }
};

exports.rejectOrder = async (req, res) => {
  try {
    const canteen = await getCanteenForOwner(req.user._id);
    const order = await Order.findOne({ _id: req.params.id, canteen: canteen._id });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({ success: true, message: 'Order rejected successfully' });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Server error' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const canteen = await getCanteenForOwner(req.user._id);
    const order = await Order.findOne({ _id: req.params.id, canteen: canteen._id });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.status = req.body.status;
    await order.save();

    res.json({ success: true, message: 'Order status updated successfully' });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ─── Revenue ───────────────────────────────────────────────────────────────────

exports.getRevenue = async (req, res) => {
  try {
    const canteen = await getCanteenForOwner(req.user._id);
    const canteenId = canteen._id;

    const year = parseInt(req.query.year) || new Date().getFullYear();
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;

    // Month date range
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

    // Year date range
    const yearStart = new Date(year, 0, 1);
    const yearEnd = new Date(year, 11, 31, 23, 59, 59, 999);

    const [summaryAgg, dailyAgg, monthlyAgg, popularMeals] = await Promise.all([
      // Summary for the given month
      Order.aggregate([
        { $match: { canteen: canteenId, status: 'completed', createdAt: { $gte: monthStart, $lte: monthEnd } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            totalOrders: { $sum: 1 },
            avgOrderValue: { $avg: '$totalAmount' },
          },
        },
      ]),
      // Daily breakdown for the month
      Order.aggregate([
        { $match: { canteen: canteenId, status: 'completed', createdAt: { $gte: monthStart, $lte: monthEnd } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            orders: { $sum: 1 },
            revenue: { $sum: '$totalAmount' },
          },
        },
        { $project: { _id: 0, date: '$_id', orders: 1, revenue: 1 } },
        { $sort: { date: 1 } },
      ]),
      // Monthly breakdown for the year
      Order.aggregate([
        { $match: { canteen: canteenId, status: 'completed', createdAt: { $gte: yearStart, $lte: yearEnd } } },
        {
          $group: {
            _id: { $month: '$createdAt' },
            revenue: { $sum: '$totalAmount' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      // Popular meals from completed orders
      Order.aggregate([
        { $match: { canteen: canteenId, status: 'completed' } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.name',
            totalOrders: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          },
        },
        { $project: { _id: 0, name: '$_id', totalOrders: 1, totalRevenue: 1 } },
        { $sort: { totalOrders: -1 } },
      ]),
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthly = monthlyAgg.map((m) => ({
      month: monthNames[m._id - 1],
      revenue: m.revenue,
      orders: m.orders,
    }));

    const summary = summaryAgg.length > 0
      ? { totalRevenue: summaryAgg[0].totalRevenue, totalOrders: summaryAgg[0].totalOrders, avgOrderValue: summaryAgg[0].avgOrderValue }
      : { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0 };

    res.json({
      success: true,
      data: { summary, daily: dailyAgg, monthly, popularMeals },
    });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ─── Reviews ───────────────────────────────────────────────────────────────────

exports.getReviews = async (req, res) => {
  try {
    const canteen = await getCanteenForOwner(req.user._id);
    const reviews = await Review.find({ canteen: canteen._id }).sort({ createdAt: -1 });

    const formattedReviews = reviews.map((r) => ({
      _id: r._id,
      studentName: r.studentName,
      studentEmail: r.studentEmail,
      rating: r.rating,
      comment: r.comment,
      mealName: r.mealName,
      reply: r.reply,
      repliedAt: r.repliedAt,
      createdAt: r.createdAt,
    }));

    res.json({ success: true, data: formattedReviews });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Server error' });
  }
};

exports.replyToReview = async (req, res) => {
  try {
    const canteen = await getCanteenForOwner(req.user._id);
    const review = await Review.findOne({ _id: req.params.id, canteen: canteen._id });

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    review.reply = req.body.reply;
    review.repliedAt = new Date();
    await review.save();

    res.json({ success: true, message: 'Reply added successfully' });
  } catch (error) {
    res.status(error.status || 500).json({ success: false, message: error.message || 'Server error' });
  }
};
