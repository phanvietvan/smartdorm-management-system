const express = require("express");
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/permissions");
const { PERMISSIONS } = require("../config/roles");
const messageController = require("../controllers/messageController");

const router = express.Router();

router.get("/chat-list", authenticate, requirePermission(PERMISSIONS.MESSAGE_SEND), messageController.getChatList);
router.get("/conversation/:userId", authenticate, requirePermission(PERMISSIONS.MESSAGE_SEND), messageController.getConversation);
router.post("/", authenticate, requirePermission(PERMISSIONS.MESSAGE_SEND), messageController.send);
router.put("/read/:userId", authenticate, requirePermission(PERMISSIONS.MESSAGE_SEND), messageController.markRead);

module.exports = router;
