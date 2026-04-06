const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  emoji: { type: String, required: true }
}, { _id: false });

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  type: { 
    type: String, 
    enum: ['bill', 'maintenance', 'payment', 'visitor', 'message', 'rental', 'broadcast', 'system'], 
    default: 'system' 
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  link: { type: String }, // Deep link to the resource (e.g., /app/bills/123)
  isRead: { type: Boolean, default: false, index: true },
  actor: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fullName: { type: String },
    avatarUrl: { type: String }
  },
  reactions: [reactionSchema],
  metadata: { type: mongoose.Schema.Types.Mixed }, // Any additional dynamic data
  createdAt: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('Notification', notificationSchema);
