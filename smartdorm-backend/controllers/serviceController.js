const Service = require("../models/Service");
const User = require("../models/User");
const { notifyUser, notifyByRole } = require("../utils/notificationService");

const serviceController = {
  // GET /services
  getAll: async (req, res) => {
    try {
      const services = await Service.find();
      res.status(200).json({
        success: true,
        data: services
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi khi lấy danh sách dịch vụ", error: error.message });
    }
  },

  // POST /services
  create: async (req, res) => {
    try {
      const { name, unitPrice, unit, description } = req.body;
      if (!name || unitPrice === undefined || !unit) {
        return res.status(400).json({ success: false, message: "Thiếu thông tin bắt buộc" });
      }

      const newService = new Service({ name, unitPrice, unit, description });
      await newService.save();

      res.status(201).json({
        success: true,
        message: "Tạo cấu hình dịch vụ thành công",
        data: newService
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi hệ thống", error: error.message });
    }
  },

  // PUT /services/:id
  update: async (req, res) => {
    try {
      const { name, unitPrice, unit, description } = req.body;
      const updatedService = await Service.findByIdAndUpdate(
        req.params.id,
        { name, unitPrice, unit, description, updatedAt: Date.now() },
        { new: true }
      );

      if (!updatedService) {
        return res.status(404).json({ success: false, message: "Không tìm thấy cấu hình dịch vụ" });
      }

      const tenants = await User.find({ roomId: { $ne: null } }).select("_id");
      const serviceName = (name || updatedService.name) || "Dịch vụ";
      for (const t of tenants) {
        await notifyUser(t._id, "Cập nhật dịch vụ", `Cấu hình "${serviceName}" đã được quản trị cập nhật. Có thể ảnh hưởng đến hóa đơn.`, "bill");
      }
      res.status(200).json({
        success: true,
        message: "Cập nhật cấu hình dịch vụ thành công",
        data: updatedService
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi hệ thống", error: error.message });
    }
  }
};

module.exports = serviceController;
