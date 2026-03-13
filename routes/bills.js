const express = require("express");
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/permissions");
const { PERMISSIONS } = require("../config/roles");
const billController = require("../controllers/billController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Bills
 *   description: Bill management
 */

/**
 * @swagger
 * /bills:
 *   get:
 *     summary: Get all bills
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bills
 */
router.get("/", authenticate, requirePermission([PERMISSIONS.BILLS_VIEW]), billController.getAll);

/**
 * @swagger
 * /bills/{id}:
 *   get:
 *     summary: Get bill by ID
 *     tags: [Bills]
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
 *         description: Bill details
 */
router.get("/:id", authenticate, requirePermission([PERMISSIONS.BILLS_VIEW]), billController.getById);

/**
 * @swagger
 * /bills:
 *   post:
 *     summary: Create a new bill
 *     tags: [Bills]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roomId
 *               - tenantId
 *               - month
 *               - year
 *               - rentAmount
 *             properties:
 *               roomId:
 *                 type: string
 *               tenantId:
 *                 type: string
 *               month:
 *                 type: number
 *               year:
 *                 type: number
 *               rentAmount:
 *                 type: number
 *               electricityAmount:
 *                 type: number
 *               waterAmount:
 *                 type: number
 *               serviceAmount:
 *                 type: number
 *               dueDate:
 *                 type: string
 *     responses:
 *       201:
 *         description: Bill created
 */
router.post("/", authenticate, requirePermission(PERMISSIONS.BILLS_CREATE), billController.create);

/**
 * @swagger
 * /bills/{id}:
 *   put:
 *     summary: Update bill
 *     tags: [Bills]
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
 *               paidDate:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bill updated
 */
router.put("/:id", authenticate, requirePermission([PERMISSIONS.BILLS_VIEW, PERMISSIONS.BILLS_UPDATE]), billController.update);

module.exports = router;
