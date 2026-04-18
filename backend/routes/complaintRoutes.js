const express = require('express');
const router = express.Router();
const Complaint = require('../Admin/models/Complaint');
const { logActivity } = require('../Admin/controllers/dashboardController');
const multer = require('multer');
const mongoose = require('mongoose');

const storage = multer.memoryStorage(); // ← memory, not disk
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/', upload.single('attachment'), async (req, res) => {
  try {
    const {
      submittedByName,
      submittedByEmail,
      submitterId,
      canteenId,       // ✅ received from frontend
      category,
      description,
    } = req.body;

    const complaint = new Complaint({
      submittedByName,
      submittedByEmail: submittedByEmail || '',
      submitterId:      submitterId  || undefined,
      // ✅ save canteenId so admin can count complaints per canteen
      canteenId:        canteenId && mongoose.Types.ObjectId.isValid(canteenId)
                          ? new mongoose.Types.ObjectId(canteenId)
                          : null,
      submitterType:    'user',
      category,
      description,
      attachment: req.file
                    ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
                    : undefined,
      status: 'pending',
    });

    await complaint.save();
    
await logActivity({
  type:        'COMPLAINT_SUBMITTED',
  description: `Student "${submittedByName || 'Unknown'}" submitted a complaint: ${category}`,
  performedBy: { userId: submitterId, name: submittedByName || 'Student', role: 'Student' },
  meta:        { category, canteenId },
});
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;