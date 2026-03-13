const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  billId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill', required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['cash', 'bank_transfer', 'momo', 'other'], default: 'cash' },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  paidAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
