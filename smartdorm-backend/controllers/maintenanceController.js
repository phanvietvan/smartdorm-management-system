const MaintenanceRequest = require("../models/MaintenanceRequest");
const User = require("../models/User");
const { ROLES } = require("../config/roles");
const { notifyUser } = require("../utils/notifyUser");

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
    if (status) {
      if (status.includes(",")) {
        filter.status = { $in: status.split(",") };
      } else {
        filter.status = status;
      }
    }
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
    const { roomId, title, description, category, urgency } = req.body;
    if (!roomId || !title) return res.status(400).json({ message: "Thiếu roomId hoặc title" });
    const userRoomId = req.user.roomId?._id ? req.user.roomId._id.toString() : req.user.roomId?.toString();
    if (req.user.role === ROLES.TENANT && userRoomId !== roomId) {
      return res.status(403).json({ message: "Chỉ có thể báo sửa phòng của mình" });
    }
    const maintenance = new MaintenanceRequest({
      roomId,
      tenantId: req.user._id,
      title,
      description,
      category,
      urgency,
    });
    await maintenance.save();
    const populated = await MaintenanceRequest.findById(maintenance._id).populate("roomId", "name").populate("tenantId", "fullName");
    const tenantName = req.user.fullName || "Người thuê";
    const contentForAdmin = `${tenantName} báo cáo sự cố: "${title}"${description ? `. ${description}` : ""}`;
    const actor = { userId: req.user._id, fullName: req.user.fullName, avatarUrl: req.user.avatarUrl };
    const link = `/app/maintenance/${maintenance._id}`;
    
    // Gửi cho admin + manager
    await notifyByRole(ROLES.ADMIN, { title: "Báo cáo sự cố mới", message: contentForAdmin, type: "maintenance", link, actor });
    await notifyByRole(ROLES.MANAGER, { title: "Báo cáo sự cố mới", message: contentForAdmin, type: "maintenance", link, actor });
    // Gửi cho landlord
    await notifyByRole(ROLES.LANDLORD, { title: "Báo cáo sự cố mới", message: contentForAdmin, type: "maintenance", link, actor });
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
    const tenantId = maintenance.tenantId && maintenance.tenantId.toString ? maintenance.tenantId : maintenance.tenantId;
    if (tenantId) {
      const actor = { userId: req.user._id, fullName: req.user.fullName, avatarUrl: req.user.avatarUrl };
      const link = `/app/maintenance/${maintenance._id}`;
      if (maintenance.status === "in_progress") {
        await notifyUser(tenantId, "Đang xử lý sửa chữa", `Yêu cầu "${maintenance.title}" đang được nhân viên xử lý.`, "maintenance", link, actor);
      } else if (maintenance.status === "completed" || maintenance.status === "closed") {
        await notifyUser(tenantId, "Hoàn thành sửa chữa", `Yêu cầu "${maintenance.title}" đã hoàn thành.`, "maintenance", link, actor);
      }
    }
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
    const tenantId = maintenance.tenantId && maintenance.tenantId.toString ? maintenance.tenantId : maintenance.tenantId;
    if (tenantId) {
      const actor = { userId: req.user._id, fullName: req.user.fullName, avatarUrl: req.user.avatarUrl };
      await notifyUser(tenantId, "Đã phân công sửa chữa", `Yêu cầu "${maintenance.title}" đã được phân công.`, "maintenance", `/app/maintenance/${maintenance._id}`, actor);
    }
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

exports.reopen = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const maintenance = await MaintenanceRequest.findById(id);
    if (!maintenance) return res.status(404).json({ message: "Không tìm thấy yêu cầu" });
    if (maintenance.tenantId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Chỉ người thuê mới được thực hiện thao tác này" });
    }
    maintenance.status = 'reopened';
    maintenance.note = note || "Khách không hài lòng, yêu cầu xử lý lại";
    maintenance.assignedTo = null; // Cần phân công lại
    await maintenance.save();
    res.json({ success: true, message: "Đã mở lại yêu cầu", data: maintenance });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

