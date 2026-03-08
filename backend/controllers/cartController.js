const Cart = require('../models/Cart');
const Meal = require('../models/Meal');

// Get student's cart
const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ student: req.params.studentId })
      .populate('items.meal')
      .populate('canteen');
    if (!cart) return res.status(200).json({ success: true, data: null });
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { studentId, mealId, quantity } = req.body;
    const meal = await Meal.findById(mealId);
    if (!meal) return res.status(404).json({ success: false, message: 'Meal not found' });
    if (meal.isAvailable === false) return res.status(400).json({ success: false, message: 'Meal not available' });

    // Use basePrice since Aathika's meal model uses basePrice
    const mealPrice = meal.basePrice || meal.price || 0;

    let cart = await Cart.findOne({ student: studentId });

    // If cart exists but for different canteen, clear it
    if (cart && cart.canteen.toString() !== meal.canteen.toString()) {
      cart.items = [];
      cart.canteen = meal.canteen;
      cart.totalAmount = 0;
    }

    if (!cart) {
      cart = new Cart({ student: studentId, canteen: meal.canteen, items: [], totalAmount: 0 });
    }

    const existingItem = cart.items.find(item => item.meal.toString() === mealId);
    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      cart.items.push({ meal: mealId, quantity: quantity || 1, price: mealPrice });
    }

    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    await cart.save();
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update item quantity
const updateCartItem = async (req, res) => {
  try {
    const { studentId, mealId, quantity } = req.body;
    const cart = await Cart.findOne({ student: studentId });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    const item = cart.items.find(item => item.meal.toString() === mealId);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found in cart' });
    if (quantity <= 0) {
      cart.items = cart.items.filter(item => item.meal.toString() !== mealId);
    } else {
      item.quantity = quantity;
    }
    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    await cart.save();
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { studentId, mealId } = req.body;
    const cart = await Cart.findOne({ student: studentId });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found' });
    cart.items = cart.items.filter(item => item.meal.toString() !== mealId);
    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    await cart.save();
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ student: req.params.studentId });
    res.status(200).json({ success: true, message: 'Cart cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
