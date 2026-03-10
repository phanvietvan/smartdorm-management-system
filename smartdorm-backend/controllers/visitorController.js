const Visitor = require("../models/Visitor");
const { ROLES } = require("../config/roles");

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
    const { name, phone, roomId, tenantId, purpose, idCard } = req.body;
    if (!name || !roomId || !tenantId) return res.status(400).json({ message: "Thiếu name, roomId hoặc tenantId" });
    const visitor = new Visitor({
      name,
      phone,
      roomId,
      tenantId,
      purpose,
      idCard,
      registeredBy: req.user._id,
    });
    await visitor.save();
    const populated = await Visitor.findById(visitor._id).populate("roomId", "name").populate("tenantId", "fullName");
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.checkOut = async (req, res) => {
  try {
    const visitor = await Visitor.findByIdAndUpdate(
      req.params.id,
      { checkOutAt: new Date() },
      { new: true }
    );
    if (!visitor) return res.status(404).json({ message: "Visitor not found" });
    res.json(visitor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
