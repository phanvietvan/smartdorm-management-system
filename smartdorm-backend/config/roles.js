/**
 * SmartDorm - Role & Permission System
 * Định nghĩa các role và quyền tương ứng theo mô tả thực tế
 */

// ============ ROLES ============
const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  LANDLORD: 'landlord',
  TENANT: 'tenant',
  MAINTENANCE_STAFF: 'maintenance_staff',
  ACCOUNTANT: 'accountant',
  SECURITY: 'security',
  GUEST: 'guest',
};

// ============ PERMISSIONS (action:resource) ============
const PERMISSIONS = {
  // Users
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  USERS_VIEW: 'users:view',

  // Rooms
  ROOMS_CREATE: 'rooms:create',
  ROOMS_UPDATE: 'rooms:update',
  ROOMS_DELETE: 'rooms:delete',
  ROOMS_VIEW: 'rooms:view',
  ROOMS_VIEW_AVAILABLE: 'rooms:view_available',

  // Bills
  BILLS_CREATE: 'bills:create',
  BILLS_VIEW: 'bills:view',
  BILLS_UPDATE: 'bills:update',

  // Payments
  PAYMENTS_VIEW: 'payments:view',
  PAYMENTS_CONFIRM: 'payments:confirm',
  PAYMENTS_MAKE: 'payments:make',

  // Maintenance
  MAINTENANCE_VIEW: 'maintenance:view',
  MAINTENANCE_UPDATE: 'maintenance:update',
  MAINTENANCE_CREATE: 'maintenance:create',
  MAINTENANCE_UPLOAD_IMAGE: 'maintenance:upload_image',

  // Visitors
  VISITOR_CREATE: 'visitor:create',
  VISITOR_UPDATE: 'visitor:update',
  VISITOR_VIEW: 'visitor:view',

  // Reports & Analytics
  DASHBOARD_VIEW: 'dashboard:view',
  REPORTS_VIEW: 'reports:view',

  // Staff
  STAFF_MANAGE: 'staff:manage',

  // System
  CONFIG_MANAGE: 'config:manage',

  // Messaging
  MESSAGE_SEND: 'message:send',

  // Rental
  TENANT_ASSIGN: 'tenant:assign',
};

// ============ ROLE -> PERMISSIONS MAPPING ============
const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_UPDATE,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.ROOMS_CREATE,
    PERMISSIONS.ROOMS_UPDATE,
    PERMISSIONS.ROOMS_DELETE,
    PERMISSIONS.ROOMS_VIEW,
    PERMISSIONS.ROOMS_VIEW_AVAILABLE,
    PERMISSIONS.BILLS_CREATE,
    PERMISSIONS.BILLS_UPDATE,
    PERMISSIONS.BILLS_VIEW,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.STAFF_MANAGE,
    PERMISSIONS.CONFIG_MANAGE,
    PERMISSIONS.TENANT_ASSIGN,
    PERMISSIONS.VISITOR_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.MAINTENANCE_VIEW,
    PERMISSIONS.MAINTENANCE_UPDATE,
  ],

  [ROLES.MANAGER]: [
    PERMISSIONS.ROOMS_CREATE,
    PERMISSIONS.ROOMS_UPDATE,
    PERMISSIONS.ROOMS_VIEW,
    PERMISSIONS.ROOMS_VIEW_AVAILABLE,
    PERMISSIONS.TENANT_ASSIGN,
    PERMISSIONS.BILLS_CREATE,
    PERMISSIONS.BILLS_UPDATE,
    PERMISSIONS.BILLS_VIEW,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.MAINTENANCE_VIEW,
    PERMISSIONS.STAFF_MANAGE,
  ],

  [ROLES.LANDLORD]: [
    PERMISSIONS.ROOMS_CREATE,
    PERMISSIONS.ROOMS_VIEW,
    PERMISSIONS.ROOMS_VIEW_AVAILABLE,
    PERMISSIONS.TENANT_ASSIGN,
    PERMISSIONS.BILLS_CREATE,
    PERMISSIONS.BILLS_VIEW,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.MESSAGE_SEND,
  ],

  [ROLES.TENANT]: [
    PERMISSIONS.ROOMS_VIEW,
    PERMISSIONS.BILLS_VIEW,
    PERMISSIONS.PAYMENTS_MAKE,
    PERMISSIONS.MAINTENANCE_CREATE,
    PERMISSIONS.MESSAGE_SEND,
  ],

  [ROLES.MAINTENANCE_STAFF]: [
    PERMISSIONS.MAINTENANCE_VIEW,
    PERMISSIONS.MAINTENANCE_UPDATE,
    PERMISSIONS.MAINTENANCE_UPLOAD_IMAGE,
  ],

  [ROLES.ACCOUNTANT]: [
    PERMISSIONS.BILLS_CREATE,
    PERMISSIONS.BILLS_VIEW,
    PERMISSIONS.PAYMENTS_VIEW,
    PERMISSIONS.PAYMENTS_CONFIRM,
    PERMISSIONS.REPORTS_VIEW,
  ],

  [ROLES.SECURITY]: [
    PERMISSIONS.VISITOR_CREATE,
    PERMISSIONS.VISITOR_UPDATE,
    PERMISSIONS.VISITOR_VIEW,
    PERMISSIONS.ROOMS_VIEW,
  ],

  [ROLES.GUEST]: [
    PERMISSIONS.ROOMS_VIEW_AVAILABLE,
  ],
};

// ============ HELPER FUNCTIONS ============

/**
 * Kiểm tra role có quyền thực hiện permission không
 */
function hasPermission(role, permission) {
  if (!role || !ROLE_PERMISSIONS[role]) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

/**
 * Kiểm tra role có bất kỳ quyền nào trong danh sách không
 */
function hasAnyPermission(role, permissions) {
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Kiểm tra role có tất cả quyền trong danh sách không
 */
function hasAllPermissions(role, permissions) {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Lấy danh sách quyền của role
 */
function getRolePermissions(role) {
  return ROLE_PERMISSIONS[role] || [];
}

module.exports = {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
};
