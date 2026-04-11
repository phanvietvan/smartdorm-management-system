const express = require("express");
const router = express.Router();
const FaceData = require("../models/FaceData");
const CheckinLog = require("../models/CheckinLog");

/**
 * POST /face/register
 * Đăng ký khuôn mặt mới cho cư dân
 * Body: { name, studentId, faceDescriptor }
 */
router.post("/register", async (req, res) => {
  try {
    const { name, studentId, email, room, block, phoneNumber, faceDescriptor, role } = req.body;

    // Validate input
    if (!name || !studentId || !faceDescriptor) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin: name, studentId, faceDescriptor là bắt buộc",
      });
    }

    // Kiểm tra descriptor hợp lệ (128 chiều)
    if (!Array.isArray(faceDescriptor) || faceDescriptor.length !== 128) {
      return res.status(400).json({
        success: false,
        message: "Face descriptor không hợp lệ (cần đúng 128 giá trị)",
      });
    }

    // Kiểm tra studentId đã tồn tại chưa (Nếu không phải admin thì mới chặn trùng)
    if (role !== "admin") {
      const existing = await FaceData.findOne({ studentId });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Mã cư dân ${studentId} đã được đăng ký khuôn mặt.`,
        });
      }
    }

    // Lưu dữ liệu khuôn mặt mới
    const faceData = new FaceData({ name, studentId, email, room, block, phoneNumber, faceDescriptor });
    await faceData.save();

    console.log(`✅ Face registered: ${name} (${studentId})`);

    res.status(201).json({
      success: true,
      message: "Đăng ký khuôn mặt thành công!",
      student: { name, studentId },
    });
  } catch (error) {
    console.error("❌ Face register error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi đăng ký khuôn mặt",
    });
  }
});

/**
 * POST /face/recognize
 * Nhận diện khuôn mặt - so sánh với tất cả cư dân trong DB
 * Body: { faceDescriptor, deviceId? }
 */
router.post("/recognize", async (req, res) => {
  try {
    const { faceDescriptor, deviceId } = req.body;

    // Validate
    if (!faceDescriptor || !Array.isArray(faceDescriptor) || faceDescriptor.length !== 128) {
      return res.status(400).json({
        success: false,
        message: "Face descriptor không hợp lệ",
      });
    }

    // Lấy tất cả khuôn mặt đã đăng ký
    const allFaces = await FaceData.find({});

    if (allFaces.length === 0) {
      // Log denied
      await CheckinLog.create({
        status: "denied",
        deviceId: deviceId || "door-main",
      });
      return res.json({
        success: false,
        message: "Chưa có khuôn mặt nào được đăng ký trong hệ thống",
      });
    }

    // Tính Euclidean distance với từng khuôn mặt
    let bestMatch = null;
    let bestDistance = Infinity;

    for (const face of allFaces) {
      const dist = euclideanDistance(faceDescriptor, face.faceDescriptor);
      if (dist < bestDistance) {
        bestDistance = dist;
        bestMatch = face;
      }
    }

    // Ngưỡng khớp: < 0.6
    const THRESHOLD = 0.6;

    if (bestDistance < THRESHOLD && bestMatch) {
      // ✅ MATCH - Access Granted
      console.log(`🚪 Access GRANTED: ${bestMatch.name} (dist: ${bestDistance.toFixed(4)})`);

      // Ghi log check-in thành công
      await CheckinLog.create({
        faceDataId: bestMatch._id,
        name: bestMatch.name,
        studentId: bestMatch.studentId,
        status: "granted",
        distance: bestDistance,
        deviceId: deviceId || "door-main",
      });

      return res.json({ 
        success: true, 
        student: {
          name: bestMatch.name,
          studentId: bestMatch.studentId,
          email: bestMatch.email || "N/A",
          room: bestMatch.room || "N/A",
          block: bestMatch.block || "N/A",
          phoneNumber: bestMatch.phoneNumber || "N/A",
          registeredAt: bestMatch.createdAt,
          role: "Cư dân"
        },
        distance: bestDistance 
      });
    } else {
      // ❌ NO MATCH - Access Denied
      console.log(`🚫 Access DENIED (best dist: ${bestDistance.toFixed(4)})`);

      // Ghi log thất bại
      await CheckinLog.create({
        status: "denied",
        distance: bestDistance,
        deviceId: deviceId || "door-main",
      });

      return res.json({
        success: false,
        message: "Không nhận diện được. Truy cập bị từ chối.",
        distance: bestDistance,
      });
    }
  } catch (error) {
    console.error("❌ Face recognize error:", error.message);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi nhận diện khuôn mặt",
    });
  }
});

/**
 * GET /face/logs
 * Lấy lịch sử check-in (mới nhất trước)
 */
router.get("/logs", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const logs = await CheckinLog.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

/**
 * GET /face/students
 * Lấy danh sách cư dân đã đăng ký khuôn mặt
 */
router.get("/students", async (req, res) => {
  try {
    const students = await FaceData.find({})
      .select("name studentId email createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server" });
  }
});

/**
 * Hàm tính khoảng cách Euclidean giữa 2 vector
 * distance = sqrt( sum( (a[i] - b[i])^2 ) )
 */
function euclideanDistance(arr1, arr2) {
  if (arr1.length !== arr2.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    const diff = arr1[i] - arr2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

module.exports = router;
