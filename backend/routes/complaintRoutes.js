const express = require('express');
const router = express.Router();
const Complaint = require('../Admin/models/Complaint');
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
    res.status(201).json({ success: true, message: 'Complaint submitted successfully!', data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;