import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'linear-gradient(135deg, #1a1d29 0%, #2d3142 100%)', color: '#fff' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>SmartDorm</h1>
      <p style={{ color: '#b0b3b8', marginBottom: '2rem' }}>Hệ thống quản lý ký túc xá & nhà trọ</p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link to="/rooms-available" style={{ padding: '0.75rem 1.5rem', background: '#4f46e5', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 500 }}>
          Xem phòng trống
        </Link>
        <Link to="/login" style={{ padding: '0.75rem 1.5rem', background: 'transparent', color: '#fff', border: '1px solid #4f46e5', borderRadius: '8px', textDecoration: 'none' }}>
          Đăng nhập
        </Link>
        <Link to="/register" style={{ padding: '0.75rem 1.5rem', color: '#b0b3b8', textDecoration: 'none' }}>
          Đăng ký
        </Link>
      </div>
    </div>
  )
}
