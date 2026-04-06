const RentalRequest = require("../models/RentalRequest");
const User = require("../models/User");
const Room = require("../models/Room");
const { ROLES } = require("../config/roles");
const { notifyUser, notifyByRole } = require("../utils/notificationService");
const crypto = require("crypto");

exports.getAll = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const requests = await RentalRequest.find(filter).populate("roomId", "name");
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const request = await RentalRequest.findById(req.params.id).populate("roomId", "name");
    if (!request) return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { fullName, phone, email, roomId, message } = req.body;
    if (!fullName || !phone || !email || !roomId) {
      return res.status(400).json({ message: "Vui lòng nhập đầy đủ Name, Phone, Email, RoomId" });
    }
    const request = new RentalRequest({
      fullName,
      phone,
      email,
      roomId,
      message,
      status: "pending",
    });
    await request.save();
    // Thông báo cho admin
    await notifyByRole(ROLES.ADMIN, { 
      title: "Yêu cầu thuê mới", 
      message: `Yêu cầu thuê phòng mới từ ${fullName}`, 
      type: "rental", 
      link: `/app/rental-requests/${request._id}` 
    });
    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.process = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body; // status: 'approved' | 'rejected'

    const request = await RentalRequest.findById(id);
    if (!request) return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
    if (request.status !== "pending") {
      return res.status(400).json({ message: "Yêu cầu này đã được xử lý" });
    }

    if (status === "approved") {
      // 1. Kiểm tra email đã tồn tại trong User chưa (ép về lowercase để khớp)
      let user = await User.findOne({ email: request.email.toLowerCase().trim() });
      if (user) {
         // Nếu đã có user (GUEST), cập nhật role thành TENANT và gán roomId
         user.role = ROLES.TENANT;
         user.roomId = request.roomId;
         user.status = "approved";
         user.isActive = true;
         if (request.phone) user.phone = request.phone;
         await user.save();
      } else {
        // 2. Tạo User mới
        const randomPassword = crypto.randomBytes(4).toString("hex"); // 8 chars
        user = new User({
          email: request.email.toLowerCase().trim(),
          fullName: request.fullName,
          phone: request.phone,
          password: randomPassword,
          role: ROLES.TENANT,
          status: "approved",
          isActive: true,
          roomId: request.roomId         
        });
        await user.save();
        
        // Log mật khẩu ra console (trong thực tế sẽ gửi mail)
        console.log(`[RentalRequest] Approved. User created: ${request.email} / Password: ${randomPassword}`);
      }

      // 3. Cập nhật phòng
      await Room.findByIdAndUpdate(request.roomId, { status: "occupied" });

      request.status = "approved";
      request.note = note || "Đã duyệt";
      await request.save();

      // 4. Thông báo cho user
      await notifyUser(
        user._id, 
        "Đã được duyệt thuê phòng", 
        "Yêu cầu thuê phòng của bạn đã được quản trị viên duyệt.", 
        "rental",
        "/app/dashboard",
        { userId: req.user._id, fullName: req.user.fullName, avatarUrl: req.user.avatarUrl }
      );

      return res.json({ message: "Đã duyệt và tạo tài khoản thành công", data: request });
    } else if (status === "rejected") {
      request.status = "rejected";
      request.note = note || "Hệ thống từ chối yêu cầu";
      await request.save();
      
      // Gửi mail cho khách (nếu có hệ thống mail)
      console.log(`[RentalRequest] Rejected: ${request.email}. Reason: ${note}`);

      return res.json({ message: "Đã từ chối yêu cầu", data: request });
    } else {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
