const Canteen = require('../../models/Canteen');
const Meal = require('../../models/Meal');
const Cart = require('../../models/Cart');
const Order = require('../../models/Order');
const Review = require('../../models/Review');
const User = require('../../Auth/models/User');

// ─── Canteen Browsing ────────────────────────────────────────────────────────

/**
 * GET /api/student/canteens
 * List all approved and active canteens with operatingHours
 */
const getCanteens = async (req, res) => {
  try {
    const canteens = await Canteen.find({ isApproved: true, isActive: true }).select(
      'name description location image operatingHours'
    );
    res.status(200).json({ success: true, data: canteens });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/student/canteens/search?q=&category=&maxPrice=
 * Search meals across all approved canteens
 */
const searchMeals = async (req, res) => {
  try {
    const { q, category, maxPrice } = req.query;

    // Get approved canteen IDs
    const approvedCanteens = await Canteen.find({ isApproved: true, isActive: true }).select('_id');
    const canteenIds = approvedCanteens.map((c) => c._id);

    const filter = { canteen: { $in: canteenIds } };

    if (q) {
      filter.name = { $regex: q, $options: 'i' };
    }
    if (category) {
      filter.category = category;
    }
    if (maxPrice) {
      filter.basePrice = { $lte: Number(maxPrice) };
    }

    const meals = await Meal.find(filter).populate('canteen', 'name');

    // Transform to include frontend-friendly fields
    const data = meals.map((meal) => {
      const obj = meal.toObject();
      obj.price = obj.basePrice || 0;
      obj.available = obj.isAvailable;
      return obj;
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/student/canteens/most-ordered/:studentId
 * Aggregate orders by canteen for a student, return top canteens
 */
const getMostOrderedCanteens = async (req, res) => {
  try {
    const { studentId } = req.params;
    const mongoose = require('mongoose');

    const results = await Order.aggregate([
      { $match: { student: new mongoose.Types.ObjectId(studentId) } },
      { $group: { _id: '$canteen', orderCount: { $sum: 1 }, totalSpent: { $sum: '$totalAmount' } } },
      { $sort: { orderCount: -1 } },
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
          _id: '$canteen._id',
          name: '$canteen.name',
          description: '$canteen.description',
          location: '$canteen.location',
          image: '$canteen.image',
          orderCount: 1,
          totalSpent: 1,
        },
      },
    ]);

    res.status(200).json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/student/canteens/:id
 * Get a single canteen by ID
 */
const getCanteenById = async (req, res) => {
  try {
    const canteen = await Canteen.findById(req.params.id);
    if (!canteen) {
      return res.status(404).json({ success: false, message: 'Canteen not found' });
    }
    res.status(200).json({ success: true, data: canteen });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/student/canteens/:canteenId/meals
 * Get meals for a canteen with optional filters
 */
const getCanteenMeals = async (req, res) => {
  try {
    const { canteenId } = req.params;
    const { category, maxPrice, available } = req.query;

    const filter = { canteen: canteenId };

    if (category) {
      filter.category = category;
    }
    if (maxPrice) {
      filter.basePrice = { $lte: Number(maxPrice) };
    }
    if (available !== undefined) {
      filter.isAvailable = available === 'true';
    }

    const meals = await Meal.find(filter);

    // Transform for frontend: price = basePrice, available = isAvailable
    const data = meals.map((meal) => {
      const obj = meal.toObject();
      obj.price = obj.basePrice || 0;
      obj.available = obj.isAvailable;
      return obj;
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Cart ────────────────────────────────────────────────────────────────────

/**
 * GET /api/student/cart/:studentId
 * Get cart for a student
 */
const getCart = async (req, res) => {
  try {
    const { studentId } = req.params;

    const cart = await Cart.findOne({ student: studentId })
      .populate('items.meal', 'image')
      .populate('canteen', '_id name');

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: { items: [], canteen: null },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        items: cart.items,
        canteen: cart.canteen ? { _id: cart.canteen._id, name: cart.canteen.name } : null,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/student/cart/add
 * Add item to cart
 */
const addToCart = async (req, res) => {
  try {
    const { studentId, mealId, quantity } = req.body;

    const meal = await Meal.findById(mealId);
    if (!meal) {
      return res.status(404).json({ success: false, message: 'Meal not found' });
    }

    let cart = await Cart.findOne({ student: studentId });

    if (cart && cart.canteen && cart.canteen.toString() !== meal.canteen.toString()) {
      // Different canteen — clear existing cart
      cart.items = [];
      cart.canteen = meal.canteen;
    }

    if (!cart) {
      cart = new Cart({
        student: studentId,
        canteen: meal.canteen,
        items: [],
      });
    }

    // Check if meal already in cart
    const existingIdx = cart.items.findIndex(
      (item) => item.meal.toString() === mealId
    );

    if (existingIdx > -1) {
      cart.items[existingIdx].quantity += quantity;
    } else {
      cart.items.push({
        meal: mealId,
        name: meal.name,
        price: meal.basePrice || 0,
        quantity,
      });
    }

    cart.canteen = meal.canteen;
    await cart.save();

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/student/cart/update
 * Update quantity of an item in cart
 */
const updateCart = async (req, res) => {
  try {
    const { studentId, mealId, quantity } = req.body;

    const cart = await Cart.findOne({ student: studentId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    const item = cart.items.find((i) => i.meal.toString() === mealId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    item.quantity = quantity;
    await cart.save();

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/student/cart/remove
 * Remove an item from cart
 */
const removeFromCart = async (req, res) => {
  try {
    const { studentId, mealId } = req.body;

    const cart = await Cart.findOne({ student: studentId });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    cart.items = cart.items.filter((i) => i.meal.toString() !== mealId);
    await cart.save();

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * DELETE /api/student/cart/clear/:studentId
 * Clear entire cart
 */
const clearCart = async (req, res) => {
  try {
    const { studentId } = req.params;
    await Cart.findOneAndDelete({ student: studentId });
    res.status(200).json({ success: true, data: null });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Orders ──────────────────────────────────────────────────────────────────

/**
 * POST /api/student/orders/place
 * Place an order and clear the cart
 */
const placeOrder = async (req, res) => {
  try {
    const { studentId, canteenId, items, totalAmount, paymentMethod } = req.body;

    const order = await Order.create({
      student: studentId,
      canteen: canteenId,
      items,
      totalAmount,
      paymentMethod,
    });

    // Clear cart after placing order
    await Cart.findOneAndDelete({ student: studentId });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/student/orders/:orderId
 * Get a single order
 */
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PATCH /api/student/orders/:orderId/cancel
 * Cancel an order
 */
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      { status: 'cancelled' },
      { new: true }
    );
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Payment ─────────────────────────────────────────────────────────────────

/**
 * GET /api/student/payment/:orderId
 * Get payment info for an order
 */
const getPaymentInfo = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        amount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        status: order.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/student/payment/process
 * Process a payment
 */
const processPayment = async (req, res) => {
  try {
    const { studentId, orderId, amount, paymentMethod } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.paymentMethod = paymentMethod;
    order.status = 'pending'; // stays pending until canteen accepts
    await order.save();

    res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        status: order.status,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Tracking ────────────────────────────────────────────────────────────────

/**
 * GET /api/student/tracking/history/:studentId
 * Get all orders for a student
 */
const getOrderHistory = async (req, res) => {
  try {
    const { studentId } = req.params;
    const orders = await Order.find({ student: studentId })
      .populate('canteen', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/student/tracking/status/:orderId
 * Get order status
 */
const getOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).populate('canteen');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/student/tracking/expenses/:studentId?year=
 * Aggregate completed orders by month for the given year
 */
const getExpenses = async (req, res) => {
  try {
    const { studentId } = req.params;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const mongoose = require('mongoose');

    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);

    const results = await Order.aggregate([
      {
        $match: {
          student: new mongoose.Types.ObjectId(studentId),
          status: 'completed',
          createdAt: { $gte: startDate, $lt: endDate },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          totalSpent: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 },
        },
      },
    ]);

    // Build array indexed 0-11 for each month
    const data = Array.from({ length: 12 }, (_, i) => {
      const found = results.find((r) => r._id === i + 1);
      return {
        totalSpent: found ? found.totalSpent : 0,
        orderCount: found ? found.orderCount : 0,
      };
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/student/tracking/rating
 * Submit a review/rating
 */
const submitRating = async (req, res) => {
  try {
    const { studentId, orderId, canteenId, rating, feedback, tags } = req.body;

    // Look up student info
    const student = await User.findById(studentId).select('name email');

    const review = await Review.create({
      student: studentId,
      canteen: canteenId,
      order: orderId,
      rating,
      comment: feedback || '',
      tags: tags || [],
      studentName: student ? student.name : '',
      studentEmail: student ? student.email : '',
    });

    res.status(201).json({ success: true, data: review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/student/tracking/ratings/:studentId
 * Get all reviews by a student
 */
const getStudentRatings = async (req, res) => {
  try {
    const { studentId } = req.params;
    const reviews = await Review.find({ student: studentId });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  // Canteen browsing
  getCanteens,
  searchMeals,
  getMostOrderedCanteens,
  getCanteenById,
  getCanteenMeals,
  // Cart
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  clearCart,
  // Orders
  placeOrder,
  getOrder,
  cancelOrder,
  // Payment
  getPaymentInfo,
  processPayment,
  // Tracking
  getOrderHistory,
  getOrderStatus,
  getExpenses,
  submitRating,
  getStudentRatings,
};
