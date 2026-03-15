const Area = require("../models/Area");
const Room = require("../models/Room");
const User = require("../models/User");
const { notifyUser } = require("../utils/notifyUser");

exports.getAll = async (req, res) => {
  try {
    const areas = await Area.find();
    res.json(areas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const area = await Area.findById(req.params.id);
    if (!area) return res.status(404).json({ message: "Area not found" });
    res.json(area);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const area = new Area(req.body);
    await area.save();
    res.status(201).json(area);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const area = await Area.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!area) return res.status(404).json({ message: "Area not found" });
    const rooms = await Room.find({ areaId: req.params.id }).select("_id");
    const roomIds = rooms.map((r) => r._id);
    const tenants = await User.find({ roomId: { $in: roomIds } }).select("_id");
    for (const t of tenants) await notifyUser(t._id, "Cập nhật khu vực", "Thông tin khu vực nhà trọ của bạn đã được cập nhật.", "general");
    res.json(area);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const areaId = req.params.id;
    const rooms = await Room.find({ areaId }).select("_id");
    const roomIds = rooms.map((r) => r._id);
    const tenants = await User.find({ roomId: { $in: roomIds } }).select("_id");
    const area = await Area.findByIdAndDelete(areaId);
    if (!area) return res.status(404).json({ message: "Area not found" });
    for (const t of tenants) await notifyUser(t._id, "Khu vực đã bị xóa", "Khu vực nhà trọ của bạn đã bị xóa khỏi hệ thống. Vui lòng liên hệ quản trị.", "system");
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
