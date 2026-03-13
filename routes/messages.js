const express = require("express");
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/permissions");
const { PERMISSIONS } = require("../config/roles");
const messageController = require("../controllers/messageController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Chat and messaging management
 */

/**
 * @swagger
 * /messages/chat-list:
 *   get:
 *     summary: Get user's chat list
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Chat list retrieved
 */
router.get("/chat-list", authenticate, requirePermission(PERMISSIONS.MESSAGE_SEND), messageController.getChatList);

/**
 * @swagger
 * /messages/conversation/{userId}:
 *   get:
 *     summary: Get conversation with a specific user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation messages
 */
router.get("/conversation/:userId", authenticate, requirePermission(PERMISSIONS.MESSAGE_SEND), messageController.getConversation);

/**
 * @swagger
 * /messages:
 *   post:
 *     summary: Send a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - content
 *             properties:
 *               receiverId:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent
 */
router.post("/", authenticate, requirePermission(PERMISSIONS.MESSAGE_SEND), messageController.send);

/**
 * @swagger
 * /messages/read/{userId}:
 *   put:
 *     summary: Mark messages from user as read
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Messages marked as read
 */
router.put("/read/:userId", authenticate, requirePermission(PERMISSIONS.MESSAGE_SEND), messageController.markRead);

module.exports = router;
