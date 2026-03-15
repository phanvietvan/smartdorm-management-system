# Backend: API Thông báo

| Method | URL | Trạng thái | Mô tả |
|--------|-----|------------|--------|
| PUT | `/notifications/:id/read` | ✅ | Đánh dấu đã đọc |
| POST | `/notifications/broadcast` | ✅ | Gửi thông báo hàng loạt. Tenant dùng khi `targetRole` = admin/landlord cho **báo sự cố, thanh toán, tin nhắn**. Xem mục **API Broadcast** bên dưới. |

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
| `tenant` (và role khác không phải admin/manager/landlord) | Chỉ khi body có `targetRole` là `admin` hoặc `landlord` (gửi thông báo cho admin/chủ trọ). FE gọi khi: báo cáo sự cố, gửi thanh toán, gửi tin nhắn. |
| Khác | 403 *"Bạn không có quyền thực hiện thao tác này."* |

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

FE gọi **hai lần** (targetRole: admin + landlord). Có thể dùng `type: "bill"` (thanh toán) hoặc `type: "general"` (tin nhắn) hoặc `type: "maintenance"` (báo sự cố). Backend tạo **từng bản ghi** cho từng user thuộc targetRole (mỗi admin/landlord một document với `userId` = user đó) → admin/landlord thấy trong chuông và trang Thông báo khi gọi GET /notifications.

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

**Response 201:**
```json
{
  "success": true,
  "message": "Đã gửi thông báo tới 5 người dùng"
}
```

---

## Backend đảm bảo – Admin nhận thông báo như người dùng

Backend đã đảm bảo (code + comment trong API):

1. **POST /notifications/broadcast**  
   Tạo **một bản ghi thông báo cho từng user** thuộc targetRole. Mỗi bản ghi có **userId = _id** của từng admin/landlord (giống gửi cho từng tenant). Comment: *"Mỗi admin/landlord/tenant nhận một bản ghi riêng, userId = _id của người nhận → admin thấy trong chuông và trang Thông báo như tenant"*.

2. **GET /notifications**  
   Chỉ trả về thông báo có **userId = user đang đăng nhập** (`req.user._id`), chuẩn hóa ObjectId. Không phân biệt role: admin và tenant đều chỉ nhận đúng danh sách của mình. Comment: *"Cho mọi user (admin, tenant, landlord, ...): chỉ trả về thông báo có userId/recipient = user đang đăng nhập"*.

3. **PUT /notifications/:id/read**  
   Dùng cùng cách chuẩn hóa userId (ObjectId) khi so khớp; chỉ user sở hữu mới đánh dấu được.

4. **Role admin trong DB**  
   Broadcast với `targetRole: 'admin'` tìm user có role `admin` hoặc `manager` (regex không phân biệt hoa thường).

**Nếu admin vẫn không thấy thông báo:** Bấm "Làm mới" trên chuông hoặc mở Trung tâm Thông báo; kiểm tra backend đã tạo từng bản ghi cho từng admin/landlord (response "Đã gửi thông báo tới N người" với N > 0).

---

## Troubleshooting – Admin vẫn không thấy thông báo khi tenant báo sự cố

Xem mục **Backend đảm bảo** ở trên.

**Kiểm tra khi admin vẫn không thấy thông báo sau khi tenant báo sự cố:**
1. **Tenant báo sự cố** → Mở DevTools (F12) → tab **Console**. Nếu thấy `Broadcast to admin failed: 403` thì backend đang từ chối tenant gọi POST /notifications/broadcast (cần cho phép tenant khi targetRole là admin/landlord).
2. **Tab Network:** Khi tenant gửi form, kiểm tra 2 request POST `/notifications/broadcast` (targetRole: admin và landlord). Response phải **201** và body có "Đã gửi thông báo tới N người" với **N > 0**.
3. **Đăng nhập admin** → Gọi GET `/notifications` (hoặc bấm "Làm mới" trên chuông). Response phải có `data: [ ... ]` chứa ít nhất một thông báo có title "Báo cáo sự cố mới" và userId trùng admin đang đăng nhập.

---

## Các yêu cầu từ người dùng → thông báo tới admin & chủ trọ (FE đã gửi)

| Hành động từ người dùng | FE gửi broadcast (targetRole: admin + landlord) |
|-------------------------|--------------------------------------------------|
| **Báo sự cố** (Maintenance – tenant gửi yêu cầu sửa chữa) | `title`: "Báo cáo sự cố mới", `type`: maintenance |
| **Gửi thanh toán** (Payments – tenant tạo thanh toán) | `title`: "Yêu cầu thanh toán mới", `type`: bill |
| **Gửi tin nhắn** (Messages – tenant/nhân viên gửi tin nhắn) | `title`: "Tin nhắn mới", `type`: general, nội dung trích từ tin nhắn |

Backend cần cho phép **tenant** (và các role tương tự) gọi POST `/notifications/broadcast` khi body có `targetRole: 'admin'` hoặc `'landlord'` cho **cả ba** luồng trên (không chỉ báo sự cố).
