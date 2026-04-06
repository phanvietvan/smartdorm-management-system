const express = require("express");
const { authenticate } = require("../middleware/auth");
const { requirePermission } = require("../middleware/permissions");
const { PERMISSIONS } = require("../config/roles");
const rentalRequestController = require("../controllers/rentalRequestController");

const router = express.Router();

// Khách - Không cần login để gửi yêu cầu thuê
router.post("/", rentalRequestController.create);

// Quản trị - Cần quyền liệt kê hoặc xem các yêu cầu thuê
router.get("/", authenticate, requirePermission(PERMISSIONS.TENANT_ASSIGN), rentalRequestController.getAll);
router.get("/:id", authenticate, requirePermission(PERMISSIONS.TENANT_ASSIGN), rentalRequestController.getById);

// Admin/Manager xử lý (Duyệt/Từ chối)
router.put("/:id/process", authenticate, requirePermission(PERMISSIONS.TENANT_ASSIGN), rentalRequestController.process);

module.exports = router;
