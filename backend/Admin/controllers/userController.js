const mongoose = require('mongoose');
const User = require('../../Auth/models/User');
const { logActivity } = require('./dashboardController');
const getCollection = (name) => mongoose.connection.db.collection(name);

const getUserStats = async (req, res) => {
  try {
    const [total, blocked] = await Promise.all([
      getCollection('users').countDocuments({ role: { $nin: ['admin', 'canteen'] } }),
      getCollection('users').countDocuments({ role: { $nin: ['admin', 'canteen'] }, isBlocked: true }),
    ]);
    res.json({ success: true, data: { total, blocked, active: total - blocked } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const getUsers = async (req, res) => {
  try {
    const users = await getCollection('users')
      .find({ role: { $nin: ['admin', 'canteen'] } }, { projection: { password: 0 } })
      .sort({ createdAt: -1 })
      .toArray();
    res.json({ success: true, data: users });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const blockUser = async (req, res) => {
  try {
    const result = await getCollection('users').findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(req.params.id) },
      { $set: { isBlocked: true } },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ success: false, message: 'User not found' });
    await logActivity({
      type: 'USER_BLOCKED',
      description: `User blocked: ${result.name}`,
      performedBy: { userId: req.user?._id, name: req.user?.name || 'Admin', role: 'Admin' },
    });
    res.json({ success: true, message: 'User blocked', data: result });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const unblockUser = async (req, res) => {
  try {
    const result = await getCollection('users').findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(req.params.id) },
      { $set: { isBlocked: false } },
      { returnDocument: 'after' }
    );
    if (!result) return res.status(404).json({ success: false, message: 'User not found' });
    await logActivity({
      type: 'USER_UNBLOCKED',
      description: `User unblocked: ${result.name}`,
      performedBy: { userId: req.user?._id, name: req.user?.name || 'Admin', role: 'Admin' },
    });
    res.json({ success: true, message: 'User unblocked', data: result });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

const createAdmin = async (req, res) => {
  try {
    const { name, email, password, phone, nic } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone:  phone  || '',
      nic:    nic    || '',
      role:   'admin',
    });

    await logActivity({
      type: 'ADMIN_CREATED',
      description: `New admin created: ${name}`,
      performedBy: { userId: req.user?._id, name: req.user?.name || 'Admin', role: 'Admin' },
    });

    res.status(201).json({ success: true, message: 'Admin created successfully', data: user });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getUserStats, getUsers, blockUser, unblockUser, createAdmin };