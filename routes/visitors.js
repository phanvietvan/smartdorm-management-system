const express = require("express");
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/permissions");
const { PERMISSIONS } = require("../config/roles");
const visitorController = require("../controllers/visitorController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Visitors
 *   description: Visitor tracking management
 */

/**
 * @swagger
 * /visitors:
 *   get:
 *     summary: Get all visitors
 *     tags: [Visitors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of visitors
 */
router.get("/", authenticate, requirePermission([PERMISSIONS.VISITOR_VIEW, PERMISSIONS.ROOMS_VIEW]), visitorController.getAll);

/**
 * @swagger
 * /visitors/{id}:
 *   get:
 *     summary: Get visitor by ID
 *     tags: [Visitors]
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
 *         description: Visitor details
 */
router.get("/:id", authenticate, requirePermission([PERMISSIONS.VISITOR_VIEW, PERMISSIONS.ROOMS_VIEW]), visitorController.getById);

/**
 * @swagger
 * /visitors:
 *   post:
 *     summary: Register a new visitor entry
 *     tags: [Visitors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - roomId
 *             properties:
 *               fullName:
 *                 type: string
 *               phone:
 *                 type: string
 *               idNumber:
 *                 type: string
 *               roomId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Visitor registered
 */
router.post("/", authenticate, requirePermission(PERMISSIONS.VISITOR_CREATE), visitorController.create);

/**
 * @swagger
 * /visitors/{id}/checkout:
 *   put:
 *     summary: Record visitor checkout
 *     tags: [Visitors]
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
 *         description: Visitor checked out
 */
router.put("/:id/checkout", authenticate, requirePermission(PERMISSIONS.VISITOR_UPDATE), visitorController.checkOut);

module.exports = router;
