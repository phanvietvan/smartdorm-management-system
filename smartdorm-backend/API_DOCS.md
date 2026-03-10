# Tài liệu API SmartDorm

**Địa chỉ gốc:** `http://localhost:5000`

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

### Tạo hóa đơn
```json
POST /bills
{
  "roomId": "...",
  "tenantId": "...",
  "month": 3,
  "year": 2025,
  "rentAmount": 2000000,
  "electricityAmount": 150000,
  "waterAmount": 50000,
  "dueDate": "2025-03-31"
}
```

### Tạo yêu cầu sửa chữa
```json
POST /maintenance
{
  "roomId": "...",
  "title": "Điều hòa hỏng",
  "description": "Không lạnh"
}
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
