const Notification = require("../models/Notification");
const User = require("../models/User");
const { getIO } = require("./socket");
const { sendPushNotification } = require("./push");

/**
 * Notify a list of user IDs
 * @param {string|string[]} userIds Array of user IDs or single ID
 * @param {Object} payload { type, title, message, link, actor, metadata }
 */
async function notifyUsers(userIds, payload) {
  try {
    const ids = Array.isArray(userIds) ? userIds : [userIds];
    if (ids.length === 0) return;

    // Create notifications in DB for all users
    const notifications = ids.map(id => ({
      userId: id,
      type: payload.type || 'system',
      title: payload.title,
      message: payload.message || payload.content,
      link: payload.link,
      actor: payload.actor,
      metadata: payload.metadata,
      isRead: false
    }));

    const createdNotifications = await Notification.insertMany(notifications);

    // Socket.io & Web Push for each user
    const io = getIO();
    for (const notification of createdNotifications) {
      const uId = notification.userId.toString();
      
      // Emit to user room
      io.to(`user:${uId}`).emit("new_notification", notification);

      // Web Push
      const user = await User.findById(uId).select("pushSubscriptions").lean();
      if (user && user.pushSubscriptions && user.pushSubscriptions.length > 0) {
        await sendPushNotification(user.pushSubscriptions, {
          title: notification.title,
          message: notification.message,
          link: notification.link,
          metadata: notification.metadata
        });
      }
    }
  } catch (err) {
    console.error("notifyUsers failed:", err.message);
  }
}

/**
 * Backward compatibility for old notifyUser signature
 * Usage: notifyUser(id, title, content, type)
 */
async function notifyUser(userId, title, content, type = "system", link = null, actor = null) {
  return notifyUsers([userId], { title, message: content, type, link, actor });
}

/**
 * Notify users by role, with optional filters (e.g., managedAreaId, roomId)
 * @param {string} role ROLES.ADMIN, ROLES.TENANT, etc.
 * @param {Object} payload { type, title, message, link, actor, metadata }
 * @param {Object} filter Mongoose query filter object
 */
async function notifyByRole(role, payload, filter = {}) {
  try {
    const users = await User.find({ role, ...filter }).select("_id").lean();
    const userIds = users.filter(u => u._id).map(u => u._id.toString());
    if (userIds.length > 0) {
      await notifyUsers(userIds, payload);
    }
  } catch (err) {
    console.error("notifyByRole failed:", err.message);
  }
}

module.exports = { notifyUsers, notifyUser, notifyByRole };
