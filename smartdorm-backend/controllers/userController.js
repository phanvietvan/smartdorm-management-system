const User = require("../models/User");
require("../models/Room");
require("../models/Area");
const { ROLES } = require("../config/roles");
const { formatUser } = require("./authController");
const { notifyUser } = require("../utils/notifyUser");

exports.getAll = async (req, res) => {
  try {
    const { role, isActive, status } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (status) filter.status = status;
    const users = await User.find(filter).select("-password").populate("roomId", "name").populate("managedAreaId", "name");
    res.json(users.map(formatUser));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password").populate("roomId", "name floor").populate("managedAreaId", "name address");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(formatUser(user));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { email, password, fullName, phone, role, status } = req.body;
    if (!email || !password || !fullName || !role) {
      return res.status(400).json({ message: "Thiếu email, password, fullName hoặc role" });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email đã tồn tại" });
    const user = new User({
      email,
      password,
      fullName,
      phone,
      role,
      status: status || "approved",
      isActive: true,
    });
    await user.save();
    await notifyUser(user._id, "Tài khoản đã được tạo", "Tài khoản của bạn đã được quản trị viên tạo. Bạn có thể đăng nhập khi được cấp quyền.", "system");
    res.status(201).json(formatUser(user));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const oldUser = await User.findById(req.params.id).select("status role");
    const { password, ...rest } = req.body;
    const updateData = { ...rest };
    
    // Tự động chuyển guest thành tenant khi được duyệt qua update
    if (updateData.status === "approved" && oldUser.role === ROLES.GUEST && !updateData.role) {
      updateData.role = ROLES.TENANT;
    }

    if (password) updateData.password = password;
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    // Thông báo khi role hoặc status thay đổi (liên quan người thuê)
    if (oldUser && (oldUser.status !== user.status || oldUser.role !== user.role)) {
      let title = "Cập nhật tài khoản";
      let content = "Thông tin tài khoản của bạn đã được quản trị viên cập nhật.";
      if (user.status === "approved") {
        title = "Đã được duyệt";
        content = "Tài khoản của bạn đã được quản trị viên duyệt. Bạn có thể sử dụng đầy đủ chức năng.";
      } else if (user.status === "rejected") {
        title = "Đã bị từ chối";
        content = "Tài khoản của bạn chưa được duyệt. Vui lòng liên hệ quản trị viên nếu cần hỗ trợ.";
      } else if (user.role === ROLES.TENANT && oldUser.role !== ROLES.TENANT) {
        title = "Đã được gán phòng";
        content = "Bạn đã được chuyển thành người thuê và có thể được gán phòng. Kiểm tra thông tin trong tài khoản.";
      } else if (user.role !== ROLES.TENANT && oldUser.role === ROLES.TENANT) {
        title = "Đã trả phòng";
        content = "Vai trò và phòng của bạn đã được cập nhật. Vui lòng liên hệ quản trị viên nếu có thắc mắc.";
      }
      await notifyUser(user._id, title, content, "system");
    }
    res.json(formatUser(user));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.assignTenant = async (req, res) => {
  try {
    const { userId, roomId } = req.body;
    if (!userId || !roomId) return res.status(400).json({ message: "Thiếu userId hoặc roomId" });
    const userDoc = await User.findById(userId);
    if (!userDoc) return res.status(404).json({ message: "User not found" });

    const isApproved = !userDoc.status || userDoc.status === "approved";
    if (!isApproved) {
      return res.status(400).json({ message: "Chỉ có thể gán phòng cho user đã được duyệt." });
    }

    const Room = require("../models/Room");
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ message: "Không tìm thấy phòng" });
    if (room.status === "occupied") {
      return res.status(400).json({ message: "Phòng này đã có người ở" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { roomId, role: ROLES.TENANT },
      { new: true }
    ).select("-password");
    
    await Room.findByIdAndUpdate(roomId, { status: "occupied" });
    await notifyUser(
      userId,
      "Đã được gán phòng",
      "Bạn đã được gán vào phòng. Vui lòng kiểm tra thông tin phòng trong tài khoản.",
      "contract"
    );
    res.json(formatUser(user));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.unassignTenant = async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.roomId) return res.status(400).json({ message: "User này chưa có phòng" });

    const roomId = user.roomId;
    
    // Clear user room and reset role to guest
    user.roomId = null;
    user.role = ROLES.GUEST;
    await user.save();

    // Reset room status to available
    const Room = require("../models/Room");
    await Room.findByIdAndUpdate(roomId, { status: "available" });

    await notifyUser(
      userId,
      "Đã trả phòng",
      "Phòng của bạn đã được thu hồi. Vui lòng liên hệ quản trị viên nếu có thắc mắc.",
      "system"
    );
    res.json({ success: true, message: "Đã trả phòng và chuyển user về guest thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approve = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "approved", isActive: true, role: ROLES.TENANT },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    await notifyUser(
      user._id,
      "Đã được duyệt",
      "Tài khoản của bạn đã được quản trị viên duyệt. Bạn có thể sử dụng đầy đủ chức năng.",
      "system"
    );
    res.json(formatUser(user));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.reject = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "rejected", isActive: false },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    await notifyUser(
      user._id,
      "Đã bị từ chối",
      "Tài khoản của bạn chưa được duyệt. Vui lòng liên hệ quản trị viên nếu cần hỗ trợ.",
      "system"
    );
    res.json(formatUser(user));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { fullName, phone, avatarUrl, idCardNumber, address } = req.body;
    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (phone) updateData.phone = phone;
    if (avatarUrl) updateData.avatarUrl = avatarUrl;
    if (idCardNumber) updateData.idCardNumber = idCardNumber;
    if (address) updateData.address = address;

    const user = await User.findByIdAndUpdate(req.user._id, updateData, { new: true }).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    
    res.json({ success: true, message: "Cập nhật hồ sơ thành công", data: formatUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRoommates = async (req, res) => {
  try {
    if (!req.user || !req.user.roomId) {
      return res.status(200).json([]); // Không có phòng thì không có bạn cùng phòng
    }

    const roomId = typeof req.user.roomId === 'object' ? req.user.roomId._id : req.user.roomId;
    
    const roommates = await User.find({ 
      roomId, 
      _id: { $ne: req.user._id } // Loại trừ chính mình
    }).select("fullName email avatarUrl status phone");
    
    res.json(roommates);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
