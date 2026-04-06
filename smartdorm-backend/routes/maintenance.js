const express = require("express");
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/permissions");
const { PERMISSIONS } = require("../config/roles");
const maintenanceController = require("../controllers/maintenanceController");

const router = express.Router();

router.get("/", authenticate, maintenanceController.getAll);
router.get("/:id", authenticate, maintenanceController.getById);
router.post("/", authenticate, requirePermission(PERMISSIONS.MAINTENANCE_CREATE), maintenanceController.create);
router.put("/:id", authenticate, requirePermission([PERMISSIONS.MAINTENANCE_UPDATE, PERMISSIONS.MAINTENANCE_UPLOAD_IMAGE]), maintenanceController.update);
router.put("/:id/assign", authenticate, requirePermission(PERMISSIONS.MAINTENANCE_UPDATE), maintenanceController.assign);
router.put("/:id/confirm-done", authenticate, requirePermission(PERMISSIONS.MAINTENANCE_CREATE), maintenanceController.confirmDone);
router.put("/:id/reopen", authenticate, requirePermission(PERMISSIONS.MAINTENANCE_CREATE), maintenanceController.reopen);

module.exports = router;
