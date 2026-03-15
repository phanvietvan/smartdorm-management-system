# Hướng dẫn Frontend – Thông báo (chuông)

Tài liệu này nói rõ FE cần làm gì để chuông thông báo hoạt động (kể cả khi admin tạo hóa đơn → khách thấy "Hóa đơn mới").

---

## 1. Backend đã làm gì

- Khi **tạo hóa đơn** (POST /bills), backend **tự tạo thông báo** cho user có `tenantId` (tài khoản khách).
- Các hành động khác (duyệt user, gán phòng, sửa chữa, thanh toán, tin nhắn, v.v.) cũng tự tạo thông báo.
- FE **không cần** gọi thêm API nào để "gửi" thông báo khi tạo hóa đơn; chỉ cần **đọc** thông báo và hiển thị.

---

## 2. API FE cần dùng

| Mục đích | Method | URL | Header | Ghi chú |
|----------|--------|-----|--------|--------|
| Lấy danh sách thông báo (chưa đọc) | **GET** | `/notifications?isRead=false` | `Authorization: Bearer <token>` | Dùng cho chuông + số badge |
| Lấy tất cả thông báo (trang Thông báo) | **GET** | `/notifications` hoặc `?isRead=false` | `Authorization: Bearer <token>` | Có thể thêm `limit=20` |
| Đánh dấu đã đọc | **PUT** | `/notifications/:id/read` | `Authorization: Bearer <token>` | Gọi khi user click đọc / nút "Đã đọc" |

**Response GET /notifications:**

Backend trả về dạng:

```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "userId": "...",
      "title": "Hóa đơn mới",
      "content": "Bạn có hóa đơn tháng 3/2025. Tổng: 2.500.000đ...",
      "type": "bill",
      "isRead": false,
      "createdAt": "2025-03-15T10:00:00.000Z"
    }
  ]
}
```

**Quan trọng:** Mảng thông báo nằm trong **`response.data.data`** (vì axios `res.data` = body `{ success, data }`). FE cần lấy list = `res.data.data` (hoặc `res.data?.data ?? []`). Trong code: `src/api/notifications.ts` dùng `parseNotificationList(res)` để lấy đúng list từ `body?.data ?? body?.notifications`.

---

## 3. FE đã làm

- **Layout (chuông):** Gọi GET `/notifications?isRead=false` khi load, khi chuyển trang, khi focus tab, khi mở dropdown chuông, và polling 5s. Hiển thị số badge = số thông báo chưa đọc; click mở dropdown hoặc đi tới trang Thông báo.
- **Trang Thông báo:** Gọi GET `/notifications` **không truyền `isRead`** (lấy **tất cả lịch sử** từ DB), có thể thêm `limit=100`. Gọi khi vào trang, khi focus, khi nhận event `refetch-notifications`, polling 5s, và nút "Làm mới". Hiển thị danh sách; click đánh dấu đọc → PUT `/notifications/:id/read`.
- **Sau khi tạo hóa đơn (Bills):** Dispatch event `refetch-notifications` để chuông/trang Thông báo có thể refetch ngay (nếu đang mở).

---

## 4. Gửi thông báo hàng loạt (Broadcast)

**FE:** Chỉ **admin** và **chủ (landlord)** mới thấy nút "Gửi Thông Báo (Broadcast)" và gọi **POST `/notifications/broadcast`** với body: `title`, `content`, `type`, `targetRole` (optional). Header: `Authorization: Bearer <token>`.

**Yêu cầu Backend:** API **POST `/notifications/broadcast`** phải **cho phép** user có role **`admin`**, **`manager`** hoặc **`landlord`** (chủ trọ). Nếu backend trả "Bạn không có quyền thực hiện thao tác này" thì cần cấu hình middleware/controller cho phép các role trên gọi broadcast.
