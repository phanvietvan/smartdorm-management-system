const express = require("express");
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/permissions");
const { PERMISSIONS } = require("../config/roles");
const dashboardController = require("../controllers/dashboardController");

const router = express.Router();

router.get("/stats", dashboardController.getStats);
router.get("/revenue", dashboardController.getRevenueReport);

module.exports = router;
