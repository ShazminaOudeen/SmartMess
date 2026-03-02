const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { 
    type: String, 
    enum: ['Rice', 'Noodles', 'Drinks', 'Snacks', 'Desserts', 'Other'],
    default: 'Other'
  },
  image: { type: String },
  isAvailable: { type: Boolean, default: true },
  canteen: { type: mongoose.Schema.Types.ObjectId, ref: 'Canteen', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Meal', mealSchema);