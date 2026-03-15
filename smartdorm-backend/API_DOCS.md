# Tài liệu API SmartDorm

**Địa chỉ gốc:** `http://localhost:5000`

> [!TIP]
> **Tài liệu API Tương tác (Swagger):** Truy cập [http://localhost:5000/api-docs](http://localhost:5000/api-docs) để xem tài liệu đầy đủ và thử nghiệm các API trực tiếp trên trình duyệt.

## Xác thực

Gửi token trong header: `Authorization: Bearer <token>`

- ✅ = Cần đăng nhập
- ❌ = Không cần đăng nhập
- Tùy chọn = Có hoặc không đăng nhập đều được

---

## Danh sách API

### Xác thực (Auth)
| Phương thức | Endpoint | Đăng nhập | Mô tả |
|-------------|----------|-----------|-------|
| POST | `/auth/register` | ❌ | Đăng ký tài khoản |
| POST | `/auth/login` | ❌ | Đăng nhập |
| POST | `/auth/google` | ❌ | Đăng nhập bằng Google (gửi `credential` từ Google) |
| GET | `/auth/me` | ✅ | Lấy thông tin tài khoản hiện tại |

### Phòng (Rooms)
| Phương thức | Endpoint | Đăng nhập | Mô tả |
|-------------|----------|-----------|-------|
| GET | `/rooms/available` | ❌ | Danh sách phòng trống (Khách) |
| GET | `/rooms` | Tùy chọn | Danh sách phòng |
| GET | `/rooms/:id` | Tùy chọn | Chi tiết phòng |
| POST | `/rooms` | ✅ | Tạo phòng (Admin/Quản lý/Chủ trọ) |
| PUT | `/rooms/:id` | ✅ | Cập nhật phòng (Admin/Quản lý) |
| DELETE | `/rooms/:id` | ✅ | Xóa phòng (chỉ Admin) |

### Người dùng (Users)
| Phương thức | Endpoint | Đăng nhập | Mô tả |
|-------------|----------|-----------|-------|
| GET | `/users` | ✅ | Danh sách người dùng |
| GET | `/users/:id` | ✅ | Chi tiết người dùng |
| POST | `/users` | ✅ | Tạo người dùng |
| PUT | `/users/:id` | ✅ | Cập nhật người dùng |
| DELETE | `/users/:id` | ✅ | Xóa người dùng |
| POST | `/users/assign-tenant` | ✅ | Phân phòng cho người thuê (Quản lý/Chủ trọ) |

### Hóa đơn (Bills)
| Phương thức | Endpoint | Đăng nhập | Mô tả |
|-------------|----------|-----------|-------|
| GET | `/bills` | ✅ | Danh sách hóa đơn |
| GET | `/bills/:id` | ✅ | Chi tiết hóa đơn |
| POST | `/bills` | ✅ | Tạo hóa đơn (Chủ trọ/Kế toán) |
| PUT | `/bills/:id` | ✅ | Cập nhật hóa đơn |

### Thanh toán (Payments)
| Phương thức | Endpoint | Đăng nhập | Mô tả |
|-------------|----------|-----------|-------|
| GET | `/payments` | ✅ | Danh sách thanh toán |
| GET | `/payments/:id` | ✅ | Chi tiết thanh toán |
| POST | `/payments` | ✅ | Tạo thanh toán (Người thuê) |
| PUT | `/payments/:id/confirm` | ✅ | Xác nhận thanh toán (Kế toán) |

### Sửa chữa (Maintenance)
| Phương thức | Endpoint | Đăng nhập | Mô tả |
|-------------|----------|-----------|-------|
| GET | `/maintenance` | ✅ | Danh sách yêu cầu sửa chữa |
| GET | `/maintenance/:id` | ✅ | Chi tiết yêu cầu |
| POST | `/maintenance` | ✅ | Tạo yêu cầu sửa chữa (Người thuê) |
| PUT | `/maintenance/:id` | ✅ | Cập nhật trạng thái, ảnh (Nhân viên sửa chữa) |
| PUT | `/maintenance/:id/assign` | ✅ | Phân công nhân viên (Quản lý) |

### Khách ra vào (Visitors)
| Phương thức | Endpoint | Đăng nhập | Mô tả |
|-------------|----------|-----------|-------|
| GET | `/visitors` | ✅ | Danh sách khách |
| GET | `/visitors/:id` | ✅ | Chi tiết khách |
| POST | `/visitors` | ✅ | Đăng ký khách vào (Bảo vệ) |
| PUT | `/visitors/:id/checkout` | ✅ | Ghi nhận khách ra (Bảo vệ) |

### Tin nhắn (Messages)
| Phương thức | Endpoint | Đăng nhập | Mô tả |
|-------------|----------|-----------|-------|
| GET | `/messages/chat-list` | ✅ | Danh sách cuộc hội thoại |
| GET | `/messages/conversation/:userId` | ✅ | Lịch sử chat với người dùng |
| POST | `/messages` | ✅ | Gửi tin nhắn |
| PUT | `/messages/read/:userId` | ✅ | Đánh dấu đã đọc |

### Thông báo (Notifications)
| Phương thức | Endpoint | Đăng nhập | Mô tả |
|-------------|----------|-----------|-------|
| GET | `/notifications` | ✅ | Danh sách thông báo của user (query: `isRead=false` chỉ lấy chưa đọc) |
| POST | `/notifications` | ✅ | Tạo thông báo cho một user (body: `userId`, `title`, `content`, `type` optional) |
| PUT | `/notifications/:id/read` | ✅ | Đánh dấu đã đọc |
| POST | `/notifications/broadcast` | ✅ | Gửi thông báo hàng loạt (admin/manager/landlord mọi lúc; tenant khi `targetRole` = admin/landlord – báo sự cố, thanh toán, tin nhắn). Xem mục **API Broadcast** bên dưới. |

### Yêu cầu thuê phòng (Rental Requests)
| Phương thức | Endpoint | Đăng nhập | Mô tả |
|-------------|----------|-----------|-------|
| POST | `/rental-requests` | Tùy chọn | Gửi yêu cầu thuê (Khách) |
| GET | `/rental-requests` | ✅ | Danh sách yêu cầu |
| GET | `/rental-requests/:id` | ✅ | Chi tiết yêu cầu |
| PUT | `/rental-requests/:id/process` | ✅ | Duyệt/Từ chối (Quản lý/Chủ trọ) |

### Khu nhà (Areas)
| Phương thức | Endpoint | Đăng nhập | Mô tả |
|-------------|----------|-----------|-------|
| GET | `/areas` | ✅ | Danh sách khu |
| GET | `/areas/:id` | ✅ | Chi tiết khu |
| POST | `/areas` | ✅ | Tạo khu (Admin/Quản lý) |
| PUT | `/areas/:id` | ✅ | Cập nhật khu |
| DELETE | `/areas/:id` | ✅ | Xóa khu (chỉ Admin) |

### Bảng điều khiển (Dashboard)
| Phương thức | Endpoint | Đăng nhập | Mô tả |
|-------------|----------|-----------|-------|
| GET | `/dashboard/stats` | ✅ | Thống kê tổng quan |
| GET | `/dashboard/revenue?year=2025` | ✅ | Báo cáo doanh thu theo năm |

---

## Ví dụ Request/Response

### Đăng ký
```json
POST /auth/register
{
  "email": "user@mail.com",
  "password": "123456",
  "fullName": "Nguyễn Văn A",
  "phone": "0901234567"
}
```

### Đăng nhập
```json
POST /auth/login
{
  "email": "user@mail.com",
  "password": "123456"
}

// Trả về: { "token": "...", "user": { "id", "email", "fullName", "role" } }
```

### Tạo hóa đơn (và thông báo cho khách)
Khi tạo hóa đơn xong, **tài khoản khách (tenantId) sẽ nhận thông báo ngay** ("Hóa đơn mới"). Khách lấy thông báo qua `GET /notifications`.

**Request:**
```http
POST /bills
Authorization: Bearer <token>
Content-Type: application/json
```
```json
{
  "roomId": "507f1f77bcf86cd799439011",
  "tenantId": "507f1f77bcf86cd799439012",
  "month": 3,
  "year": 2025,
  "prevWater": 10,
  "currWater": 15,
  "prevElec": 100,
  "currElec": 120,
  "otherAmount": 0,
  "dueDate": "2025-03-31",
  "note": ""
}
```
- Bắt buộc: `roomId`, `tenantId`, `month`, `year`. Điện/nước có thể tính từ `prevWater`, `currWater`, `prevElec`, `currElec` (nếu không gửi backend dùng 0).

**Response 201:**
```json
{
  "roomId": { "_id": "...", "name": "P101" },
  "tenantId": { "_id": "...", "fullName": "Nguyễn Văn A" },
  "month": 3,
  "year": 2025,
  "totalAmount": 2500000,
  ...
}
```
Sau khi tạo xong, backend tự gửi thông báo cho user có `tenantId` với title "Hóa đơn mới", type `bill`.

**Khách lấy thông báo (chuông):**
```http
GET /notifications?isRead=false
Authorization: Bearer <token>
```
Response: `{ "success": true, "data": [ { "_id", "title", "content", "type", "isRead", "createdAt" }, ... ] }`

---

### Tạo yêu cầu sửa chữa
```json
POST /maintenance
{
  "roomId": "...",
  "title": "Điều hòa hỏng",
  "description": "Không lạnh"
}
```

### Tạo thông báo cho một user (Admin khi duyệt user, gán phòng, v.v.)
```json
POST /notifications
{
  "userId": "507f1f77bcf86cd799439011",
  "title": "Đã được duyệt",
  "content": "Tài khoản của bạn đã được quản trị viên duyệt. Bạn có thể sử dụng đầy đủ chức năng.",
  "type": "system"
}
// type (optional): "system" | "bill" | "maintenance" | "contract" | "general"
// Response 201: { "success": true, "data": { "_id", "userId", "title", "content", "type", "isRead", "createdAt" } }
```

### Gửi yêu cầu thuê (Khách - không cần đăng nhập)
```json
POST /rental-requests
{
  "roomId": "...",
  "fullName": "Trần Văn B",
  "phone": "0912345678",
  "email": "b@mail.com",
  "message": "Muốn thuê phòng"
}
```

---

## API luồng: Tạo hóa đơn → Thông báo cho khách

| Bước | Method | URL | Mô tả |
|------|--------|-----|--------|
| 1 | **POST** | `/bills` | Admin/Chủ trọ tạo hóa đơn. Body: `roomId`, `tenantId`, `month`, `year` (bắt buộc); `prevWater`, `currWater`, `prevElec`, `currElec`, `otherAmount`, `dueDate`, `note` (tùy chọn). Sau khi tạo xong, backend **tự gửi thông báo** cho user `tenantId`. |
| 2 | **GET** | `/notifications?isRead=false` | Khách (tenant) gọi để lấy danh sách thông báo chưa đọc, trong đó có "Hóa đơn mới". Response: `{ "success": true, "data": [ ... ] }`. |
| 3 | **PUT** | `/notifications/:id/read` | Khách đánh dấu đã đọc thông báo (optional). |

**Thông báo khách nhận khi có hóa đơn mới:** `title`: "Hóa đơn mới", `type`: "bill", `content`: "Bạn có hóa đơn tháng M/Y. Tổng: Xđ. Vui lòng thanh toán trước hạn."

---

## API Broadcast & Báo cáo sự cố

### POST `/notifications/broadcast` – Gửi thông báo hàng loạt

**Header:** `Authorization: Bearer <token>`

**Body (JSON):**

| Field | Kiểu | Bắt buộc | Mô tả |
|-------|------|----------|--------|
| `title` | string | Có | Tiêu đề thông báo |
| `content` | string | Có | Nội dung thông báo |
| `type` | string | Không | `general` \| `bill` \| `maintenance` \| `system` \| `contract` (mặc định `general`) |
| `targetRole` | string | Không | Đối tượng nhận: `admin` \| `landlord` \| `tenant` \| `staff` \| `""` (để trống = gửi toàn bộ user) |
| `roomId` | string | Không | Nếu có: gửi cho (các) tenant thuộc phòng này (bỏ qua targetRole) |

**Ai được gọi API này:**

| Người gọi (`req.user.role`) | Khi nào |
|------------------------------|--------|
| `admin`, `manager`, `landlord` | Gửi thông báo hàng loạt từ trang Thông báo (tùy chọn targetRole, roomId). |
| `tenant` | Khi body có `targetRole` là `admin` hoặc `landlord` – dùng cho **báo sự cố, thanh toán, tin nhắn** (gửi thông báo cho admin/chủ trọ). |
| Khác | 403 *"Bạn không có quyền thực hiện thao tác này."* |

**Backend khi nhận broadcast:** Tạo **từng bản ghi thông báo** cho **từng user** thuộc targetRole (mỗi admin/landlord một document với `userId` = user đó), để họ thấy trong chuông và trang Thông báo khi gọi GET `/notifications`.

**Khi nhận broadcast – Gửi thông báo cho ai (theo `targetRole`):**

| `targetRole` | Tạo thông báo cho user có role |
|--------------|--------------------------------|
| `admin` | `admin`, `manager` |
| `landlord` | `landlord` |
| `tenant` | `tenant` |
| `staff` | `maintenance_staff`, `accountant`, `security` |
| `""` / không gửi | Toàn bộ user |

**Khi có `roomId`:** Bỏ qua `targetRole`, tạo thông báo cho (các) **tenant** có `roomId` trùng với `roomId` trong body.

**Ví dụ request – Admin gửi cho tất cả tenant:**
```http
POST /notifications/broadcast
Authorization: Bearer <token>
Content-Type: application/json
```
```json
{
  "title": "Thông báo chung",
  "content": "Kỳ thanh toán tháng 4 sắp đến hạn.",
  "type": "bill",
  "targetRole": "tenant"
}
```

**Ví dụ request – Tenant gửi thông báo cho admin/chủ trọ (báo sự cố, thanh toán, tin nhắn):**

FE gọi **hai lần** (một cho admin/manager, một cho landlord):

1. Gửi cho admin/manager:
```json
{
  "title": "Báo cáo sự cố mới",
  "content": "Người thuê báo: Điều hòa phòng P101 không hoạt động.",
  "type": "maintenance",
  "targetRole": "admin"
}
```

2. Gửi cho landlord:
```json
{
  "title": "Báo cáo sự cố mới",
  "content": "Người thuê báo: Điều hòa phòng P101 không hoạt động.",
  "type": "maintenance",
  "targetRole": "landlord"
}
```

Có thể dùng cùng cách với `type: "bill"` (thanh toán) hoặc `type: "general"` (tin nhắn). Backend tạo từng bản ghi cho từng user nhận nên admin/landlord thấy trong chuông và trang Thông báo.

**Response 201:**
```json
{
  "success": true,
  "message": "Đã gửi thông báo tới 5 người dùng"
}
```

---

## Backend đảm bảo – Admin nhận thông báo như người dùng

1. **Khi nhận POST `/notifications/broadcast`** (từ tenant, với `targetRole: 'admin'` hoặc `'landlord'`):  
   Tạo **một bản ghi thông báo cho từng user** thuộc targetRole; mỗi bản ghi có **`userId` = _id** của admin/landlord đó (giống cách gửi cho từng tenant). Không lưu một bản ghi “broadcast” chung.

2. **GET `/notifications`** (cho mọi user, kể cả admin):  
   Chỉ trả về thông báo có **userId/recipient = `req.user._id`** (user đang đăng nhập). **Không phân biệt role**; admin và tenant đều nhận đúng danh sách của mình.

3. **Role admin trong DB:**  
   User admin cần có **`role: 'admin'`** hoặc **`role: 'manager'`** (đúng chuỗi, thường là chữ thường) để backend tìm đúng khi broadcast `targetRole: 'admin'`. Backend dùng truy vấn không phân biệt hoa thường nên `Admin`/`ADMIN` cũng match.

Khi backend làm đúng các bước trên, **admin sẽ thấy thông báo trong chuông và trang Thông báo giống người dùng (tenant)**. Nếu vẫn không thấy: bấm **“Làm mới”** trên chuông hoặc mở **Trung tâm Thông báo**, và kiểm tra backend đã tạo từng bản ghi cho từng admin/landlord chưa (xem response broadcast: “Đã gửi thông báo tới N người” với N > 0).

---

## Troubleshooting – Admin không thấy thông báo

Khi **tenant gửi thông báo** (báo sự cố, thanh toán, tin nhắn), FE gọi POST `/notifications/broadcast` với `targetRole: admin` và/hoặc `targetRole: landlord`. Để **admin/chủ trọ thấy thông báo** trên trang Thông báo và chuông:

1. **Khi nhận broadcast với `targetRole: 'admin'`:** Backend **tạo từng bản ghi thông báo** (document) với **userId = từng user** có role `admin` hoặc `manager` (mỗi admin/manager một bản ghi, recipient = chính user đó). Tương tự `targetRole: 'landlord'` → tạo thông báo cho từng user có role `landlord`.
2. **GET `/notifications`:** Trả về danh sách thông báo **của user đang đăng nhập** (lọc theo `req.user._id`). Nếu backend chỉ lưu “broadcast” chung mà không gán từng thông báo cho từng user nhận thì admin sẽ không có bản ghi nào khi gọi GET.

**Backend đã đảm bảo:** (1) Broadcast tạo **từng bản ghi** cho từng admin/landlord, mỗi bản ghi có `userId` = người nhận; (2) GET `/notifications` chỉ trả về thông báo có `userId` = user đăng nhập, không phân biệt role; (3) Truy vấn role không phân biệt hoa thường. **Nếu admin vẫn không thấy:** (1) DB phải có user với `role: "admin"` hoặc `"manager"`; (2) FE gửi đúng `targetRole: "admin"` / `"landlord"`; (3) Xem response broadcast – nếu “Đã gửi thông báo tới 0 người” thì không có user match; (4) Bấm **Làm mới** chuông hoặc mở **Trung tâm Thông báo**, đảm bảo đăng nhập đúng tài khoản admin/landlord.
