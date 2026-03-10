const Room = require("../models/Room");
const { hasPermission } = require("../config/roles");
const { PERMISSIONS } = require("../config/roles");

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
    res.json(room);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ message: "Room not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
