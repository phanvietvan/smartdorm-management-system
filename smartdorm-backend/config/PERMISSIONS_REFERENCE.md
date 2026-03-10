# SmartDorm - Bảng tham chiếu Role & Permissions

## Tổng quan Role

| Role | Mục đích |
|------|----------|
| `admin` | Quản lý toàn hệ thống |
| `manager` | Quản lý khu nhà |
| `landlord` | Chủ trọ - quản lý phòng |
| `tenant` | Người thuê |
| `maintenance_staff` | Nhân viên sửa chữa |
| `accountant` | Kế toán |
| `security` | Bảo vệ / Lễ tân |
| `guest` | Khách xem phòng |

---

## Chi tiết quyền theo Role

### 1. Admin
- **users:** create, update, delete, view
- **rooms:** create, update, delete, view, view_available
- **bills:** view
- **payments:** view
- **dashboard:** view
- **staff:** manage
- **config:** manage

### 2. Manager
- **rooms:** create, update, view, view_available
- **tenant:** assign
- **reports:** view
- **maintenance:** view
- **staff:** manage

### 3. Landlord
- **rooms:** create, view, view_available
- **tenant:** assign
- **bills:** create
- **payments:** view
- **message:** send

### 4. Tenant
- **rooms:** view
- **bills:** view
- **payments:** make
- **maintenance:** create
- **message:** send

### 5. Maintenance Staff
- **maintenance:** view, update, upload_image

### 6. Accountant
- **bills:** create, view
- **payments:** view, confirm
- **reports:** view

### 7. Security
- **visitor:** create, update, view
- **rooms:** view

### 8. Guest
- **rooms:** view_available
- **rental_request:** submit

---

## Cách sử dụng trong code

```javascript
const { authenticate } = require("./middleware/auth");
const { requirePermission, requireRole } = require("./middleware/permissions");
const { PERMISSIONS } = require("./config/roles");

// Bắt buộc đăng nhập + có quyền tạo phòng
router.post("/rooms", authenticate, requirePermission(PERMISSIONS.ROOMS_CREATE), createRoom);

// Chỉ Admin
router.delete("/users/:id", authenticate, requireAdmin, deleteUser);

// Admin hoặc Manager
router.get("/reports", authenticate, requireAdminOrManager, getReports);

// Guest có thể xem (không cần auth)
router.get("/rooms/available", getAvailableRooms);
```
