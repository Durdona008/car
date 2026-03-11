const mongoose = require('mongoose');

const carSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    year: { type: Number, required: true },
    price: { type: Number, required: true },
    color: { type: String, trim: true },
    description: { type: String, trim: true },
    image: { type: String, default: null },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
    likes: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Car', carSchema);