const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., 'Điện', 'Nước', 'Rác', 'Wifi'
  unitPrice: { type: Number, required: true },
  unit: { type: String, required: true }, // e.g., 'kWh', 'm3', 'tháng', 'người'
  description: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Service', serviceSchema);
