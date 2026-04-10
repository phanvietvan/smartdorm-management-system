const mongoose = require("mongoose");

/**
 * CheckinLog Model
 * Lưu lịch sử mỗi lần quét mặt mở cửa (thành công hoặc thất bại)
 */
const checkinLogSchema = new mongoose.Schema(
  {
    // Liên kết với FaceData nếu nhận diện thành công
    faceDataId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FaceData",
      default: null,
    },
    // Tên cư dân (lưu trực tiếp để tra cứu nhanh)
    name: {
      type: String,
      default: "Unknown",
    },
    // Mã sinh viên
    studentId: {
      type: String,
      default: null,
    },
    // Trạng thái: granted / denied
    status: {
      type: String,
      enum: ["granted", "denied"],
      required: true,
    },
    // Khoảng cách Euclidean khi so sánh (debug)
    distance: {
      type: Number,
      default: null,
    },
    // ID thiết bị cửa gửi yêu cầu
    deviceId: {
      type: String,
      default: "door-main",
    },
    // Thời gian check-in
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CheckinLog", checkinLogSchema);
