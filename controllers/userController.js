const User = require("../models/User");
const { ROLES } = require("../config/roles");

exports.getAll = async (req, res) => {
  try {
    const { role, isActive, status } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (status) filter.status = status;
    const users = await User.find(filter).select("-password").populate("roomId", "name").populate("managedAreaId", "name");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password").populate("roomId", "name floor").populate("managedAreaId", "name address");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
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
    res.status(201).json({ id: user._id, email: user.email, fullName: user.fullName, role: user.role });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    const updateData = { ...rest };
    if (password) updateData.password = password;
    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
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

    if (userDoc.status !== "approved") {
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
    res.json(user);
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

    res.json({ success: true, message: "Đã trả phòng và chuyển user về guest thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approve = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "approved", isActive: true },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
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
    res.json(user);
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
    
    res.json({ success: true, message: "Cập nhật hồ sơ thành công", data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
