const MaintenanceRequest = require("../models/MaintenanceRequest");
const { ROLES } = require("../config/roles");

const filterByUser = (req) => {
  const filter = {};
  if (req.user.role === ROLES.TENANT) filter.tenantId = req.user._id;
  if (req.user.role === ROLES.MAINTENANCE_STAFF) filter.assignedTo = req.user._id;
  return filter;
};

exports.getAll = async (req, res) => {
  try {
    const filter = filterByUser(req);
    const { status, roomId } = req.query;
    if (status) filter.status = status;
    if (roomId) filter.roomId = roomId;
    const requests = await MaintenanceRequest.find(filter)
      .populate("roomId", "name floor")
      .populate("tenantId", "fullName phone")
      .populate("assignedTo", "fullName")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id)
      .populate("roomId", "name floor")
      .populate("tenantId", "fullName phone email")
      .populate("assignedTo", "fullName");
    if (!request) return res.status(404).json({ message: "Maintenance request not found" });
    if (req.user.role === ROLES.TENANT && request.tenantId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Không có quyền xem" });
    }
    res.json(request);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { roomId, title, description } = req.body;
    if (!roomId || !title) return res.status(400).json({ message: "Thiếu roomId hoặc title" });
    if (req.user.role === ROLES.TENANT && req.user.roomId?.toString() !== roomId) {
      return res.status(403).json({ message: "Chỉ có thể báo sửa phòng của mình" });
    }
    const maintenance = new MaintenanceRequest({
      roomId,
      tenantId: req.user._id,
      title,
      description,
    });
    await maintenance.save();
    const populated = await MaintenanceRequest.findById(maintenance._id).populate("roomId", "name").populate("tenantId", "fullName");
    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const maintenance = await MaintenanceRequest.findById(req.params.id);
    if (!maintenance) return res.status(404).json({ message: "Maintenance request not found" });
    const { status, images, note } = req.body;
    if (status) maintenance.status = status;
    if (images && Array.isArray(images)) maintenance.images = images;
    if (note !== undefined) maintenance.note = note;
    if (status === "completed") {
      maintenance.completedAt = new Date();
    }
    if (req.user.role === ROLES.MAINTENANCE_STAFF) {
      maintenance.assignedTo = req.user._id;
    }
    await maintenance.save();
    res.json(maintenance);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.assign = async (req, res) => {
  try {
    const maintenance = await MaintenanceRequest.findByIdAndUpdate(
      req.params.id,
      { assignedTo: req.body.staffId, status: "in_progress" },
      { new: true }
    ).populate("assignedTo", "fullName");
    if (!maintenance) return res.status(404).json({ message: "Maintenance request not found" });
    res.json(maintenance);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.confirmDone = async (req, res) => {
  try {
    const maintenance = await MaintenanceRequest.findById(req.params.id);
    if (!maintenance) return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
    
    // Check if the current user is the owner
    if (maintenance.tenantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Chỉ người thuê mới được xác nhận" });
    }

    const { rating } = req.body;
    maintenance.status = 'closed';
    if (rating) maintenance.rating = rating;
    
    await maintenance.save();
    res.json({ success: true, message: "Đã xác nhận hoàn thành", data: maintenance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
