const Visitor = require("../models/Visitor");
const { ROLES } = require("../config/roles");
const { notifyUser } = require("../utils/notifyUser");

exports.getAll = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === ROLES.TENANT) filter.tenantId = req.user._id;
    const { roomId, checkedOut } = req.query;
    if (roomId) filter.roomId = roomId;
    if (checkedOut === "false") filter.checkOutAt = null;
    const visitors = await Visitor.find(filter)
      .populate("roomId", "name floor")
      .populate("tenantId", "fullName")
      .sort({ checkInAt: -1 });
    res.json(visitors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id)
      .populate("roomId", "name floor")
      .populate("tenantId", "fullName phone");
    if (!visitor) return res.status(404).json({ message: "Visitor not found" });
    if (req.user.role === ROLES.TENANT && visitor.tenantId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Không có quyền xem" });
    }
    res.json(visitor);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, phone, roomId, tenantId, purpose, idCard, plateNumber } = req.body;
    if (!name || !roomId || !tenantId) return res.status(400).json({ message: "Thiếu name, roomId hoặc tenantId" });
    const visitor = new Visitor({
      name,
      phone,
      roomId,
      tenantId,
      purpose,
      idCard,
      plateNumber,
      status: "waiting", // Mặc định chờ duyệt
      registeredBy: req.user._id,
    });
    await visitor.save();
    const tid = visitor.tenantId.toString();
    if (tid) await notifyUser(tid, "Khách đang chờ", `Khách "${name}" đang chờ tại cổng. Vui lòng phản hồi cho phép hay không.`, "general");
    res.status(201).json(visitor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.respond = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'allowed' | 'denied'
    const visitor = await Visitor.findById(id);
    if (!visitor) return res.status(404).json({ message: "Không tìm thấy khách" });
    if (visitor.tenantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Chỉ người thuê mới được phản hồi" });
    }
    visitor.status = status;
    await visitor.save();
    res.json({ success: true, message: `Đã ${status === 'allowed' ? 'cho phép' : 'từ chối'}`, data: visitor });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) return res.status(404).json({ message: "Visitor not found" });
    visitor.checkOutAt = new Date();
    visitor.status = "checked_out";
    await visitor.save();
    const tid = visitor.tenantId.toString();
    if (tid) await notifyUser(tid, "Khách đã ra", `Khách "${visitor.name}" đã rời khỏi khu vực.`, "general");
    res.json(visitor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

