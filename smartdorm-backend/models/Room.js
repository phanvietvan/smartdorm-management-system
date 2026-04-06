const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  areaId: { type: mongoose.Schema.Types.ObjectId, ref: 'Area', required: true },
  floor: { type: Number, required: true },
  capacity: { type: Number, default: 1 },
  price: { type: Number, required: true },
  contactPhone: { type: String },
  status: { type: String, enum: ['available', 'occupied', 'maintenance'], default: 'available' },
  amenities: String,
  equipments: [{
    name: { type: String, required: true },
    status: { type: String, enum: ['good', 'damaged', 'maintenance'], default: 'good' },
    quantity: { type: Number, default: 1 }
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Room', roomSchema);
