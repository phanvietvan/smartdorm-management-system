const express = require("express");
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/permissions");
const { PERMISSIONS } = require("../config/roles");
const visitorController = require("../controllers/visitorController");

const router = express.Router();

router.get("/", authenticate, requirePermission([PERMISSIONS.VISITOR_VIEW, PERMISSIONS.ROOMS_VIEW]), visitorController.getAll);
router.get("/:id", authenticate, requirePermission([PERMISSIONS.VISITOR_VIEW, PERMISSIONS.ROOMS_VIEW]), visitorController.getById);
router.post("/", authenticate, requirePermission(PERMISSIONS.VISITOR_CREATE), visitorController.create);
router.put("/:id/checkout", authenticate, requirePermission(PERMISSIONS.VISITOR_UPDATE), visitorController.checkOut);

module.exports = router;
