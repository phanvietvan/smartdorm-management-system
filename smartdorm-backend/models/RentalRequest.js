const mongoose = require("mongoose");

const rentalRequestSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "Room", required: true },
    message: { type: String },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    note: { type: String }, // Lý do từ chối hoặc ghi chú nội bộ
  },
  { timestamps: true }
);

module.exports = mongoose.model("RentalRequest", rentalRequestSchema);
