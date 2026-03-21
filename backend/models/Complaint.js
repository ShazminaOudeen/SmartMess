const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['Order Issue', 'Food Quality', 'Service', 'Payment', 'App Bug', 'Other'],
    default: 'Other',
  },
  description: { type: String, required: true },
  status: {
    type: String,
    enum: ['pending', 'inreview', 'resolved', 'closed'],
    default: 'pending',
  },
  submitterType: { type: String, enum: ['user', 'canteen'], default: 'user' },
  submittedByName: { type: String, default: '' },
  submittedByEmail: { type: String, default: '' },
  submittedById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userEmail: { type: String, default: '' },
  canteenEmail: { type: String, default: '' },
  adminNote: { type: String, default: '' },
  attachment: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Complaint', complaintSchema);
