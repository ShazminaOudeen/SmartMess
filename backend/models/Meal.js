const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  canteen: { type: mongoose.Schema.Types.ObjectId, ref: 'Canteen', required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, enum: ['Rice', 'Snacks', 'Desserts', 'Drinks', 'Breakfast', 'Other'], default: 'Other' },
  basePrice: { type: Number, required: true },
  image: { type: String, default: '' },
  isAvailable: { type: Boolean, default: true },
  sizes: {
    Small:  { enabled: { type: Boolean, default: false }, price: { type: Number, default: 0 } },
    Medium: { enabled: { type: Boolean, default: false }, price: { type: Number, default: 0 } },
    Large:  { enabled: { type: Boolean, default: false }, price: { type: Number, default: 0 } },
  },
}, { timestamps: true });

module.exports = mongoose.model('Meal', mealSchema);
