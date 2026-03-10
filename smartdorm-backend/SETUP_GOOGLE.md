# Cấu hình đăng nhập Google

## Bước 1: Tạo OAuth Client ID

1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Vào **APIs & Services** → **Credentials**
4. Bấm **Create Credentials** → **OAuth client ID**
5. Chọn **Web application**
6. Đặt tên (ví dụ: SmartDorm)
7. **Authorized JavaScript origins**: thêm `http://localhost:3000` (và domain production khi deploy)
8. **Authorized redirect URIs**: thêm `http://localhost:3000` (Google Sign-In dùng implicit flow)
9. Bấm **Create** → copy **Client ID**

## Bước 2: Cấu hình Backend

Thêm vào file `.env`:

```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

## Bước 3: Cấu hình Frontend

Tạo file `.env` trong thư mục `smartdorm-frontend` (hoặc copy từ `.env.example`):

```
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

**Lưu ý:** Dùng cùng Client ID cho cả backend và frontend.

## Bước 4: Khởi động lại

- Restart backend: `npm start`
- Restart frontend: `npm run dev`

Sau đó nút "Đăng nhập với Google" sẽ xuất hiện trên trang Login.
