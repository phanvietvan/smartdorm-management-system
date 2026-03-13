const express = require("express");
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/permissions");
const { PERMISSIONS } = require("../config/roles");
const paymentController = require("../controllers/paymentController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment management
 */

/**
 * @swagger
 * /payments/vnpay/create-url:
 *   post:
 *     summary: Create VNPay payment URL
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: VNPay URL created
 */
router.post("/vnpay/create-url", authenticate, paymentController.createVnpayUrl);

/**
 * @swagger
 * /payments/vnpay/ipn:
 *   get:
 *     summary: VNPay IPN callback
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: IPN handled
 */
router.get("/vnpay/ipn", paymentController.vnpayIpn);

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Get all payments
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of payments
 */
router.get("/", authenticate, requirePermission([PERMISSIONS.PAYMENTS_VIEW, PERMISSIONS.PAYMENTS_MAKE]), paymentController.getAll);

/**
 * @swagger
 * /payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payments]
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
 *         description: Payment details
 */
router.get("/:id", authenticate, requirePermission([PERMISSIONS.PAYMENTS_VIEW, PERMISSIONS.PAYMENTS_MAKE]), paymentController.getById);

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Create a new payment record
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - billId
 *               - amount
 *               - paymentMethod
 *             properties:
 *               billId:
 *                 type: string
 *               amount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       201:
 *         description: Payment created
 */
router.post("/", authenticate, requirePermission(PERMISSIONS.PAYMENTS_MAKE), paymentController.create);

/**
 * @swagger
 * /payments/{id}/confirm:
 *   put:
 *     summary: Confirm payment (Admin/Accountant)
 *     tags: [Payments]
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
 *         description: Payment confirmed
 */
router.put("/:id/confirm", authenticate, requirePermission(PERMISSIONS.PAYMENTS_CONFIRM), paymentController.confirm);

module.exports = router;
