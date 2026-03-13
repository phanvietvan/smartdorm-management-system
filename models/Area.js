const mongoose = require('mongoose');

const areaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: String,
  description: String,
  totalFloors: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Area', areaSchema);
