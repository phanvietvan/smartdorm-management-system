const express = require("express");
const { authenticate, optionalAuth } = require("../middleware/auth");
const { requirePermission } = require("../middleware/permissions");
const { PERMISSIONS } = require("../config/roles");
const roomController = require("../controllers/roomController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Rooms
 *   description: Room management
 */

/**
 * @swagger
 * /rooms/available:
 *   get:
 *     summary: Get all available rooms
 *     tags: [Rooms]
 *     responses:
 *       200:
 *         description: List of available rooms
 */
router.get("/available", roomController.getAvailable);

/**
 * @swagger
 * /rooms:
 *   get:
 *     summary: Get all rooms
 *     tags: [Rooms]
 *     responses:
 *       200:
 *         description: List of all rooms
 */
router.get("/", optionalAuth, roomController.getAll);

/**
 * @swagger
 * /rooms/my-room:
 *   get:
 *     summary: Get the current tenant's room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Room details
 */
router.get("/my-room", authenticate, roomController.getMyRoom);

/**
 * @swagger
 * /rooms/{id}:
 *   get:
 *     summary: Get room by ID
 *     tags: [Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Room details
 */
router.get("/:id", optionalAuth, roomController.getById);

/**
 * @swagger
 * /rooms:
 *   post:
 *     summary: Create a new room (Admin/Manager)
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomNumber
 *               - price
 *               - areaId
 *             properties:
 *               roomNumber:
 *                 type: string
 *               price:
 *                 type: number
 *               areaId:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Room created
 */
router.post("/", authenticate, requirePermission(PERMISSIONS.ROOMS_CREATE), roomController.create);

/**
 * @swagger
 * /rooms/{id}:
 *   put:
 *     summary: Update room details
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roomNumber:
 *                 type: string
 *               price:
 *                 type: number
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Room updated
 */
router.put("/:id", authenticate, requirePermission(PERMISSIONS.ROOMS_UPDATE), roomController.update);

/**
 * @swagger
 * /rooms/{id}:
 *   delete:
 *     summary: Delete a room (Admin)
 *     tags: [Rooms]
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
 *         description: Room deleted
 */
router.delete("/:id", authenticate, requirePermission(PERMISSIONS.ROOMS_DELETE), roomController.delete);

module.exports = router;
