# Full flow thông báo – SmartDorm

Tài liệu mô tả luồng thông báo từ backend → database → API → frontend (chuông + danh sách).

---

## 1. Tổng quan luồng

```
[Hành động API] → notifyUser() hoặc POST /notifications
       ↓
  Notification.create() → MongoDB (collection: notifications)
       ↓
  User mở app / refetch / polling 45s
       ↓
  GET /notifications?isRead=false (Bearer token)
       ↓
  Frontend hiển thị chuông + số + dropdown danh sách
       ↓
  User click thông báo → PUT /notifications/:id/read → cập nhật isRead
```

---

## 2. Model thông báo (Backend)

**Collection:** `notifications`

| Field     | Type     | Mô tả                                      |
|----------|----------|--------------------------------------------|
| `userId` | ObjectId | User nhận thông báo (ref: User)            |
| `title`  | String   | Tiêu đề                                    |
| `content`| String   | Nội dung                                   |
| `type`   | String   | `system` \| `bill` \| `billing` \| `maintenance` \| `contract` \| `general` |
| `isRead` | Boolean  | Mặc định `false`                           |
| `createdAt` | Date | Thời điểm tạo                            |

---

## 3. API thông báo

| Method | URL | Auth | Mô tả |
|--------|-----|------|--------|
| **GET** | `/notifications` | Bearer | Lấy danh sách thông báo của user đăng nhập. Query: `isRead=false` (chỉ chưa đọc), `limit` (mặc định 20). |
| **POST** | `/notifications` | Bearer + quyền gửi | Tạo 1 thông báo cho 1 user. Body: `userId`, `title`, `content`, `type` (optional). |
| **PUT** | `/notifications/:id/read` | Bearer | Đánh dấu đã đọc (chỉ user sở hữu thông báo). |
| **POST** | `/notifications/broadcast` | Bearer + quyền | Gửi thông báo cho nhiều user (theo `targetRole`, `roomId`). |

**Response GET /notifications:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "userId": "...",
      "title": "Đã được duyệt",
      "content": "Tài khoản của bạn đã được quản trị viên duyệt...",
      "type": "system",
      "isRead": false,
      "createdAt": "2025-03-15T..."
    }
  ]
}
```

Frontend cần dùng **`response.data.data`** (mảng thông báo) vì backend bọc trong `{ success, data }`.

---

## 4. Khi nào backend tạo thông báo (full list)

Backend gọi `notifyUser(userId, title, content, type)` (helper trong `utils/notifyUser.js`) sau các hành động sau. Lỗi khi tạo thông báo chỉ được log, không làm fail request chính.

### 4.1. Users

| API | Điều kiện | Title | Type |
|-----|-----------|--------|------|
| `POST /users` | Admin tạo user | Tài khoản đã được tạo | system |
| `PUT /users/:id` | Đổi `status` hoặc `role` | Đã được duyệt / Đã bị từ chối / Đã được gán phòng / Đã trả phòng / Cập nhật tài khoản | system |
| `POST /users/:id/approve` | Duyệt user | Đã được duyệt | system |
| `POST \| PUT /users/:id/reject` | Từ chối user | Đã bị từ chối | system |
| `POST /users/assign-tenant` | Gán phòng cho user | Đã được gán phòng | contract |
| `POST /users/unassign-tenant` | Trả phòng | Đã trả phòng | system |

### 4.2. Phòng (Rooms)

| API | Điều kiện | Người nhận | Title | Type |
|-----|-----------|------------|--------|------|
| `PUT /rooms/:id` | Cập nhật phòng | Tenant của phòng | Cập nhật phòng | general |
| `DELETE /rooms/:id` | Xóa phòng | Tenant của phòng | Phòng đã bị xóa | system |

### 4.3. Khu vực (Areas)

| API | Điều kiện | Người nhận | Title | Type |
|-----|-----------|------------|--------|------|
| `PUT /areas/:id` | Cập nhật khu | Tất cả tenant có phòng thuộc khu | Cập nhật khu vực | general |
| `DELETE /areas/:id` | Xóa khu | Tất cả tenant có phòng thuộc khu | Khu vực đã bị xóa | system |

### 4.4. Dịch vụ (Services)

| API | Điều kiện | Người nhận | Title | Type |
|-----|-----------|------------|--------|------|
| `PUT /services/:id` | Cập nhật dịch vụ (giá, tên...) | Mọi user có phòng (tenant) | Cập nhật dịch vụ | bill |

### 4.5. Hóa đơn (Bills)

| API | Điều kiện | Người nhận | Title | Type |
|-----|-----------|------------|--------|------|
| `POST /bills` | Tạo hóa đơn | Tenant của hóa đơn | Hóa đơn mới | bill |
| `PUT /bills/:id` | Cập nhật, đặt `status = paid` | Tenant của hóa đơn | Hóa đơn đã thanh toán | bill |

### 4.6. Thanh toán (Payments)

| API | Điều kiện | Người nhận | Title | Type |
|-----|-----------|------------|--------|------|
| `POST /payments` | Tenant tạo thanh toán | Tenant đó | Đã gửi thanh toán | bill |
| `PUT /payments/:id/confirm` | Xác nhận thanh toán | Tenant của thanh toán | Thanh toán đã xác nhận | bill |
| GET `/payments/vnpay/ipn` (callback) | VNPay trả success | Tenant của hóa đơn | Thanh toán đã xác nhận | bill |

### 4.7. Sửa chữa (Maintenance)

| API | Điều kiện | Người nhận | Title | Type |
|-----|-----------|------------|--------|------|
| `POST /maintenance` | Tạo yêu cầu | User tạo (tenant) | Yêu cầu sửa chữa đã gửi | maintenance |
| `PUT /maintenance/:id` | Trạng thái → in_progress | Tenant của yêu cầu | Đang xử lý sửa chữa | maintenance |
| `PUT /maintenance/:id` | Trạng thái → completed/closed | Tenant của yêu cầu | Hoàn thành sửa chữa | maintenance |
| `PUT /maintenance/:id/assign` | Phân công nhân viên | Tenant của yêu cầu | Đã phân công sửa chữa | maintenance |

### 4.8. Khách ra vào (Visitors)

| API | Điều kiện | Người nhận | Title | Type |
|-----|-----------|------------|--------|------|
| `POST /visitors` | Đăng ký khách | Tenant của phòng | Khách vào | general |
| `PUT /visitors/:id/checkout` | Ghi nhận khách ra | Tenant của phòng | Khách đã ra | general |

### 4.9. Tin nhắn (Messages)

| API | Điều kiện | Người nhận | Title | Type |
|-----|-----------|------------|--------|------|
| `POST /messages` | Gửi tin nhắn | Người nhận (receiverId) | Tin nhắn mới | general |

### 4.10. Auth

| API | Điều kiện | Người nhận | Title | Type |
|-----|-----------|------------|--------|------|
| `PUT /auth/change-password` | Đổi mật khẩu thành công | User đổi | Mật khẩu đã thay đổi | system |
| `POST /auth/reset-password` | Đặt lại mật khẩu thành công | User reset | Mật khẩu đã đặt lại | system |

### 4.11. Gửi tay (cho Admin/FE)

| API | Điều kiện | Người nhận | Title / Content | Type |
|-----|-----------|------------|----------------|------|
| `POST /notifications` | Body: userId, title, content, type | User chỉ định | Theo body | Theo body |
| `POST /notifications/broadcast` | Body: title, content, type, targetRole, roomId | Nhiều user theo filter | Theo body | Theo body |

---

## 5. Luồng Frontend (chuông + số + đánh dấu đọc)

1. **Load lần đầu / refetch khi vào app**  
   Gọi `GET /notifications?isRead=false` (Bearer token).  
   Gán danh sách vào state từ **`response.data.data`** (mảng).

2. **Polling (ví dụ mỗi 45s)**  
   Gọi lại `GET /notifications?isRead=false` để cập nhật số thông báo và danh sách.

3. **Refetch khi tab focus**  
   Khi `window` focus, gọi lại GET để đồng bộ sau khi user dùng tab khác.

4. **Hiển thị**  
   - Số badge: `notifications.length` (chưa đọc).  
   - Dropdown/danh sách: map từng item (`_id`, `title`, `content`, `type`, `createdAt`).

5. **Đánh dấu đã đọc**  
   Khi user click thông báo (hoặc nút “Đánh dấu đã đọc”):  
   Gọi `PUT /notifications/:id/read`, sau đó xóa item đó khỏi state (hoặc refetch).

---

## 6. Helper Backend: `utils/notifyUser.js`

```js
notifyUser(userId, title, content, type = "system")
```

- Tạo 1 bản ghi `Notification` với `userId`, `title`, `content`, `type`, `isRead: false`.
- Nếu lỗi: chỉ `console.error`, không throw, không làm fail request gọi nó.

---

## 7. Checklist tích hợp FE

- [ ] Gọi GET với query `isRead=false` khi load / refetch / polling.
- [ ] Dùng **`response.data.data`** làm mảng thông báo (backend trả `{ success, data }`).
- [ ] Gửi header `Authorization: Bearer <token>` cho mọi request notifications.
- [ ] Gọi PUT `/notifications/:id/read` khi user đọc thông báo và cập nhật UI (xóa khỏi list hoặc refetch).
- [ ] (Tùy chọn) Polling ~45s và refetch khi tab focus để chuông luôn cập nhật.

Sau khi tích hợp đúng, mọi thay đổi từ các API trên sẽ xuất hiện ở chuông và danh sách thông báo trên FE.
