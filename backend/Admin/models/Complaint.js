const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    submittedByName:  { type: String, required: true },
    submittedByEmail: { type: String, required: true },
    submitterId:      { type: mongoose.Schema.Types.ObjectId },
    submitterType:    { type: String, enum: ['user', 'canteen'], default: 'user' },
    category:         { type: String, enum: ['Order Issue','Food Quality','Service','Payment','App Bug','Other'], required: true },
    description:      { type: String, required: true },
    attachment:       { type: String },
    status:           { type: String, enum: ['pending','inreview','resolved','closed'], default: 'pending' },
    adminNote:        { type: String },
    emailHistory:     [{ to: String, subject: String, sentAt: Date, sentBy: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Complaint', complaintSchema);