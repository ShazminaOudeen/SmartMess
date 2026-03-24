const express = require('express');
const router = express.Router();
const Complaint = require('../Admin/models/Complaint');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/complaints');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `complaint_${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/', upload.single('attachment'), async (req, res) => {
  try {
    const { submittedByName, submittedByEmail, submitterId, category, description } = req.body;
    const complaint = new Complaint({
      submittedByName,
      submittedByEmail: submittedByEmail || '',
      submitterId: submitterId || undefined,
      submitterType: 'user',
      category,
      description,
      attachment: req.file ? `/uploads/complaints/${req.file.filename}` : undefined,
      status: 'pending',
    });
    await complaint.save();
    res.status(201).json({ success: true, message: 'Complaint submitted successfully!', data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
