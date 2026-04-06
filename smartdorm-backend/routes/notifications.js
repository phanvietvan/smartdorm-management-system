const express = require("express");
const { authenticate } = require("../middleware/auth");
const { requirePermission, requireRole } = require("../middleware/permissions");
const { PERMISSIONS, ROLES } = require("../config/roles");
const notificationController = require("../controllers/notificationController");

const router = express.Router();

// Publicly available to all authenticated users
router.get("/", authenticate, notificationController.getAll);
router.get("/unread-count", authenticate, notificationController.getUnreadCount);
router.patch("/read-all", authenticate, notificationController.readAll);
router.patch("/:id/read", authenticate, notificationController.markAsRead);
router.post("/:id/reaction", authenticate, notificationController.toggleReaction);

// For admin/manager
router.post("/", authenticate, requirePermission(PERMISSIONS.MESSAGE_SEND), notificationController.create);
router.post("/broadcast", authenticate, requireRole(ROLES.ADMIN, ROLES.MANAGER, ROLES.LANDLORD, ROLES.ACCOUNTANT), notificationController.broadcast);

module.exports = router;
