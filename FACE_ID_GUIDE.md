# 🔐 SmartDorm Face-ID System

## Hướng dẫn cài đặt và chạy hệ thống nhận diện khuôn mặt

---

## 📁 Cấu trúc dự án

```
smartdorm-management-system/
├── smartdorm-backend/          # Backend API (Node.js + Express + MongoDB)
│   ├── models/
│   │   ├── FaceData.js         # ← MỚI: Model lưu face descriptor
│   │   └── CheckinLog.js       # ← MỚI: Model lưu log check-in
│   ├── routes/
│   │   └── faceRoutes.js       # ← MỚI: API /face/register & /face/recognize
│   └── server.js               # Đã bổ sung route /face
│
├── smartdorm-frontend/          # Web App (React + Vite)
│   ├── public/models/           # ← MỚI: face-api.js AI models
│   └── src/pages/
│       └── FaceRegister.tsx     # ← MỚI: Trang đăng ký khuôn mặt
│
└── smartdorm-door-app/          # ← MỚI: Door App (HTML + JS thuần)
    ├── index.html               # Ứng dụng nhận diện mở cửa
    ├── models/                  # face-api.js AI models
    └── package.json
```

---

## 🚀 Cách chạy

### 1. Backend (Port 5000)
```bash
cd smartdorm-backend
npm start
```

### 2. Frontend - Web App (Port 5173, Đăng ký khuôn mặt)
```bash
cd smartdorm-frontend
npm run dev
```
Truy cập: http://localhost:5173 → Đăng nhập → Sidebar → **AI Security**

### 3. Door App (Port 3001, Nhận diện mở cửa)
```bash
cd smartdorm-door-app
npm start
```
Truy cập: http://localhost:3001

---

## 📡 API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|--------|
| POST | `/face/register` | Đăng ký khuôn mặt mới |
| POST | `/face/recognize` | Nhận diện khuôn mặt |
| GET | `/face/students` | Danh sách đã đăng ký |
| GET | `/face/logs` | Lịch sử check-in |

### POST /face/register
```json
{
  "name": "Nguyễn Văn A",
  "studentId": "SD-001",
  "faceDescriptor": [0.123, -0.456, ...] // 128 số
}
```

### POST /face/recognize
```json
{
  "faceDescriptor": [0.123, -0.456, ...], // 128 số
  "deviceId": "door-main" // optional
}
```

---

## 🧠 Cách hoạt động

1. **Đăng ký (APP 1):**
   - Admin nhập tên + mã cư dân
   - Chụp ảnh qua react-webcam
   - face-api.js trích xuất 128D face descriptor (TẠI BROWSER)
   - Gửi descriptor lên Backend → Lưu MongoDB

2. **Nhận diện (APP 2 - Door):**
   - Camera quét liên tục mỗi 2 giây
   - face-api.js trích xuất descriptor
   - Gửi lên Backend → So sánh Euclidean Distance với tất cả
   - Distance < 0.6 → Match → "Access Granted"
   - Distance >= 0.6 → "Access Denied"

3. **Bảo mật:**
   - KHÔNG lưu ảnh gốc trên server
   - Chỉ lưu vector 128 chiều (KHÔNG thể tái tạo ảnh)
   - Debounce 5 giây sau mỗi match → tránh spam

---

## ⚠️ Lưu ý

- Đảm bảo MongoDB đang chạy
- Cả 3 service chạy cùng lúc: Backend (5000) + Frontend (5173) + Door (3001)
- Camera phải được cấp quyền trong trình duyệt
- Ánh sáng tốt = nhận diện chính xác hơn
