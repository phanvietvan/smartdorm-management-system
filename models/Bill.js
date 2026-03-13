const mongoose = require("mongoose");

const billSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    month: { type: Number, required: true }, // 1-12
    year: { type: Number, required: true },
    rentAmount: { type: Number, required: true, default: 0 },
    prevWater: { type: Number, default: 0 },
    currWater: { type: Number, default: 0 },
    waterAmount: { type: Number, default: 0 },
    prevElec: { type: Number, default: 0 },
    currElec: { type: Number, default: 0 },
    electricityAmount: { type: Number, default: 0 },
    otherAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "overdue"],
      default: "pending",
    },
    dueDate: { type: Date },
    note: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Bill", billSchema);
