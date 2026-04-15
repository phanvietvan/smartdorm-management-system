const express = require("express");
const router = express.Router();
const FaceData = require("../models/FaceData");
const CheckinLog = require("../models/CheckinLog");

/**
 * POST /face/register
 * Đăng ký hoặc cập nhật khuôn mặt cho cư dân
 */
router.post("/register", async (req, res) => {
  try {
    const { name, studentId, email, room, block, phoneNumber, faceDescriptor, role } = req.body;

    if (!name || !studentId || !faceDescriptor) {
      return res.status(400).json({ success: false, message: "Thiếu thông tin bắt buộc" });
    }

    // TÌM KIẾM CƯ DÂN CŨ ĐỂ CẬP NHẬT HOẶC TẠO MỚI (Upsert)
    const existing = await FaceData.findOne({ studentId });
    
    if (existing) {
      // Nếu đã có, tiến hành CẬP NHẬT (Update) thay vì báo lỗi 409
      existing.name = name;
      existing.email = email;
      existing.room = room;
      existing.block = block;
      existing.phoneNumber = phoneNumber;
      existing.faceDescriptor = faceDescriptor;
      await existing.save();
      return res.json({ success: true, message: `Đã cập nhật FaceID cho cư dân ${name}` });
    }

    // Nếu chưa có, tạo mới
    const faceData = new FaceData({ name, studentId, email, room, block, phoneNumber, faceDescriptor });
    await faceData.save();

    res.status(201).json({ success: true, message: "Đăng ký thành công!", student: { name, studentId } });
  } catch (error) {
    console.error("❌ REGISTER ERROR:", error);
    res.status(500).json({ success: false, message: "Lỗi hệ thống", error: error.message });
  }
});

/**
 * POST /face/recognize
 * Nhận diện khuôn mặt
 */
router.post("/recognize", async (req, res) => {
  try {
    const { faceDescriptor, deviceId } = req.body;

    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      return res.status(400).json({ success: false, message: "Descriptor không hợp lệ" });
    }

    const allFaces = await FaceData.find({});
    if (allFaces.length === 0) {
      return res.json({ success: false, message: "Chưa có dữ liệu khuôn mặt" });
    }

    let bestMatch = null;
    let minDistance = 100;

    // Duyệt tìm khuôn mặt khớp nhất
    for (const face of allFaces) {
      const dist = euclideanDistance(faceDescriptor, face.faceDescriptor);
      if (dist < minDistance) {
        minDistance = dist;
        bestMatch = face;
      }
    }

    // NGƯỠNG NHẬN DIỆN (Nới lỏng xuống 0.45 để dễ quét hơn)
    const THRESHOLD = 0.45;

    if (minDistance < THRESHOLD && bestMatch) {
      console.log(`✅ MATCH: ${bestMatch.name} (Dist: ${minDistance.toFixed(4)})`);

      await CheckinLog.create({
        faceDataId: bestMatch._id,
        name: bestMatch.name,
        studentId: bestMatch.studentId,
        status: "granted",
        distance: minDistance,
        deviceId: deviceId || "gate-lux"
      });

      // TRẢ VỀ BIẾN 'user' ĐỂ KHỚP VỚI FRONTEND
      return res.json({
        success: true,
        user: {
          name: bestMatch.name,
          studentId: bestMatch.studentId,
          email: bestMatch.email || "N/A",
          room: bestMatch.room || "N/A",
          block: bestMatch.block || "N/A",
          phoneNumber: bestMatch.phoneNumber || "N/A",
          role: "Cư dân"
        },
        distance: minDistance
      });
    } else {
      console.log(`❌ NO MATCH (Best Dist: ${minDistance.toFixed(4)})`);
      return res.json({ success: false, message: "Không nhận diện được", distance: minDistance });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
});

router.get("/logs", async (req, res) => {
  try {
    const logs = await CheckinLog.find({}).sort({ createdAt: -1 }).limit(50).lean();
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

router.get("/students", async (req, res) => {
  try {
    const students = await FaceData.find({}).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: students });
  } catch (error) {
    res.status(500).json({ success: false });
  }
});

// Hàm tính khoảng cách tin cậy
function euclideanDistance(v1, v2) {
  let sum = 0;
  for (let i = 0; i < v1.length; i++) {
    sum += Math.pow(v1[i] - v2[i], 2);
  }
  return Math.sqrt(sum);
}

module.exports = router;
