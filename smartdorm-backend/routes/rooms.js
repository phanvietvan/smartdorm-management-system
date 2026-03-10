const express = require("express");
const { authenticate, optionalAuth } = require("../middleware/auth");
const { requirePermission } = require("../middleware/permissions");
const { PERMISSIONS } = require("../config/roles");
const roomController = require("../controllers/roomController");

const router = express.Router();

router.get("/available", roomController.getAvailable);
router.get("/", optionalAuth, roomController.getAll);
router.get("/:id", optionalAuth, roomController.getById);
router.post("/", authenticate, requirePermission(PERMISSIONS.ROOMS_CREATE), roomController.create);
router.put("/:id", authenticate, requirePermission(PERMISSIONS.ROOMS_UPDATE), roomController.update);
router.delete("/:id", authenticate, requirePermission(PERMISSIONS.ROOMS_DELETE), roomController.delete);

module.exports = router;
