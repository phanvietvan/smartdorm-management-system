const Notification = require("../models/Notification");
const User = require("../models/User");

const notificationController = {
  // GET /notifications
  getUserNotifications: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 20;
      const notifications = await Notification.find({ userId: req.user._id })
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

  // PUT /notifications/:id/read
  markAsRead: async (req, res) => {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
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

  // POST /notifications/broadcast (Admin only)
  broadcast: async (req, res) => {
    try {
      const { title, content, type, targetRole, roomId } = req.body;
      let usersQuery = {};

      if (targetRole) {
        usersQuery.role = targetRole;
      }
      if (roomId) {
        usersQuery.roomId = roomId;
      }

      const users = await User.find(usersQuery).select('_id');
      const notifications = users.map(user => ({
        userId: user._id,
        title,
        content,
        type: type || 'system'
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
