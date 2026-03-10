import { useLocation, Link } from 'react-router-dom'

export default function PendingApproval() {
  const location = useLocation() as { state?: { message?: string } }
  const message = location.state?.message

  return (
    <div className="form-card" style={{ maxWidth: 520 }}>
      <h1>Chờ duyệt tài khoản</h1>
      <p style={{ marginTop: '0.75rem', fontSize: '0.95rem', color: '#4b5563' }}>
        Tài khoản Google của bạn đã được ghi nhận. Quản trị viên sẽ xem xét và duyệt trước khi bạn sử dụng đầy đủ chức năng
        của SmartDorm.
      </p>
      {message && (
        <div className="alert alert-success" style={{ marginTop: '1rem' }}>
          {message}
        </div>
      )}
      <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#6b7280' }}>
        Bạn có thể đóng trang này và quay lại sau. Khi được duyệt, hãy đăng nhập lại bằng Google để vào hệ thống.
      </p>
      <p className="text-center mt-2">
        <Link to="/login" className="link">Quay lại trang đăng nhập</Link>
      </p>
    </div>
  )
}

