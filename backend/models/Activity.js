const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  type: { type: String, required: true },
  description: { type: String, required: true },
  performedBy: {
    name: { type: String, default: 'System' },
    role: { type: String, default: 'system' },
  },
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
