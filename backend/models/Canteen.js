const mongoose = require('mongoose');

const canteenSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  location: { type: String, default: '' },
  image: { type: String, default: '' },
  licenseNumber: { type: String, default: '' },
  isApproved: { type: Boolean, default: false },
  isRejected: { type: Boolean, default: false },
  rejectionReason: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  operatingHours: [{
    day: { type: String, required: true },
    isOpen: { type: Boolean, default: true },
    openTime: { type: String, default: '08:00' },
    closeTime: { type: String, default: '20:00' },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Canteen', canteenSchema);
