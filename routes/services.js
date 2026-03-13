const express = require("express");
const { authenticate, optionalAuth } = require("../middleware/auth");
const { requirePermission } = require("../middleware/permissions");
const { PERMISSIONS } = require("../config/roles");
const serviceController = require("../controllers/serviceController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Utilities and services management (Electricity, Water, etc.)
 */

/**
 * @swagger
 * /services:
 *   get:
 *     summary: Get all services
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: List of services
 */
router.get("/", optionalAuth, serviceController.getAll);

/**
 * @swagger
 * /services:
 *   post:
 *     summary: Create a new service (Admin)
 *     tags: [Services]
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
 *               - unitPrice
 *             properties:
 *               name:
 *                 type: string
 *               unitPrice:
 *                 type: number
 *               unit:
 *                 type: string
 *     responses:
 *       201:
 *         description: Service created
 */
router.post("/", authenticate, requirePermission(PERMISSIONS.CONFIG_MANAGE), serviceController.create);

/**
 * @swagger
 * /services/{id}:
 *   put:
 *     summary: Update service details
 *     tags: [Services]
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
 *               unitPrice:
 *                 type: number
 *               unit:
 *                 type: string
 *     responses:
 *       200:
 *         description: Service updated
 */
router.put("/:id", authenticate, requirePermission(PERMISSIONS.CONFIG_MANAGE), serviceController.update);

module.exports = router;
