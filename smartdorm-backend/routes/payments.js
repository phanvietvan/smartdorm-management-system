const express = require("express");
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/permissions");
const { PERMISSIONS } = require("../config/roles");
const paymentController = require("../controllers/paymentController");

const router = express.Router();

router.post("/vnpay/create-url", authenticate, paymentController.createVnpayUrl);
router.get("/vnpay/ipn", paymentController.vnpayIpn);

router.get("/", authenticate, requirePermission([PERMISSIONS.PAYMENTS_VIEW, PERMISSIONS.PAYMENTS_MAKE]), paymentController.getAll);
router.get("/:id", authenticate, requirePermission([PERMISSIONS.PAYMENTS_VIEW, PERMISSIONS.PAYMENTS_MAKE]), paymentController.getById);
router.post("/", authenticate, requirePermission(PERMISSIONS.PAYMENTS_MAKE), paymentController.create);
router.put("/:id/confirm", authenticate, requirePermission(PERMISSIONS.PAYMENTS_CONFIRM), paymentController.confirm);

module.exports = router;
