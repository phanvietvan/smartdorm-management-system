const Room = require("../models/Room");
const User = require("../models/User");
require("../models/Area"); // Đảm bảo model Area đã được register cho population
const { hasPermission } = require("../config/roles");
const { PERMISSIONS } = require("../config/roles");
const { notifyUser } = require("../utils/notifyUser");

exports.getAvailable = async (req, res) => {
  try {
    const rooms = await Room.find({ status: "available" }).populate("areaId", "name address");
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const canViewAll = req.user && hasPermission(req.user.role, PERMISSIONS.ROOMS_VIEW);
    const canViewAvailable = !req.user || hasPermission(req.user.role, PERMISSIONS.ROOMS_VIEW) || hasPermission(req.user.role, PERMISSIONS.ROOMS_VIEW_AVAILABLE);
    if (!canViewAll && !canViewAvailable) {
      return res.status(403).json({ message: "Bạn không có quyền xem phòng" });
    }
    const query = canViewAll ? {} : { status: "available" };
    const rooms = await Room.find(query).populate("areaId", "name address");
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id).populate("areaId", "name address");
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyRoom = async (req, res) => {
  try {
    console.log("getMyRoom debug - User:", {
      id: req.user?._id,
      roomId: req.user?.roomId,
      roomIdType: typeof req.user?.roomId
    });
    
    if (!req.user || !req.user.roomId) {
      return res.status(404).json({ message: "Bạn chưa được gán phòng nào." });
    }
    
    // Check if roomId is an object (already populated)
    const roomId = typeof req.user.roomId === 'object' && req.user.roomId._id 
      ? req.user.roomId._id 
      : req.user.roomId;

    const room = await Room.findById(roomId).populate("areaId", "name address");
    
    if (!room) {
      return res.status(404).json({ message: "Không tìm thấy thông tin phòng" });
    }
    
    res.json(room);
  } catch (err) {
    console.error("getMyRoom ERROR:", err);
    res.status(500).json({ message: "Internal Server Error: " + err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const room = new Room(req.body);
    const newRoom = await room.save();
    res.status(201).json(newRoom);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) return res.status(404).json({ message: "Room not found" });
    const tenant = await User.findOne({ roomId: req.params.id }).select("_id");
    if (tenant) await notifyUser(tenant._id, "Cập nhật phòng", "Thông tin phòng của bạn đã được quản trị cập nhật. Vui lòng kiểm tra.", "general");
    res.json(room);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const roomId = req.params.id;
    const tenant = await User.findOne({ roomId }).select("_id");
    const room = await Room.findByIdAndDelete(roomId);
    if (!room) return res.status(404).json({ message: "Room not found" });
    if (tenant) await notifyUser(tenant._id, "Phòng đã bị xóa", "Phòng của bạn đã bị xóa khỏi hệ thống. Vui lòng liên hệ quản trị viên.", "system");
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
