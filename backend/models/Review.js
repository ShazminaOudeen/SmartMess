const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  canteen: { type: mongoose.Schema.Types.ObjectId, ref: 'Canteen', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  tags: [{ type: String }],
  studentName: { type: String, default: '' },
  studentEmail: { type: String, default: '' },
  mealName: { type: String, default: '' },
  reply: { type: String, default: '' },
  repliedAt: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
