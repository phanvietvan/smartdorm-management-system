import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Rooms from './pages/Rooms'
import RoomDetail from './pages/RoomDetail'
import Bills from './pages/Bills'
import BillDetail from './pages/BillDetail'
import Payments from './pages/Payments'
import Maintenance from './pages/Maintenance'
import MaintenanceDetail from './pages/MaintenanceDetail'
import Visitors from './pages/Visitors'
import Messages from './pages/Messages'
import Areas from './pages/Areas'
import Users from './pages/Users'
import Services from './pages/Services'
import Notifications from './pages/Notifications'
import ProfileSettings from './pages/ProfileSettings'
import Home from './pages/Home'
import RoomsAvailable from './pages/RoomsAvailable'
import PendingApproval from './pages/PendingApproval'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
          </div>
        </div>
        <p className="mt-6 text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] animate-pulse">
          Đang khởi tạo hệ thống
        </p>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RequireApproved({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()

  if (user && ['tenant', 'guest'].includes(user.role) && user.status !== 'approved') {
    return (
      <div className="content">
        <div className="alert alert-error">
          Tài khoản của bạn đang <strong>chờ quản trị viên duyệt</strong>. Bạn chưa thể sử dụng chức năng này.
        </div>
      </div>
    )
  }

  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/rooms-available" element={<RoomsAvailable />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/pending-approval" element={<PendingApproval />} />
      <Route path="/app" element={<RequireAuth><Layout /></RequireAuth>}>
        <Route index element={<Navigate to="/app/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="rooms" element={<RequireApproved><Rooms /></RequireApproved>} />
        <Route path="rooms/:id" element={<RequireApproved><RoomDetail /></RequireApproved>} />
        <Route path="services" element={<RequireApproved><Services /></RequireApproved>} />
        <Route path="notifications" element={<RequireApproved><Notifications /></RequireApproved>} />
        <Route path="settings" element={<RequireAuth><ProfileSettings /></RequireAuth>} />
        <Route path="bills" element={<RequireApproved><Bills /></RequireApproved>} />
        <Route path="bills/:id" element={<RequireApproved><BillDetail /></RequireApproved>} />
        <Route path="payments" element={<RequireApproved><Payments /></RequireApproved>} />
        <Route path="maintenance" element={<RequireApproved><Maintenance /></RequireApproved>} />
        <Route path="maintenance/:id" element={<RequireApproved><MaintenanceDetail /></RequireApproved>} />
        <Route path="visitors" element={<RequireApproved><Visitors /></RequireApproved>} />
        <Route path="messages" element={<RequireApproved><Messages /></RequireApproved>} />
        <Route path="areas" element={<RequireApproved><Areas /></RequireApproved>} />
        <Route path="users" element={<RequireApproved><Users /></RequireApproved>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
