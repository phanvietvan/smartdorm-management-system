const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const User = require("../models/User");

const notificationController = {
  // GET /notifications – cho mọi user (admin, tenant, landlord, ...): chỉ trả về thông báo có userId/recipient = user đang đăng nhập
  getUserNotifications: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const isRead = req.query.isRead;
      const userId = req.user._id instanceof mongoose.Types.ObjectId ? req.user._id : new mongoose.Types.ObjectId(req.user._id);
      const filter = { userId };
      if (isRead !== undefined && isRead !== '') {
        filter.isRead = isRead === 'true';
      }
      const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .limit(limit);

      res.status(200).json({
        success: true,
        data: notifications
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi hệ thống", error: error.message });
    }
  },

  // POST /notifications – tạo thông báo cho một user (admin khi duyệt user, gán phòng, v.v.)
  createForUser: async (req, res) => {
    try {
      const { userId, title, content, type } = req.body;
      if (!userId || !title || !content) {
        return res.status(400).json({
          success: false,
          message: "Thiếu userId, title hoặc content"
        });
      }
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, message: "Không tìm thấy user" });
      }
      const allowedTypes = ['system', 'bill', 'billing', 'maintenance', 'contract', 'general'];
      const notificationType = type && allowedTypes.includes(type) ? type : 'general';
      const notification = await Notification.create({
        userId,
        title,
        content,
        type: notificationType,
        isRead: false
      });
      const created = await Notification.findById(notification._id).lean();
      res.status(201).json({
        success: true,
        data: {
          _id: created._id,
          userId: created.userId,
          title: created.title,
          content: created.content,
          type: created.type,
          isRead: created.isRead,
          createdAt: created.createdAt
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi khi tạo thông báo", error: error.message });
    }
  },

  // PUT /notifications/:id/read – chỉ user sở hữu thông báo (userId = req.user._id) mới đánh dấu được
  markAsRead: async (req, res) => {
    try {
      const userId = req.user._id instanceof mongoose.Types.ObjectId ? req.user._id : new mongoose.Types.ObjectId(req.user._id);
      const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, userId },
        { isRead: true },
        { new: true }
      );

      if (!notification) {
        return res.status(404).json({ success: false, message: "Không tìm thấy thông báo" });
      }

      res.status(200).json({
        success: true,
        data: notification
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi hệ thống", error: error.message });
    }
  },

  // POST /notifications/broadcast (từ tenant với targetRole: 'admin' hoặc 'landlord', hoặc từ admin/manager/landlord)
  // Đảm bảo: tạo một bản ghi thông báo cho TỪNG user thuộc targetRole, mỗi bản ghi có userId = _id của admin/landlord đó (giống gửi cho từng tenant)
  // targetRole: admin -> user có role 'admin' hoặc 'manager'; landlord -> 'landlord'; tenant -> 'tenant'; staff -> maintenance_staff, accountant, security
  // roomId: gửi cho (các) tenant thuộc phòng đó
  broadcast: async (req, res) => {
    try {
      const { title, content, type, targetRole, roomId } = req.body;
      if (!title || !content) {
        return res.status(400).json({ success: false, message: "Thiếu title hoặc content" });
      }

      let usersQuery = {};
      const tr = targetRole ? String(targetRole).toLowerCase().trim() : "";

      if (roomId) {
        usersQuery.roomId = roomId;
      } else if (tr === "admin") {
        // Tìm admin + manager (không phân biệt hoa thường để tránh lỗi dữ liệu)
        usersQuery.$or = [
          { role: { $regex: /^admin$/i } },
          { role: { $regex: /^manager$/i } }
        ];
      } else if (tr === "landlord") {
        usersQuery.role = { $regex: /^landlord$/i };
      } else if (tr === "tenant") {
        usersQuery.role = { $regex: /^tenant$/i };
      } else if (tr === "staff") {
        usersQuery.role = { $in: ["maintenance_staff", "accountant", "security"] };
      } else if (!tr) {
        usersQuery = {};
      } else {
        usersQuery.role = { $regex: new RegExp(`^${tr}$`, "i") };
      }

      const users = await User.find(usersQuery).select('_id').lean();
      // Mỗi admin/landlord/tenant nhận một bản ghi riêng, userId = _id của người nhận → admin thấy trong chuông và trang Thông báo như tenant
      const notificationType = (type && ["system", "bill", "billing", "maintenance", "contract", "general"].includes(type)) ? type : "general";
      const notifications = users.map(user => ({
        userId: user._id instanceof mongoose.Types.ObjectId ? user._id : new mongoose.Types.ObjectId(user._id),
        title,
        content,
        type: notificationType,
        isRead: false
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }

      res.status(201).json({
        success: true,
        message: `Đã gửi thông báo tới ${notifications.length} người dùng`
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi khi gửi thông báo", error: error.message });
    }
  }
};

module.exports = notificationController;
