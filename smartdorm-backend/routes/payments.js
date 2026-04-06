const express = require("express");
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/permissions");
const { PERMISSIONS } = require("../config/roles");
const paymentController = require("../controllers/paymentController");
const { validateCreatePayment } = require("../utils/paymentValidator");

const router = express.Router();

router.get("/", authenticate, requirePermission([PERMISSIONS.PAYMENTS_VIEW, PERMISSIONS.PAYMENTS_MAKE]), paymentController.getPaymentHistory);
router.get("/stats/summary", authenticate, requirePermission(PERMISSIONS.PAYMENTS_VIEW), paymentController.getPaymentStats);
router.get("/:id", authenticate, requirePermission([PERMISSIONS.PAYMENTS_VIEW, PERMISSIONS.PAYMENTS_MAKE]), paymentController.getPaymentDetail);

router.post("/vnpay/create-url", authenticate, validateCreatePayment, paymentController.createVnpayUrl);
router.get("/vnpay/ipn", paymentController.vnpayIpn);

router.post("/", authenticate, requirePermission(PERMISSIONS.PAYMENTS_MAKE), validateCreatePayment, paymentController.createManual);
router.put("/:id/confirm", authenticate, requirePermission(PERMISSIONS.PAYMENTS_CONFIRM), paymentController.confirmManual);

module.exports = router;
