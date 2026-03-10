const express = require("express");
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/permissions");
const { PERMISSIONS } = require("../config/roles");
const notificationController = require("../controllers/notificationController");

const router = express.Router();

router.get("/", authenticate, notificationController.getUserNotifications);
router.put("/:id/read", authenticate, notificationController.markAsRead);
router.post("/broadcast", authenticate, requirePermission(PERMISSIONS.MESSAGE_SEND), notificationController.broadcast);

module.exports = router;
