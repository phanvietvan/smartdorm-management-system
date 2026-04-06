const express = require("express");
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/permissions");
const { PERMISSIONS } = require("../config/roles");
const billController = require("../controllers/billController");

const router = express.Router();

router.get("/", authenticate, billController.getAll);
router.get("/:id", authenticate, requirePermission([PERMISSIONS.BILLS_VIEW]), billController.getById);
router.post("/", authenticate, requirePermission(PERMISSIONS.BILLS_CREATE), billController.create);
router.put("/:id", authenticate, requirePermission([PERMISSIONS.BILLS_VIEW, PERMISSIONS.BILLS_UPDATE]), billController.update);
router.put("/:id/dispute", authenticate, billController.dispute);

module.exports = router;
