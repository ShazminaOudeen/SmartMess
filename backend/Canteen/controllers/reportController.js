//backend/Canteen/controllers/oreportController.js

const Complaint = require('../../Admin/models/Complaint');
const multer    = require('multer');
const path      = require('path');
const fs        = require('fs');
 
// Multer setup
const uploadDir = path.join(__dirname, '../../uploads/reports');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
 
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename:    (req, file, cb) => cb(null, `report-${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
 
// ── POST /api/canteen/report ──────────────────────────────────────────────────
const submitReport = async (req, res) => {
  try {
    const {
      submittedByName,
      submittedByEmail,
      submitterId,
      submitterType,
      canteenName,
      category,
      description,
    } = req.body;
  console.log('REQ BODY:', req.body);
    console.log('CANTEEN NAME RECEIVED:', canteenName);
    if (!category || !description?.trim()) {
      return res.status(400).json({ success: false, message: 'Category and description are required' });
    }
 
    const complaint = await Complaint.create({
       submittedByName:  submittedByName || 'Canteen User', 
      submittedByEmail: submittedByEmail || '',
      submitterId:      submitterId || req.user?._id,
      submitterType:    submitterType || 'canteen',
       canteenName:      canteenName || '',     
      category,
      description:      description.trim(),
      attachment:       req.file ? `/uploads/reports/${req.file.filename}` : '',
      status:           'pending',
    });
 
    res.status(201).json({ success: true, message: 'Report submitted successfully', data: complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
 
module.exports = { submitReport, upload };