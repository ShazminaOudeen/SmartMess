const mongoose = require('mongoose');

const canteenSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  operatingHours: { type: String },
  location: { type: String },
  isApproved: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Canteen', canteenSchema);