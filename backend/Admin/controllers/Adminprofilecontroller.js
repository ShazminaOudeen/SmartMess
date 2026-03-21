const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Safe logActivity import — won't crash if path is wrong
let logActivity;
try {
  ({ logActivity } = require('./dashboardController'));
} catch (err) {
  console.warn('⚠️  Could not import logActivity:', err.message);
  logActivity = async () => {}; // no-op fallback so app doesn't crash
}

const UserModel = () => mongoose.model('User');

// ── GET /api/admin/profile ────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const admin = await UserModel().findById(req.user._id).select('-password');
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });
    res.json({ success: true, data: admin });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/admin/profile ────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { name, phone, nic, profilePicture } = req.body;

    const updateData = {};
    if (name)           updateData.name           = name.trim();
    if (phone)          updateData.phone          = phone.trim();
    if (nic)            updateData.nic            = nic.trim();
    if (profilePicture) updateData.profilePicture = profilePicture;

    const updated = await UserModel().findByIdAndUpdate(
      adminId,
      { $set: updateData },
      { new: true, select: '-password' }
    );

    if (!updated) return res.status(404).json({ success: false, message: 'Admin not found' });

    try {
      await logActivity({
        type: 'USER_REGISTERED',
        description: `Admin profile updated: ${updated.name}`,
        performedBy: { userId: adminId, name: updated.name, role: 'Admin' },
      });
      console.log('✅ logActivity: profile updated logged');
    } catch (logErr) {
      console.error('❌ logActivity failed:', logErr.message);
    }

    res.json({ success: true, message: 'Profile updated successfully', data: updated });
  } catch (err) {
    console.error('updateProfile error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/admin/change-password ────────────────────────────────────────────
const changePassword = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: 'Both passwords are required' });
    if (newPassword.length < 8)
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });

    const admin = await UserModel().findById(adminId).select('+password');
    if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });

    const isMatch = await bcrypt.compare(currentPassword, admin.password);
    if (!isMatch)
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    const hashed = await bcrypt.hash(newPassword, 12);
    await UserModel().findByIdAndUpdate(adminId, { password: hashed });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error('changePassword error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/admin/create-admin ─────────────────────────────────────────────
const createAdmin = async (req, res) => {
  try {
    const { name, email, password, nic, phone } = req.body;

    if (!name || !email || !password || !nic || !phone)
      return res.status(400).json({ success: false, message: 'All fields are required' });

    const existing = await UserModel().findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });

    const hashed = await bcrypt.hash(password, 12);
    const newAdmin = await UserModel().create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashed,
      nic: nic.trim(),
      phone: phone.trim(),
      role: 'admin',
    });

    console.log('✅ New admin created:', newAdmin.name);

    try {
      await logActivity({
        type: 'USER_REGISTERED',
        description: `New admin added: ${newAdmin.name}`,
        performedBy: { userId: req.user._id, name: req.user.name, role: 'Admin' },
      });
      console.log('✅ logActivity: new admin logged');
    } catch (logErr) {
      console.error('❌ logActivity failed:', logErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: { _id: newAdmin._id, name: newAdmin.name, email: newAdmin.email },
    });
  } catch (err) {
    console.error('createAdmin error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getProfile, updateProfile, changePassword, createAdmin };