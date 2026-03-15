# Hướng dẫn Frontend – Thông báo (chuông)

Tài liệu này nói rõ FE cần làm gì để chuông thông báo hoạt động (kể cả khi admin tạo hóa đơn → khách thấy "Hóa đơn mới").

---

## 1. Backend đã làm gì

- Khi **tạo hóa đơn** (POST /bills), backend **tự tạo thông báo** cho user có `tenantId` (tài khoản khách).
- Các hành động khác (duyệt user, gán phòng, sửa chữa, thanh toán, tin nhắn, v.v.) cũng tự tạo thông báo.
- FE **không cần** gọi thêm API nào để “gửi” thông báo khi tạo hóa đơn; chỉ cần **đọc** thông báo và hiển thị.

---

## 2. API FE cần dùng

| Mục đích | Method | URL | Header | Ghi chú |
|----------|--------|-----|--------|--------|
| Lấy danh sách thông báo (chưa đọc) | **GET** | `/notifications?isRead=false` | `Authorization: Bearer <token>` | Dùng cho chuông + số badge |
| Lấy tất cả thông báo (trang Thông báo) | **GET** | `/notifications` hoặc `?isRead=false` | `Authorization: Bearer <token>` | Có thể thêm `limit=20` |
| Đánh dấu đã đọc | **PUT** | `/notifications/:id/read` | `Authorization: Bearer <token>` | Gọi khi user click đọc / nút “Đã đọc” |

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

**Quan trọng:** Mảng thông báo nằm trong **`response.data.data`** (vì axios `res.data` = body `{ success, data }`). FE cần lấy list = `res.data.data` (hoặc `res.data?.data ?? []`).

---

## 3. FE cần làm gì (checklist)

### 3.1. Gọi API lấy thông báo

- Dùng **GET /notifications?isRead=false** với header `Authorization: Bearer <token>`.
- Chỉ gọi khi user đã đăng nhập và `user.status === 'approved'` (nếu có kiểm tra duyệt).
- Parse đúng: **list = `response.data.data`** (hoặc `(response.data as any)?.data ?? []`).

### 3.2. Khi nào gọi (refetch)

Để khách thấy thông báo “Hóa đơn mới” ngay (hoặc sớm) sau khi admin tạo hóa đơn:

1. **Khi vào app / vào layout:** Gọi GET thông báo 1 lần (trong `useEffect` phụ thuộc `user`).
2. **Khi user quay lại tab:** Lắng nghe `window` sự kiện `focus` → gọi lại GET thông báo.
3. **Polling (khuyến nghị):** Cứ khoảng **45 giây** gọi lại GET thông báo (setInterval trong `useEffect`, clear khi unmount).

Như vậy nếu admin tạo hóa đơn khi khách đang mở app, tối đa 45s sau (hoặc khi khách chuyển tab rồi quay lại) chuông sẽ có “Hóa đơn mới”.

### 3.3. Hiển thị chuông và danh sách

- **Số badge:** `notifications.length` (số thông báo chưa đọc). Có thể hiển thị "9+" nếu > 9.
- **Dropdown / list:** Map từng phần tử trong `notifications`:
  - `_id`, `title`, `content`, `type`, `createdAt`.
  - Click vào 1 thông báo có thể navigate sang trang `/app/notifications` hoặc trang chi tiết hóa đơn nếu `type === 'bill'`.
- **Đánh dấu đã đọc:** Khi user click “Đã đọc” (hoặc click vào thông báo), gọi **PUT /notifications/:id/read**, sau đó xóa item đó khỏi state (hoặc refetch list).

### 3.4. Trang “Tạo hóa đơn” (Admin)

- Gọi **POST /bills** với body đủ `roomId`, `tenantId`, `month`, `year`, ...
- **Không cần** gọi thêm API thông báo: backend đã tự gửi thông báo cho `tenantId`.
- Sau khi tạo xong có thể chỉ cần redirect / refetch danh sách hóa đơn; chuông của **tài khoản khách** sẽ tự cập nhật khi họ refetch (focus tab hoặc polling).

---

## 4. Ví dụ code (đã có trong project)

**API client** (`src/api/notifications.ts`):

```ts
notificationsApi.getAll({ isRead: false })  // GET /notifications?isRead=false
notificationsApi.markRead(id)               // PUT /notifications/:id/read
```

**Layout – load + refetch khi focus + polling:**

- Khi `user` có và đã duyệt: gọi `getAll({ isRead: false })`, set state từ `res.data.data`.
- `window.addEventListener('focus', fetchNotifications)`.
- `setInterval(fetchNotifications, 45000)` và clear khi unmount.

**Parse response:**

```ts
const list = (res.data as any)?.data ?? res.data ?? []
setNotifications(Array.isArray(list) ? list : [])
```

---

## 5. Luồng “Admin tạo hóa đơn → Khách thấy thông báo”

1. Admin (trình duyệt A): Gọi **POST /bills** → backend lưu hóa đơn và **tạo 1 bản ghi thông báo** cho `tenantId`.
2. Khách (trình duyệt B): Đang mở app, đã đăng nhập.
3. Khách có thông báo mới nhờ một trong hai:
   - **Polling:** Tối đa 45s sau, request GET /notifications trả về thông báo “Hóa đơn mới”.
   - **Refetch khi focus:** Khách chuyển sang tab khác rồi quay lại → trigger refetch → chuông cập nhật.
4. FE hiển thị số badge và list từ state `notifications` (đã lấy từ `res.data.data`).

---

## 6. Tóm tắt

- **Backend:** Tự tạo thông báo khi tạo hóa đơn (và nhiều hành động khác). FE không gọi POST /notifications khi tạo bill.
- **FE:** Gọi **GET /notifications?isRead=false** để lấy thông báo; parse **`response.data.data`**; refetch khi vào app, khi focus tab và mỗi 45s (polling); hiển thị chuông + list và **PUT /notifications/:id/read** khi đánh dấu đã đọc.

Làm đủ các bước trên thì khi admin tạo hóa đơn, tài khoản khách sẽ có thông báo (chuông) và có thể xem ngay hoặc trong vòng 45 giây / khi quay lại tab.
