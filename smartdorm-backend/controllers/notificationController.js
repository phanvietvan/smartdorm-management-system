const Notification = require("../models/Notification");
const mongoose = require("mongoose");

const notificationController = {
  // GET /notifications
  getAll: async (req, res) => {
    try {
      const { isRead, type, page = 1, limit = 20 } = req.query;
      const filter = { userId: req.user._id };

      if (isRead !== undefined && isRead !== "") {
        filter.isRead = isRead === "true";
      }

      if (type) {
        filter.type = type;
      }

      const total = await Notification.countDocuments(filter);
      const notifications = await Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate("actor.userId", "fullName avatarUrl");

      res.status(200).json({
        success: true,
        data: notifications,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi hệ thống", error: error.message });
    }
  },

  // GET /notifications/unread-count
  getUnreadCount: async (req, res) => {
    try {
      const count = await Notification.countDocuments({ 
        userId: req.user._id, 
        isRead: false 
      });
      res.status(200).json({ success: true, count });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi hệ thống", error: error.message });
    }
  },

  // PATCH /notifications/:id/read
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

      res.status(200).json({ success: true, data: notification });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi hệ thống", error: error.message });
    }
  },

  // PATCH /notifications/read-all
  readAll: async (req, res) => {
    try {
      await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
      res.status(200).json({ success: true, message: "Đã đánh dấu tất cả là đã đọc" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Lỗi hệ thống", error: error.message });
    }
  },

  // POST /notifications/:id/reaction
  toggleReaction: async (req, res) => {
    try {
      const { emoji } = req.body;
      const { id } = req.params;
      const userId = req.user._id;

      const notification = await Notification.findOne({ _id: id, userId });
      if (!notification) return res.status(404).json({ message: "Không tìm thấy thông báo" });

      const existingReactionIndex = notification.reactions.findIndex(r => 
        r.userId.toString() === userId.toString() && r.emoji === emoji
      );

      if (existingReactionIndex > -1) {
        // Remove reaction
        notification.reactions.splice(existingReactionIndex, 1);
      } else {
        // Add reaction (or update if user only allows one reaction per emoji type)
        notification.reactions.push({ userId, emoji });
      }

      await notification.save();
      res.json({ success: true, data: notification.reactions });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Create (Internal/Admin)
  create: async (req, res) => {
    try {
      const { notifyUser } = require("../utils/notificationService");
      const { userId, title, message, type, link, metadata } = req.body;
      
      const actor = {
        userId: req.user._id,
        fullName: req.user.fullName,
        avatarUrl: req.user.avatarUrl
      };

      await notifyUser(userId, title, message, type, link, actor, metadata);
      res.status(201).json({ success: true });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Broadcast (Internal/Admin)
  broadcast: async (req, res) => {
    try {
      const { notifyByRole, notifyUsers } = require("../utils/notificationService");
      const { title, content, type, targetRole, roomId, link, metadata } = req.body;
      
      const payload = {
        title,
        message: content,
        type: type || 'broadcast',
        link,
        actor: {
          userId: req.user._id,
          fullName: req.user.fullName,
          avatarUrl: req.user.avatarUrl
        },
        metadata
      };

      if (roomId) {
        const User = require("../models/User");
        const users = await User.find({ roomId }).select("_id").lean();
        await notifyUsers(users.map(u => u._id), payload);
      } else if (targetRole) {
        await notifyByRole(targetRole, payload);
      } else {
        // Broadcast to all
        const User = require("../models/User");
        const users = await User.find({}).select("_id").lean();
        await notifyUsers(users.map(u => u._id), payload);
      }

      res.status(201).json({ success: true, message: "Đã gửi thông báo hàng loạt" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
};

module.exports = notificationController;
