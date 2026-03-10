# Hướng dẫn cấu hình đăng nhập Google - SmartDorm

## Bước 1: Tạo OAuth Client ID (5 phút)

### 1.1. Mở Google Cloud Console
- Truy cập: **https://console.cloud.google.com/**
- Đăng nhập bằng tài khoản Google của bạn

### 1.2. Tạo hoặc chọn Project
- Nếu chưa có project: bấm **Select a project** → **New Project** → đặt tên "SmartDorm" → **Create**
- Nếu đã có: chọn project có sẵn

### 1.3. Nếu thấy "Google Auth Platform not configured yet"
- Bấm nút **Start setup** (màu xanh)
- Làm theo các bước để cấu hình OAuth consent screen
- Sau đó chuyển sang bước 1.4

### 1.4. Tạo OAuth Client ID
1. Vào **Credentials**: https://console.cloud.google.com/apis/credentials  
   (Nếu đang ở trang "Verification Center" → bấm **Start setup** trước, hoặc chọn **Credentials** trên menu trái)
2. Bấm **+ CREATE CREDENTIALS** → chọn **OAuth client ID**
3. Nếu lần đầu: chọn **Configure consent screen**
   - User Type: **External** → **Create**
   - App name: **SmartDorm**
   - User support email: chọn email của bạn
   - Developer contact: email của bạn
   - Bấm **Save and Continue** (3 lần) → **Back to Dashboard**
4. Quay lại **Credentials** → **+ CREATE CREDENTIALS** → **OAuth client ID**
5. Application type: **Web application**
6. Name: **SmartDorm Web**
7. **Authorized JavaScript origins** → bấm **+ ADD URI**:
   ```
   http://localhost:3000
   ```
8. Bấm **Create**
9. **Copy Client ID** (dạng: `123456789012-abc123xyz.apps.googleusercontent.com`)

---

## Bước 2: Cấu hình trong project

### 2.1. Frontend
Mở file `smartdorm-frontend/.env` và sửa dòng:
```
VITE_GOOGLE_CLIENT_ID=DÁN_CLIENT_ID_VỪA_COPY_VÀO_ĐÂY
```

### 2.2. Backend
Mở file `smartdorm-backend/.env` (nếu chưa có thì tạo mới) và thêm:
```
GOOGLE_CLIENT_ID=CÙNG_CLIENT_ID_NHƯ_TRÊN
```

---

## Bước 3: Khởi động lại

```powershell
# Terminal 1 - Backend
cd c:\Users\Admin\smartdorm-backend
npm start

# Terminal 2 - Frontend  
cd c:\Users\Admin\smartdorm-frontend
npm run dev
```

---

## Xong!

Mở http://localhost:3000/login và bấm "Đăng nhập với Google".
