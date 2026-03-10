const express = require("express");
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/permissions");
const { PERMISSIONS } = require("../config/roles");
const dashboardController = require("../controllers/dashboardController");

const router = express.Router();

router.get("/stats", authenticate, requirePermission([PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.REPORTS_VIEW]), dashboardController.getStats);
router.get("/revenue", authenticate, requirePermission([PERMISSIONS.DASHBOARD_VIEW, PERMISSIONS.REPORTS_VIEW]), dashboardController.getRevenueReport);

module.exports = router;
