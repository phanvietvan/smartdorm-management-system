# API thông báo – Frontend & Backend

Backend đã tạo thông báo qua `notifyUser(userId, title, content, type)` trong các controller (Users, Maintenance, Bills, Payments, Visitors, Messages, Rooms, Auth, Areas, Services). **Frontend không gọi POST tạo thông báo** khi admin duyệt/gán phòng/tạo user – chỉ gọi **GET /notifications** và **PUT /notifications/:id/read** để hiển thị chuông và danh sách.

**Nếu chuông chưa hiện thông báo:** kiểm tra Backend chạy đúng `VITE_API_URL`, và **GET /notifications** trả về danh sách của user đăng nhập (theo token). FE chấp nhận response là mảng `[...]` hoặc `{ data: [...] }` / `{ notifications: [...] }`.

**Lưu ý:** Thông báo "tạo hóa đơn" (Bills create) được BE gửi cho **người thuê (tenant)** liên quan, không gửi cho admin. Nếu bạn đăng nhập **admin** và tạo hóa đơn thì chuông admin vẫn "0 chưa đọc" là đúng; cần đăng nhập bằng **tài khoản tenant** (người được gán phòng/hóa đơn) để thấy thông báo.

---

## 1. Lấy danh sách thông báo (FE gọi)

| | |
|---|---|
| **Method** | `GET` |
| **URL** | `/notifications` |
| **Query** | `isRead=false` (optional) – chỉ lấy chưa đọc |

**Response:** Backend trả về `{ "success": true, "data": [ ... ] }`. FE đã parse `data` để hiển thị chuông và danh sách. Mỗi item: `_id`, `title`, `content`, `type`, `isRead`, `createdAt`.

---

## 2. Đánh dấu đã đọc (FE gọi)

| | |
|---|---|
| **Method** | `PUT` |
| **URL** | `/notifications/:id/read` |

Backend cập nhật thông báo thành `isRead: true`, chỉ cho user sở hữu.

---

## 3. Gửi thông báo hàng loạt – Broadcast (Admin, FE gọi)

| | |
|---|---|
| **Method** | `POST` |
| **URL** | `/notifications/broadcast` |
| **Body** | `title`, `content`, `type?`, `targetRole?`, `roomId?` |

Dùng khi admin bấm "Gửi Thông Báo (Broadcast)" trên trang Thông báo.

---

## Backend đã gửi thông báo khi nào (tham khảo)

- **Users:** approve, reject, assignTenant, unassignTenant, update (role/status)
- **Maintenance:** create, update (in_progress/completed/closed), assign
- **Bills:** create, update (status paid)
- **Payments:** confirm, vnpayIpn, create
- **Visitors:** create, checkOut
- **Messages – POST /:** Người nhận: "Tin nhắn mới" – "[Tên người gửi] đã gửi tin nhắn cho bạn."
- **Rooms – PUT /:id:** Tenant phòng: "Cập nhật phòng"
- **Rooms – DELETE /:id:** Tenant: "Phòng đã bị xóa"
- **Auth – PUT /change-password:** User: "Mật khẩu đã thay đổi"
- **Auth – POST /reset-password:** User: "Mật khẩu đã đặt lại"
- **Users – POST /:** User mới: "Tài khoản đã được tạo"
- **Payments – POST /:** Tenant: "Đã gửi thanh toán"
- **Areas – PUT /:id, DELETE /:id:** Tenant thuộc khu: "Cập nhật khu vực" / "Khu vực đã bị xóa"
- **Services – PUT /:id:** Tenant có phòng: "Cập nhật dịch vụ"

FE refetch thông báo khi vào layout, khi chuyển trang, khi focus tab, khi mở chuông, và mỗi 5s (polling) để chuông cập nhật ngay.

---

## Luồng: Tạo hóa đơn → Thông báo cho khách

| Bước | Method | URL | Mô tả |
|------|--------|-----|--------|
| 1 | **POST** | `/bills` | Admin/Chủ trọ tạo hóa đơn. Body: `roomId`, `tenantId`, `month`, `year` (bắt buộc); `prevWater`, `currWater`, `prevElec`, `currElec`, `otherAmount`, `dueDate`, `note` (tùy chọn). Sau khi tạo xong, backend **tự gửi thông báo** cho user `tenantId`. |
| 2 | **GET** | `/notifications?isRead=false` | Khách (tenant) gọi để lấy danh sách thông báo chưa đọc, trong đó có "Hóa đơn mới". Response: `{ "success": true, "data": [ ... ] }`. FE parse `data` và hiển thị trên chuông + trang Thông báo. |
| 3 | **PUT** | `/notifications/:id/read` | Khách đánh dấu đã đọc (optional). |

**Thông báo khách nhận khi có hóa đơn mới:** `title`: "Hóa đơn mới", `type`: "bill", `content`: "Bạn có hóa đơn tháng M/Y. Tổng: Xđ. Vui lòng thanh toán trước hạn."
