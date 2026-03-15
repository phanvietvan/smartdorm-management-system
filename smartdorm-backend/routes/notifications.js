const express = require("express");
const { authenticate } = require("../middleware/auth");
const { requirePermission, requireRole } = require("../middleware/permissions");
const { PERMISSIONS, ROLES } = require("../config/roles");
const notificationController = require("../controllers/notificationController");

const router = express.Router();

/**
 * Cho phép gọi POST /notifications/broadcast khi:
 * - req.user.role thuộc [admin, manager, landlord], hoặc
 * - req.user.role === 'tenant' và body.targetRole là 'admin' hoặc 'landlord' (báo sự cố, thanh toán, tin nhắn – mọi mục đích).
 */
function allowBroadcast(req, res, next) {
  const role = req.user && req.user.role ? String(req.user.role).toLowerCase() : "";
  const targetRole = req.body && req.body.targetRole ? String(req.body.targetRole).toLowerCase() : "";
  const allowedAdmin = [ROLES.ADMIN, ROLES.MANAGER, ROLES.LANDLORD].includes(role);
  const tenantReportFlow = role === ROLES.TENANT && ["admin", "landlord"].includes(targetRole);
  if (allowedAdmin || tenantReportFlow) return next();
  return res.status(403).json({ message: "Bạn không có quyền thực hiện thao tác này." });
}

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: System and user notification management
 */

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Get all notifications for current user
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of notifications
 */
router.get("/", authenticate, notificationController.getUserNotifications);

/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Create a notification for a specific user (e.g. on approve, assign room)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, title, content]
 *             properties:
 *               userId: { type: string }
 *               title: { type: string }
 *               content: { type: string }
 *               type: { type: string, enum: [system, bill, maintenance, contract, general] }
 *     responses:
 *       201:
 *         description: Notification created
 *       400:
 *         description: Missing userId, title or content
 *       404:
 *         description: User not found
 */
router.post("/", authenticate, requirePermission(PERMISSIONS.MESSAGE_SEND), notificationController.createForUser);

/**
 * @swagger
 * /notifications/{id}/read:
 *   put:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
router.put("/:id/read", authenticate, notificationController.markAsRead);

/**
 * @swagger
 * /notifications/broadcast:
 *   post:
 *     summary: Broadcast a notification to all users (Admin)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - message
 *             properties:
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *     responses:
 *       201:
 *         description: Notification broadcasted
 */
// Admin/manager/landlord: mọi lúc; tenant: chỉ khi targetRole là admin hoặc landlord (báo cáo sự cố)
router.post("/broadcast", authenticate, allowBroadcast, notificationController.broadcast);

module.exports = router;
