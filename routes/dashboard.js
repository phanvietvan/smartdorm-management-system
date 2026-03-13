const express = require("express");
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/permissions");
const { PERMISSIONS } = require("../config/roles");
const dashboardController = require("../controllers/dashboardController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Statistical and reporting data
 */

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get overview statistics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistical data
 */
router.get("/stats", authenticate, requirePermission([PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.REPORTS_VIEW]), dashboardController.getStats);

/**
 * @swagger
 * /dashboard/revenue:
 *   get:
 *     summary: Get revenue report data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Revenue data
 */
router.get("/revenue", authenticate, requirePermission([PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.REPORTS_VIEW]), dashboardController.getRevenueReport);

module.exports = router;
