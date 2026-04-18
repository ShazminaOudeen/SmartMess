//backend/Canteen/controllers/oreportController.js

const Complaint = require('../../Admin/models/Complaint');
const multer    = require('multer');

// Multer setup — memory storage, saves as Base64 to MongoDB
const storage = multer.memoryStorage();
const upload  = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
 
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
      attachment: req.file ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}` : '',
      status:           'pending',
    });
 
    res.status(201).json({ success: true, message: 'Report submitted successfully', data: complaint });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
 
module.exports = { submitReport, upload };