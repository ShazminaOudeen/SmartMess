//backend/Canteen/controllers/canteenProfileController.js
const mongoose  = require('mongoose');
const multer    = require('multer');
const path      = require('path');
const fs        = require('fs');
 
const getCollection = (name) => mongoose.connection.db.collection(name);
 
// ── Hardcoded canteen ID for testing — replace with auth middleware later ─────
const TEMP_CANTEEN_ID = '69aac230df75a9778e441db5';
 
// ── Multer setup for canteen images ──────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/canteens');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    // Timestamp appended so each upload gets a unique URL (cache busting)
    cb(null, `canteen_${TEMP_CANTEEN_ID}_${Date.now()}${ext}`);
  },
});
 
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only JPG, PNG, WEBP allowed'));
};
 
const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });
 
// ── GET /api/canteen/profile ──────────────────────────────────────────────────
const getCanteenProfile = async (req, res) => {
  try {
    const canteen = await getCollection('canteens').findOne(
      { _id: new mongoose.Types.ObjectId(TEMP_CANTEEN_ID) }
    );
    if (!canteen) return res.status(404).json({ success: false, message: 'Canteen not found' });
    res.json({ success: true, data: canteen });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
 
// ── PUT /api/canteen/profile ──────────────────────────────────────────────────
const updateCanteenProfile = async (req, res) => {
  try {
    const { ownerName, canteenName, email, phone, location, description } = req.body;
 
    if (!ownerName || !canteenName) {
      return res.status(400).json({ success: false, message: 'Owner name and canteen name are required' });
    }
 
    const updateData = {
      ownerName:   ownerName.trim(),
      canteenName: canteenName.trim(),
      email:       email?.trim()       || '',
      phone:       phone?.trim()       || '',
      location:    location?.trim()    || '',
      description: description?.trim() || '',
      updatedAt:   new Date(),
    };
 
    if (req.file) {
      // Delete the old image file from disk to avoid accumulating unused files
      const existing = await getCollection('canteens').findOne(
        { _id: new mongoose.Types.ObjectId(TEMP_CANTEEN_ID) },
        { projection: { image: 1 } }
      );
      if (existing?.image) {
        const oldPath = path.join(__dirname, '../../', existing.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
 
      updateData.image = `/uploads/canteens/${req.file.filename}`;
    }
 
    const result = await getCollection('canteens').findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(TEMP_CANTEEN_ID) },
      { $set: updateData },
      { returnDocument: 'after' }
    );
 
    if (!result) return res.status(404).json({ success: false, message: 'Canteen not found' });
 
    res.json({ success: true, message: 'Profile updated', data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
 
// ── GET /api/canteen/hours ────────────────────────────────────────────────────
const getOperatingHours = async (req, res) => {
  try {
    const canteen = await getCollection('canteens').findOne(
      { _id: new mongoose.Types.ObjectId(TEMP_CANTEEN_ID) },
      { projection: { operatingHours: 1 } }
    );
    res.json({ success: true, data: canteen?.operatingHours || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
 
// ── PUT /api/canteen/hours ────────────────────────────────────────────────────
const updateOperatingHours = async (req, res) => {
  try {
    const { hours } = req.body;
 
    if (!Array.isArray(hours) || hours.length === 0) {
      return res.status(400).json({ success: false, message: 'Hours array is required' });
    }
 
    const validDays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    for (const h of hours) {
      if (!validDays.includes(h.day)) {
        return res.status(400).json({ success: false, message: `Invalid day: ${h.day}` });
      }
    }
 
    await getCollection('canteens').updateOne(
      { _id: new mongoose.Types.ObjectId(TEMP_CANTEEN_ID) },
      { $set: { operatingHours: hours, updatedAt: new Date() } }
    );
 
    res.json({ success: true, message: 'Operating hours updated', data: hours });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
 
module.exports = { upload, getCanteenProfile, updateCanteenProfile, getOperatingHours, updateOperatingHours };
 