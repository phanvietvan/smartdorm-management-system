const express = require("express");
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/permissions");
const { PERMISSIONS } = require("../config/roles");
const areaController = require("../controllers/areaController");

const router = express.Router();

// Xem areas - nhiều role cần (Manager, Landlord, Security...)
router.get("/", authenticate, areaController.getAll);
router.get("/:id", authenticate, areaController.getById);

// CRUD - Admin, Manager
router.post("/", authenticate, requirePermission(PERMISSIONS.ROOMS_CREATE), areaController.create);
router.put("/:id", authenticate, requirePermission(PERMISSIONS.ROOMS_UPDATE), areaController.update);
router.delete("/:id", authenticate, requirePermission(PERMISSIONS.ROOMS_DELETE), areaController.delete);

module.exports = router;
