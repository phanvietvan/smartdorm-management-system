const express = require("express");
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/permissions");
const { PERMISSIONS } = require("../config/roles");
const maintenanceController = require("../controllers/maintenanceController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Maintenance
 *   description: Maintenance request management
 */

/**
 * @swagger
 * /maintenance:
 *   get:
 *     summary: Get all maintenance requests
 *     tags: [Maintenance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of maintenance requests
 */
router.get("/", authenticate, requirePermission([PERMISSIONS.MAINTENANCE_VIEW, PERMISSIONS.MAINTENANCE_CREATE]), maintenanceController.getAll);

/**
 * @swagger
 * /maintenance/{id}:
 *   get:
 *     summary: Get maintenance request by ID
 *     tags: [Maintenance]
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
 *         description: Maintenance request details
 */
router.get("/:id", authenticate, requirePermission([PERMISSIONS.MAINTENANCE_VIEW, PERMISSIONS.MAINTENANCE_CREATE]), maintenanceController.getById);

/**
 * @swagger
 * /maintenance:
 *   post:
 *     summary: Create a new maintenance request
 *     tags: [Maintenance]
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
 *               - description
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Request created
 */
router.post("/", authenticate, requirePermission(PERMISSIONS.MAINTENANCE_CREATE), maintenanceController.create);

/**
 * @swagger
 * /maintenance/{id}:
 *   put:
 *     summary: Update maintenance request status
 *     tags: [Maintenance]
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
 *               status:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Request updated
 */
router.put("/:id", authenticate, requirePermission([PERMISSIONS.MAINTENANCE_UPDATE, PERMISSIONS.MAINTENANCE_UPLOAD_IMAGE]), maintenanceController.update);

/**
 * @swagger
 * /maintenance/{id}/assign:
 *   put:
 *     summary: Assign maintenance staff
 *     tags: [Maintenance]
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
 *             required:
 *               - staffId
 *             properties:
 *               staffId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Staff assigned
 */
router.put("/:id/assign", authenticate, requirePermission(PERMISSIONS.MAINTENANCE_UPDATE), maintenanceController.assign);
router.put("/:id/confirm-done", authenticate, requirePermission(PERMISSIONS.MAINTENANCE_CREATE), maintenanceController.confirmDone);

module.exports = router;
