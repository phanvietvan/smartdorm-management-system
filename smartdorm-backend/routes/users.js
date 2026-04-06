const express = require("express");
const { authenticate } = require("../middleware/auth");
const { requirePermission, requireAdmin } = require("../middleware/permissions");
const { PERMISSIONS } = require("../config/roles");
const userController = require("../controllers/userController");

const router = express.Router();

router.get("/", authenticate, requirePermission(PERMISSIONS.USERS_VIEW), userController.getAll);
router.get("/roommates", authenticate, userController.getRoommates);
router.put("/me", authenticate, userController.updateProfile);
router.get("/:id", authenticate, requirePermission(PERMISSIONS.USERS_VIEW), userController.getById);
router.post("/", authenticate, requirePermission(PERMISSIONS.USERS_CREATE), userController.create);
router.put("/:id", authenticate, requirePermission(PERMISSIONS.USERS_UPDATE), userController.update);
router.delete("/:id", authenticate, requirePermission(PERMISSIONS.USERS_DELETE), userController.delete);
router.post("/assign-tenant", authenticate, requirePermission(PERMISSIONS.TENANT_ASSIGN), userController.assignTenant);
router.post("/unassign-tenant", authenticate, requirePermission(PERMISSIONS.TENANT_ASSIGN), userController.unassignTenant);
// Duyệt / từ chối user (hỗ trợ cả POST & PUT cho khớp FE)
router.post("/:id/approve", authenticate, requirePermission(PERMISSIONS.USERS_UPDATE), userController.approve);
router.put("/:id/approve", authenticate, requirePermission(PERMISSIONS.USERS_UPDATE), userController.approve);
router.post("/:id/reject", authenticate, requirePermission(PERMISSIONS.USERS_UPDATE), userController.reject);
router.put("/:id/reject", authenticate, requirePermission(PERMISSIONS.USERS_UPDATE), userController.reject);

module.exports = router;
