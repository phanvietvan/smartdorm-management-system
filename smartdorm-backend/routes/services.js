const express = require("express");
const { authenticate, optionalAuth } = require("../middleware/auth");
const { requirePermission } = require("../middleware/permissions");
const { PERMISSIONS } = require("../config/roles");
const serviceController = require("../controllers/serviceController");

const router = express.Router();

router.get("/", optionalAuth, serviceController.getAll);
router.post("/", authenticate, requirePermission(PERMISSIONS.CONFIG_MANAGE), serviceController.create);
router.put("/:id", authenticate, requirePermission(PERMISSIONS.CONFIG_MANAGE), serviceController.update);

module.exports = router;
