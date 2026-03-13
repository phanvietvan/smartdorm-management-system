const express = require("express");
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/permissions");
const { PERMISSIONS } = require("../config/roles");
const areaController = require("../controllers/areaController");

const router = express.Router();

// Xem areas - nhiều role cần (Manager, Landlord, Security...)
/**
 * @swagger
 * tags:
 *   name: Areas
 *   description: Area/Block management
 */

/**
 * @swagger
 * /areas:
 *   get:
 *     summary: Get all areas
 *     tags: [Areas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of areas
 */
router.get("/", authenticate, areaController.getAll);

/**
 * @swagger
 * /areas/{id}:
 *   get:
 *     summary: Get area by ID
 *     tags: [Areas]
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
 *         description: Area details
 */
router.get("/:id", authenticate, areaController.getById);

/**
 * @swagger
 * /areas:
 *   post:
 *     summary: Create a new area
 *     tags: [Areas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Area created
 */
router.post("/", authenticate, requirePermission(PERMISSIONS.ROOMS_CREATE), areaController.create);

/**
 * @swagger
 * /areas/{id}:
 *   put:
 *     summary: Update area details
 *     tags: [Areas]
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Area updated
 */
router.put("/:id", authenticate, requirePermission(PERMISSIONS.ROOMS_UPDATE), areaController.update);

/**
 * @swagger
 * /areas/{id}:
 *   delete:
 *     summary: Delete an area
 *     tags: [Areas]
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
 *         description: Area deleted
 */
router.delete("/:id", authenticate, requirePermission(PERMISSIONS.ROOMS_DELETE), areaController.delete);

module.exports = router;
