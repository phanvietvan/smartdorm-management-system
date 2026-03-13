const { hasPermission, hasAnyPermission, ROLES } = require("../config/roles");

/**
 * Middleware: Kiểm tra user có quyền thực hiện action không
 * @param {string|string[]} permission - Một permission hoặc mảng permissions (chỉ cần 1 trong số đó)
 */
function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Vui lòng đăng nhập." });
    }

    const permissions = Array.isArray(permission) ? permission : [permission];
    const allowed = hasAnyPermission(req.user.role, permissions);

    if (!allowed) {
      return res.status(403).json({
        message: "Bạn không có quyền thực hiện thao tác này.",
        required: permissions,
      });
    }

    next();
  };
}

/**
 * Middleware: Chỉ cho phép các role được chỉ định
 * @param {string[]} allowedRoles - Danh sách role được phép
 */
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Vui lòng đăng nhập." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Bạn không có quyền truy cập.",
        allowedRoles,
      });
    }

    next();
  };
}

/**
 * Middleware: Chỉ Admin
 */
const requireAdmin = requireRole(ROLES.ADMIN);

/**
 * Middleware: Admin hoặc Manager
 */
const requireAdminOrManager = requireRole(ROLES.ADMIN, ROLES.MANAGER);

/**
 * Middleware: Chỉ Tenant
 */
const requireTenant = requireRole(ROLES.TENANT);

/**
 * Middleware: Chỉ Landlord
 */
const requireLandlord = requireRole(ROLES.LANDLORD);

/**
 * Middleware: Guest có thể truy cập (không cần đăng nhập)
 * Dùng cho routes như xem phòng trống, gửi yêu cầu thuê
 */
function allowGuest(req, res, next) {
  next();
}

module.exports = {
  requirePermission,
  requireRole,
  requireAdmin,
  requireAdminOrManager,
  requireTenant,
  requireLandlord,
  allowGuest,
};
