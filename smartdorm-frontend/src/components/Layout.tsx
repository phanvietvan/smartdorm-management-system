import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  ReceiptText, 
  Wrench, 
  Settings, 
  LogOut,
  Search,
  Bell,
  Plus,
  ClipboardList,
  Bed,
  Receipt,
  Briefcase,
  LifeBuoy
} from 'lucide-react'
import { cn } from '../lib/utils'
import { notificationsApi } from '../api/notifications'
import NotificationItem from './NotificationItem'
import { useSocket } from '../hooks/useSocket'
import { usePushNotification } from '../hooks/usePushNotification'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { socket } = useSocket()
  usePushNotification() // Register push notifications

  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loadingNotifs, setLoadingNotifs] = useState(false)

  // Fetch initial unread count and latest 5
  const fetchCountsAndLatest = async () => {
    try {
      const [countRes, latestRes] = await Promise.all([
        notificationsApi.getUnreadCount(),
        notificationsApi.getAll({ limit: 5 })
      ])
      setUnreadCount(countRes.data?.count || 0)
      setNotifications(latestRes.data?.data || [])
    } catch (err) {
      console.error('Error fetching layout notification data:', err)
    }
  }

  useEffect(() => {
    if (user?._id) fetchCountsAndLatest()
  }, [user?._id])

  // Real-time socket listener
  useEffect(() => {
    if (!socket) return
    const handler = (newNote: any) => {
      setNotifications(prev => [newNote, ...prev].slice(0, 5))
      setUnreadCount(prev => prev + 1)
      // Optional: Play sound or show browser toast here if tab is not focused
    }
    socket.on('new_notification', handler)
    return () => { socket.off('new_notification', handler) }
  }, [socket])

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id)
      setUnreadCount(prev => Math.max(0, prev - 1))
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
    } catch (err) {
      console.error('Error marking as read:', err)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead()
      setUnreadCount(0)
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (err) {
      console.error('Error marking all as read:', err)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isAdmin = user && ['admin', 'manager', 'accountant', 'landlord'].includes(user.role)

  const navLinks = isAdmin ? [
    { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/app/rooms', icon: Building2, label: 'Ký túc xá' },
    { to: '/app/users', icon: Users, label: 'Cư dân' },
    { to: '/app/bills', icon: ReceiptText, label: 'Hóa đơn' },
    { to: '/app/maintenance', icon: Wrench, label: 'Bảo trì' },
    { to: '/app/rental-requests', icon: ClipboardList, label: 'Yêu cầu thuê' },
    { to: '/app/settings', icon: Settings, label: 'Cài đặt' },
  ] : [
    { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/app/rooms', icon: Bed, label: 'My Room' },
    { to: '/app/bills', icon: Receipt, label: 'Invoices' },
    { to: '/app/services', icon: Briefcase, label: 'Services' },
    { to: '/app/support', icon: LifeBuoy, label: 'Support' },
  ]

  return (
    <div className="min-h-screen bg-[#f5f7f9] text-[#2c2f31] font-display antialiased">
      {/* SideNavBar - Premium Editorial Style */}
      <aside className="h-screen w-72 fixed left-0 top-0 overflow-hidden bg-white flex flex-col py-8 px-5 z-50 border-r border-slate-50 shadow-[20px_0_40px_rgba(74,63,226,0.02)] transition-all">
        <div className="mb-12 px-3 flex items-center gap-4">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100 rotate-3 hover:rotate-0 transition-transform">
            <Building2 className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-primary tracking-tighter leading-none font-display">SmartDorm</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#595c5e] font-black opacity-60 mt-2">
              {isAdmin ? 'ADMIN CONSOLE' : 'TENANT PORTAL'}
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto pr-1">
          {navLinks.map((link) => (
             <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => cn(
                   "relative flex items-center gap-4 px-5 py-4 transition-all font-bold group",
                   isActive 
                    ? "text-primary" 
                    : "text-[#595c5e] hover:text-primary hover:bg-indigo-50/50 rounded-2xl"
                )}
              >
                {({ isActive }) => (
                  <>
                    <link.icon className={cn("w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110")} />
                    <span className="text-sm tracking-tight">{link.label}</span>
                    
                    {/* Right Active Indicator - Editorial Style */}
                    <div className={cn(
                      "absolute -right-[20px] top-4 bottom-4 w-1 bg-primary rounded-l-full transition-all duration-300",
                      isActive ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"
                    )}></div>
                  </>
                )}
              </NavLink>
          ))}
        </nav>

        <div className="mt-auto px-1 space-y-4 pt-8">
          <div className="p-5 bg-indigo-50/30 rounded-3xl border border-indigo-50/50">
             <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 opacity-60">Thao tác nhanh</p>
             <button className="w-full bg-white text-primary py-3.5 px-4 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all shadow-sm">
              <Plus className="w-4 h-4" />
              <span>{isAdmin ? 'Tạo mới' : 'Yêu cầu'}</span>
            </button>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-[#595c5e] hover:bg-rose-50 hover:text-rose-600 transition-all font-bold text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* TopNavBar */}
      <header className="fixed top-0 right-0 left-72 h-24 z-40 flex justify-between items-center px-10 bg-white/70 backdrop-blur-xl border-b border-indigo-50/20 shadow-sm transition-all">
        <div className="flex items-center bg-[#f5f7f9] px-6 py-3 rounded-2xl w-[400px] border border-transparent focus-within:bg-white focus-within:border-indigo-100 transition-all">
          <Search className="text-[#595c5e] w-4 h-4 mr-3 opacity-40" />
          <input 
            type="text" 
            placeholder={isAdmin ? "Tìm nhanh..." : "Tìm hóa đơn..."}
            className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none font-medium"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-8">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={cn(
                "relative p-3 rounded-2xl transition-all duration-300",
                showNotifications ? "bg-primary text-white shadow-lg shadow-indigo-200" : "hover:bg-slate-50 text-slate-400"
              )}
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white animate-pulse"></span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-5 w-96 bg-white rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-slate-50 overflow-hidden z-50 animate-in fade-in slide-in-from-top-5 duration-300">
                <div className="p-7 border-b border-slate-50 flex justify-between items-center bg-indigo-50/20">
                  <h3 className="font-black text-[#2c2f31] font-display uppercase tracking-tight">Thông báo {unreadCount > 0 && `(${unreadCount})`}</h3>
                  {unreadCount > 0 && (
                    <button onClick={handleMarkAllRead} className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Đánh dấu hết</button>
                  )}
                </div>
                
                <div className="max-h-[400px] overflow-y-auto scrollbar-hide py-2">
                  {notifications.length > 0 ? (
                    notifications.map((note, idx) => (
                      <NotificationItem 
                        key={note._id || idx} 
                        note={note} 
                        compact 
                        onMarkRead={handleMarkRead}
                      />
                    ))
                  ) : (
                    <div className="p-10 text-center">
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Hộp thư trống</p>
                    </div>
                  )}
                </div>
                
                <div className="p-6 bg-slate-50/50 text-center border-t border-slate-50">
                   <button 
                    onClick={() => { setShowNotifications(false); navigate('/app/notifications'); }}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-indigo-100"
                   >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4 cursor-pointer hover:bg-slate-50 p-2 rounded-2xl transition-all group">
            <div className="hidden lg:block text-right">
              <p className="text-sm font-black text-[#2c2f31] leading-tight font-display tracking-tight truncate max-w-[120px]">{user?.fullName}</p>
              <p className="text-[9px] text-primary font-black uppercase tracking-widest mt-0.5">{user?.role}</p>
            </div>
            <img 
              src={user?.avatarUrl || "https://ui-avatars.com/api/?name="+encodeURIComponent(user?.fullName || 'User')+"&background=6366f1&color=fff"}
              className="w-10 h-10 rounded-[1.2rem] object-cover border-2 border-white shadow-sm transition-transform group-hover:scale-105"
              alt="Avatar"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="ml-72 pt-32 px-10 pb-12 transition-all">
         <Outlet />
      </main>
    </div>
  )
}
