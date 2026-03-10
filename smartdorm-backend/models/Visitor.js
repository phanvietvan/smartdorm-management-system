const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    checkInAt: { type: Date, default: Date.now },
    checkOutAt: { type: Date },
    purpose: { type: String },
    idCard: { type: String },
    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Visitor", visitorSchema);
