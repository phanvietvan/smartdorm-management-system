const Notification = require("../models/Notification");

/**
 * Tạo thông báo cho user (dùng nội bộ khi có thay đổi: duyệt, gán phòng, sửa chữa, hóa đơn, thanh toán, v.v.).
 * Lỗi chỉ log, không làm fail request gọi.
 * @param {string|Object} userId - _id user nhận thông báo
 * @param {string} title
 * @param {string} content
 * @param {string} [type='system'] - system | bill | maintenance | contract | general
 */
async function notifyUser(userId, title, content, type = "system") {
  try {
    const id = userId && typeof userId === "object" ? userId.toString() : userId;
    if (!id) return;
    await Notification.create({ userId: id, title, content, type, isRead: false });
  } catch (err) {
    console.error("notifyUser failed:", err.message);
  }
}

module.exports = { notifyUser };
