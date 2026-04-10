const mongoose = require("mongoose");

/**
 * FaceData Model
 * Lưu dữ liệu khuôn mặt (face descriptor) của cư dân
 * Mỗi studentId chỉ có 1 khuôn mặt duy nhất
 */
const faceDataSchema = new mongoose.Schema(
  {
    // Tên cư dân
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Mã số sinh viên / cư dân (unique)
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    // Mảng 128 số thực - face descriptor từ face-api.js
    faceDescriptor: {
      type: [Number],
      required: true,
      validate: {
        validator: function (arr) {
          return arr.length === 128;
        },
        message: "Face descriptor phải có đúng 128 giá trị",
      },
    },
    // Liên kết với User nếu có (optional)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FaceData", faceDataSchema);
