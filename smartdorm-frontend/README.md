# SmartDorm Frontend

Ứng dụng web quản lý ký túc xá & nhà trọ. Project tách riêng, chạy độc lập với backend.

## Công nghệ

- React 19 + TypeScript
- Vite
- React Router
- Axios

## Chạy dự án

```bash
# Cài đặt
npm install

# Chạy dev (port 3000)
npm run dev

# Build
npm run build

# Preview build
npm run preview
```

## Cấu hình

Tạo file `.env` (copy từ `.env.example`):

```
VITE_API_URL=http://localhost:5000
```

**Lưu ý:** Backend (`smartdorm-backend`) phải chạy tại `http://localhost:5000` trước khi dùng frontend.

## Cấu trúc

- `/` - Trang chủ (công khai)
- `/rooms-available` - Phòng trống (công khai)
- `/login` - Đăng nhập
- `/register` - Đăng ký
- `/app/dashboard` - Bảng điều khiển (cần đăng nhập)
- `/app/rooms` - Danh sách phòng (cần đăng nhập)
