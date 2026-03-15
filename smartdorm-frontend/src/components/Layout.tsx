import { useState, useEffect, useRef, type FormEvent } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Lottie from 'lottie-react'
import bellAnimation from '../pages/Notification Bell.json'
import { notificationsApi, type Notification } from '../api/notifications'
import NotificationItem from './NotificationItem'

const adminRoles = ['admin', 'manager', 'landlord', 'accountant', 'security', 'maintenance_staff']

// Role Translator Map
const roleLabels: Record<string, string> = {
  admin: 'Quản trị viên',
  manager: 'Quản lý',
  landlord: 'Chủ nhà',
  accountant: 'Kế toán',
  security: 'Bảo vệ',
  maintenance_staff: 'Nhân viên bảo trì',
  tenant: 'Người thuê',
  guest: 'Khách',
}

// Translations Map
const translations = {
  vi: {
    dashboard: 'Bảng Điều Khiển',
    rooms: 'Phòng',
    areas: 'Khu Nhà',
    services: 'Dịch Vụ',
    bills: 'Hóa Đơn',
    payments: 'Thanh Toán',
    users: 'Người dùng',
    utilities: 'Tiện Ích',
    visitors: 'Khách ra vào',
    messages: 'Tin nhắn',
    maintenance: 'Sửa chữa',
    settings: 'Cài đặt',
    logout: 'Đăng xuất',
    searchPlaceholder: 'Tìm kiếm...',
    pendingAlert: 'Tài khoản của bạn đang chờ quản trị viên duyệt. Bạn chỉ có thể xem một số thông tin cơ bản.'
  },
  en: {
    dashboard: 'Dashboard',
    rooms: 'Rooms',
    areas: 'Areas',
    services: 'Services',
    bills: 'Bills',
    payments: 'Payments',
    users: 'Users',
    utilities: 'Utilities',
    visitors: 'Visitors',
    messages: 'Messages',
    maintenance: 'Maintenance',
    settings: 'Settings',
    logout: 'Logout',
    searchPlaceholder: 'Search...',
    pendingAlert: 'Your account is pending administrator approval. You can only view basic information.'
  }
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [lang, setLang] = useState<'vi' | 'en'>('vi')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [notifAllowed, setNotifAllowed] = useState(() => localStorage.getItem('notifAllowed') !== 'false')
  const [isNotifSubOpen, setIsNotifSubOpen] = useState(false)
  const profileCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const q = new URLSearchParams(location.search).get('q') || ''
    setSearchQuery(q)
  }, [location.search])

  const t = translations[lang]

  // Persist language preference
  useEffect(() => {
    const savedLang = localStorage.getItem('language') as 'vi' | 'en'
    if (savedLang && (savedLang === 'vi' || savedLang === 'en')) {
      setLang(savedLang)
    }
  }, [])

  const isAdmin = user && adminRoles.includes(user.role)
  const isPendingTenant = user && ['tenant', 'guest'].includes(user.role) && ['pending', 'rejected'].includes(user.status)

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault()
    logout()
    navigate('/login')
  }

  const setNotifOption = (allow: boolean) => {
    setNotifAllowed(allow)
    localStorage.setItem('notifAllowed', String(allow))
    setIsNotifSubOpen(false)
  }

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to a global search route or apply filtering depending on current page
      // As a UI demo, we will just alert or log this if no global search route exists
      console.log('Searching for:', searchQuery)
      // For now, let's assume we pass it to the URL query string
      navigate(`${location.pathname}?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleLanguageChange = (newLang: 'vi' | 'en') => {
    setLang(newLang)
    localStorage.setItem('language', newLang)
    setIsLangMenuOpen(false)
  }

  const fetchNotifications = () => {
    if (!user || user.status !== 'approved') return
    notificationsApi.getAll({ isRead: false })
      .then(res => setNotifications(Array.isArray(res.data) ? res.data : []))
      .catch(() => {})
  }

  useEffect(() => {
    fetchNotifications()
  }, [user])

  useEffect(() => {
    if (!user || user.status !== 'approved') return
    const onFocus = () => fetchNotifications()
    window.addEventListener('focus', onFocus)
    return () => window.removeEventListener('focus', onFocus)
  }, [user])

  useEffect(() => {
    if (!user || user.status !== 'approved') return
    const interval = setInterval(fetchNotifications, 45000)
    return () => clearInterval(interval)
  }, [user])

  // Cho phép trang khác (Bills, Users, ...) gọi làm mới chuông sau khi tạo/sửa
  useEffect(() => {
    const onRefetch = () => fetchNotifications()
    window.addEventListener('refetch-notifications', onRefetch)
    return () => window.removeEventListener('refetch-notifications', onRefetch)
  }, [user])

  const handleMarkRead = async (id: string, e?: React.MouseEvent) => {
    e?.preventDefault()
    e?.stopPropagation()
    try {
      await notificationsApi.markRead(id)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
    } catch (err) { }
  }


  return (
    <div className="layout">
      <aside className="sidebar">
        <h2 className="mb-4">SmartDorm</h2>
        <nav>
          <NavLink to="/app/dashboard" end className={({ isActive }) => isActive ? 'active' : ''}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            {t.dashboard}
          </NavLink>
          
          <NavLink to="/app/rooms" className={({ isActive }) => isActive ? 'active' : ''}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
            {t.rooms}
          </NavLink>

          <NavLink to="/app/messages" className={({ isActive }) => isActive ? 'active' : ''}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            {t.messages}
          </NavLink>

          {isAdmin && (
            <NavLink to="/app/areas" className={({ isActive }) => isActive ? 'active' : ''}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
              {t.areas}
            </NavLink>
          )}

          <div className="divider"></div>

          <NavLink to="/app/notifications" className={({ isActive }) => isActive ? 'active' : ''}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            Thông báo
          </NavLink>

          {isAdmin && (
            <NavLink to="/app/users" className={({ isActive }) => isActive ? 'active' : ''}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              {t.users}
            </NavLink>
          )}

          <NavLink to="/app/settings" className={({ isActive }) => isActive ? 'active' : ''}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            {t.settings}
          </NavLink>

          <div className="divider"></div>

          {user?.role !== 'guest' && (
            <NavLink to="/app/bills" className={({ isActive }) => isActive ? 'active' : ''}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              {t.bills}
            </NavLink>
          )}

          <NavLink to="/app/maintenance" className={({ isActive }) => isActive ? 'active' : ''}>
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.227-.276.227-.69 0-.966l-2.496-3.03M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.072 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.25L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" /></svg>
            {t.maintenance}
          </NavLink>

          <a href="#" onClick={handleLogout} className="logout-link mt-auto">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3 3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            {t.logout}
          </a>
        </nav>
      </aside>

      <main className="main">
        <header className="header bg-white px-8 py-4 flex justify-between items-center shadow-sm relative z-10">
          {/* Left side: Search */}
          <div className="flex-1 max-w-xl">
            <form onSubmit={handleSearch} className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '48px' }}
                className="w-full pr-14 py-2.5 bg-slate-100/50 border-2 border-transparent rounded-full text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-100 focus:ring-4 focus:ring-indigo-500/5 transition-all"
              />
            </form>
          </div>

          {/* Right side: Actions & Profile */}
          <div className="flex items-center gap-6">
            {/* Notification */}
            <div className="relative">
              <button
                onClick={() => {
                  const wasOpen = isNotifMenuOpen
                  setIsNotifMenuOpen(prev => !prev)
                  if (!wasOpen) {
                    // Một luồng: lấy full list + đánh dấu unread đã đọc, giữ danh sách mãi không mất
                    notificationsApi.getAll({ limit: 100 })
                      .then(fullRes => {
                        const full = fullRes.data || []
                        return notificationsApi.getAll({ isRead: false }).then(unreadRes => ({ full, unread: unreadRes.data || [] }))
                      })
                      .then(({ full, unread }) => {
                        const unreadIds = new Set(unread.map((n: Notification) => n._id))
                        unread.forEach(n => notificationsApi.markRead(n._id).catch(() => {}))
                        setNotifications(full.map(n => ({ ...n, isRead: unreadIds.has(n._id) ? true : n.isRead })))
                      })
                      .catch(() => {})
                  }
                }}
                className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <div className="w-14 h-14 flex items-center justify-center">
                  <Lottie
                    animationData={bellAnimation}
                    loop={true}
                    style={{ width: 60, height: 60 }}
                  />
                </div>
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                    {notifications.filter(n => !n.isRead).length > 9 ? '9+' : notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </button>

              {isNotifMenuOpen && (
                <div className="absolute top-full right-0 mt-3 w-96 max-w-[calc(100vw-2rem)] bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl shadow-[0_20px_60px_-15px_rgba(15,23,42,0.15)] overflow-hidden z-50 notif-dropdown-enter">
                  <div className="px-5 py-4 flex items-center justify-between gap-3 min-w-0 bg-gradient-to-r from-slate-50 via-white to-indigo-50/30 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-800 tracking-tight">Thông báo</h3>
                    {notifications.filter(n => !n.isRead).length > 0 && (
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-100/80 px-2.5 py-1 rounded-full flex-shrink-0 shadow-sm">
                        {notifications.filter(n => !n.isRead).length > 9 ? '9+' : notifications.filter(n => !n.isRead).length}
                      </span>
                    )}
                  </div>

                  <div className="max-h-[400px] overflow-y-auto bg-slate-50/30">
                    {notifications.length === 0 ? (
                      <div className="p-10 text-center">
                        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200/80 flex items-center justify-center mb-4 shadow-inner">
                          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                        </div>
                        <p className="text-sm font-medium text-slate-500">Chưa có thông báo</p>
                      </div>
                    ) : (
                      notifications.map((note, i) => (
                        <div key={note._id} onClick={() => navigate('/app/notifications')}>
                          <NotificationItem
                            note={note}
                            onMarkRead={(id) => handleMarkRead(id)}
                            compact
                          />
                        </div>
                      ))
                    )}
                  </div>

                  <div className="p-3 border-t border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100/50 flex gap-2 min-w-0">
                    <button
                      type="button"
                      onClick={() => loadNotifications()}
                      className="flex-1 py-2.5 text-sm font-semibold text-slate-600 hover:bg-white/80 hover:shadow-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      Làm mới
                    </button>
                    <button
                      onClick={() => { setIsNotifMenuOpen(false); navigate('/app/notifications'); }}
                      className="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25 rounded-xl transition-all duration-200"
                    >
                      Xem tất cả
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Language Selection */}
            <div className="relative">
              <button
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all group"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              >
                <div className="text-slate-500 group-hover:text-blue-600 transition-colors">
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </div>
                <span className="text-[13px] font-bold text-slate-700 uppercase tracking-wide">
                  {lang}
                </span>
                <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isLangMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isLangMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-44 bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-2xl shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)] py-2 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                  <button
                    onClick={() => handleLanguageChange('vi')}
                    className={`w-full px-4 py-2.5 text-[13px] font-bold flex items-center justify-between hover:bg-blue-50/50 transition-colors ${lang === 'vi' ? 'text-blue-600 bg-blue-50/30' : 'text-slate-600'}`}
                  >
                    <div className="flex items-center gap-3">
                      <img src="https://flagcdn.com/w20/vn.png" alt="VN" className="w-5 h-3.5 object-cover rounded shadow-sm opacity-90" />
                      Tiếng Việt
                    </div>
                    {lang === 'vi' && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                  </button>
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`w-full px-4 py-2.5 text-[13px] font-bold flex items-center justify-between hover:bg-blue-50/50 transition-colors ${lang === 'en' ? 'text-blue-600 bg-blue-50/30' : 'text-slate-600'}`}
                  >
                    <div className="flex items-center gap-3">
                      <img src="https://flagcdn.com/w20/gb.png" alt="EN" className="w-5 h-3.5 object-cover rounded shadow-sm opacity-90" />
                      English
                    </div>
                    {lang === 'en' && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                  </button>
                </div>
              )}
            </div>

            {/* Profile: trỏ vào thì menu tự nhảy ra (hover), click vẫn mở/đóng */}
            <div
              className="relative"
              onMouseEnter={() => {
                if (profileCloseTimerRef.current) {
                  clearTimeout(profileCloseTimerRef.current)
                  profileCloseTimerRef.current = null
                }
                setIsProfileMenuOpen(true)
              }}
              onMouseLeave={() => {
                profileCloseTimerRef.current = setTimeout(() => {
                  setIsProfileMenuOpen(false)
                  setIsNotifSubOpen(false)
                  profileCloseTimerRef.current = null
                }, 180)
              }}
            >
              <button
                type="button"
                className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 px-3 py-2 rounded-xl transition-colors border border-transparent hover:border-slate-100"
                onClick={() => setIsProfileMenuOpen((v) => !v)}
              >
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=4f46e5&color=fff&bold=true`}
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover border-2 border-indigo-100"
                />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-bold text-slate-800 leading-tight">{user?.fullName || 'Người Dùng'}</p>
                  <p className="text-xs text-slate-500 font-medium truncate max-w-[140px]">{user?.email || ''}</p>
                </div>
                <svg className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isProfileMenuOpen && (
                <div className="absolute top-full right-0 mt-3 w-[278px] bg-white rounded-2xl shadow-[4px_8px_32px_0_rgba(0,0,0,0.12)] overflow-visible z-[100] border border-slate-100/80 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Header: avatar + name + email */}
                  <div className="flex flex-col items-start gap-4 px-5 pt-5 pb-4">
                    <div className="flex items-center gap-3.5 w-full min-w-0">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=4f46e5&color=fff&bold=true&size=140`}
                        alt=""
                        className="rounded-full w-12 h-12 flex-shrink-0 object-cover ring-2 ring-slate-100"
                      />
                      <div className="flex flex-col justify-center items-start min-w-0 flex-1 gap-px">
                        <p className="text-[#1F2937] font-semibold text-[13px] leading-tight truncate w-full">{user?.fullName || 'Người dùng'}</p>
                        <p className="text-[#6B7280] text-xs leading-tight truncate w-full">{user?.email || ''}</p>
                      </div>
                    </div>
                    <div className="bg-[#E5E7EB] w-full h-px" />
                  </div>
                  {/* Menu - cân chỉnh icon/chữ/lề thống nhất */}
                  <div className="flex flex-col gap-0.5 px-3 pb-4 pt-0.5">
                    <button
                      onClick={() => { setIsProfileMenuOpen(false); navigate('/app/settings'); }}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-[#F9FAFB] w-full hover:bg-[#EEF1F5] transition-all duration-200 text-left group"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#1F2937] group-hover:text-indigo-600 transition-colors" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21C20 19.6044 20 18.9067 19.8278 18.3389C19.44 17.0605 18.4395 16.06 17.1611 15.6722C16.5933 15.5 15.8956 15.5 14.5 15.5H9.5C8.10444 15.5 7.40665 15.5 6.83886 15.6722C5.56045 16.06 4.56004 17.0605 4.17224 18.3389C4 18.9067 4 19.6044 4 21M16.5 7.5C16.5 9.98528 14.4853 12 12 12C9.51472 12 7.5 9.98528 7.5 7.5C7.5 5.01472 9.51472 3 12 3C14.4853 3 16.5 5.01472 16.5 7.5Z" />
                      </svg>
                      <span className="text-[#1F2937] font-medium text-[13px] leading-5 flex-1 text-left">Hồ sơ của tôi</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#6B7280]" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18L15 12L9 6" />
                      </svg>
                    </button>
                    <button
                      onClick={() => { setIsProfileMenuOpen(false); navigate('/app/settings'); }}
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-[#F9FAFB] w-full hover:bg-[#EEF1F5] transition-all duration-200 text-left group"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#1F2937] group-hover:text-indigo-600 transition-colors" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" />
                        <path d="M18.7273 14.7273C18.6063 15.0015 18.5702 15.3056 18.6236 15.6005C18.6771 15.8954 18.8177 16.1676 19.0273 16.3818L19.0818 16.4364C19.2509 16.6052 19.385 16.8057 19.4765 17.0265C19.568 17.2472 19.6151 17.4838 19.6151 17.7227C19.6151 17.9617 19.568 18.1983 19.4765 18.419C19.385 18.6397 19.2509 18.8402 19.0818 19.0091C18.913 19.1781 18.7124 19.3122 18.4917 19.4037C18.271 19.4952 18.0344 19.5423 17.7955 19.5423C17.5565 19.5423 17.3199 19.4952 17.0992 19.4037C16.8785 19.3122 16.678 19.1781 16.5091 19.0091L16.4545 18.9545C16.2403 18.745 15.9682 18.6044 15.6733 18.5509C15.3784 18.4974 15.0742 18.5335 14.8 18.6545C14.5311 18.7698 14.3018 18.9611 14.1403 19.205C13.9788 19.4489 13.8921 19.7347 13.8909 20.0273V20.1818C13.8909 20.664 13.6994 21.1265 13.3584 21.4675C13.0174 21.8084 12.5549 22 12.0727 22C11.5905 22 11.1281 21.8084 10.7871 21.4675C10.4461 21.1265 10.2545 20.664 10.2545 20.1818V20.1C10.2475 19.7991 10.1501 19.5073 9.97501 19.2625C9.79991 19.0176 9.55521 18.8312 9.27273 18.7273C8.99853 18.6063 8.69437 18.5702 8.39947 18.6236C8.10456 18.6771 7.83244 18.8177 7.61818 19.0273L7.56364 19.0818C7.39478 19.2509 7.19425 19.385 6.97353 19.4765C6.7528 19.568 6.51621 19.6151 6.27727 19.6151C6.03834 19.6151 5.80174 19.568 5.58102 19.4765C5.36029 19.385 5.15977 19.2509 4.99091 19.0818C4.82186 18.913 4.68775 18.7124 4.59626 18.4917C4.50476 18.271 4.45766 18.0344 4.45766 17.7955C4.45766 17.5565 4.50476 17.3199 4.59626 17.0992C4.68775 16.8785 4.82186 16.678 4.99091 16.5091L5.04545 16.4545C5.25503 16.2403 5.39562 15.9682 5.4491 15.6733C5.50257 15.3784 5.46647 15.0742 5.34545 14.8C5.23022 14.5311 5.03887 14.3018 4.79497 14.1403C4.55107 13.9788 4.26526 13.8921 3.97273 13.8909H3.81818C3.33597 13.8909 2.87351 13.6994 2.53253 13.3584C2.19156 13.0174 2 12.5549 2 12.0727C2 11.5905 2.19156 11.1281 2.53253 10.7871C2.87351 10.4461 3.33597 10.2545 3.81818 10.2545H3.9C4.2009 10.2475 4.49273 10.1501 4.73754 9.97501C4.98236 9.79991 5.16883 9.55521 5.27273 9.27273C5.39374 8.99853 5.42984 8.69437 5.37637 8.39947C5.3229 8.10456 5.18231 7.83244 4.97273 7.61818L4.91818 7.56364C4.74913 7.39478 4.61503 7.19425 4.52353 6.97353C4.43203 6.7528 4.38493 6.51621 4.38493 6.27727C4.38493 6.03834 4.43203 5.80174 4.52353 5.58102C4.61503 5.36029 4.74913 5.15977 4.91818 4.99091C5.08704 4.82186 5.28757 4.68775 5.50829 4.59626C5.72901 4.50476 5.96561 4.45766 6.20455 4.45766C6.44348 4.45766 6.68008 4.50476 6.9008 4.59626C7.12152 4.68775 7.32205 4.82186 7.49091 4.99091L7.54545 5.04545C7.75971 5.25503 8.03183 5.39562 8.32674 5.4491C8.62164 5.50257 8.9258 5.46647 9.2 5.34545H9.27273C9.54161 5.23022 9.77093 5.03887 9.93245 4.79497C10.094 4.55107 10.1807 4.26526 10.1818 3.97273V3.81818C10.1818 3.33597 10.3734 2.87351 10.7144 2.53253C11.0553 2.19156 11.5178 2 12 2C12.4822 2 12.9447 2.19156 13.2856 2.53253C13.6266 2.87351 13.8182 3.33597 13.8182 3.81818V3.9C13.8193 4.19253 13.906 4.47834 14.0676 4.72224C14.2291 4.96614 14.4584 5.15749 14.7273 5.27273C15.0015 5.39374 15.3056 5.42984 15.6005 5.37637C15.8954 5.3229 16.1676 5.18231 16.3818 4.97273L16.4364 4.91818C16.6052 4.74913 16.8057 4.61503 17.0265 4.52353C17.2472 4.43203 17.4838 4.38493 17.7227 4.38493C17.9617 4.38493 18.1983 4.43203 18.419 4.52353C18.6397 4.61503 18.8402 4.74913 19.0091 4.91818C19.1781 5.08704 19.3122 5.28757 19.4037 5.50829C19.4952 5.72901 19.5423 5.96561 19.5423 6.20455C19.5423 6.44348 19.4952 6.68008 19.4037 6.9008C19.3122 7.12152 19.1781 7.32205 19.0091 7.49091L18.9545 7.54545C18.745 7.75971 18.6044 8.03183 18.5509 8.32674C18.4974 8.62164 18.5335 8.9258 18.6545 9.2V9.27273C18.7698 9.54161 18.9611 9.77093 19.205 9.93245C19.4489 10.094 19.7347 10.1807 20.0273 10.1818H20.1818C20.664 10.1818 21.1265 10.3734 21.4675 10.7144C21.8084 11.0553 22 11.5178 22 12C22 12.4822 21.8084 12.9447 21.4675 13.2856C21.1265 13.6266 20.664 13.8182 20.1818 13.8182H20.1C19.8075 13.8193 19.5217 13.906 19.2778 14.0676C19.0339 14.2291 18.8425 14.4584 18.7273 14.7273Z" />
                      </svg>
                      <span className="text-[#1F2937] font-medium text-[13px] leading-5 flex-1 text-left">{t.settings}</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#6B7280]" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18L15 12L9 6" />
                      </svg>
                    </button>
                    {/* Notification: khi hover vào "Allow" hiện dropdown Bật / Tắt */}
                    <div className="relative flex items-center gap-2.5 px-3 py-2.5 rounded-lg w-full">
                      <button
                        type="button"
                        onClick={() => { setIsProfileMenuOpen(false); navigate('/app/notifications'); }}
                        className="flex items-center gap-2.5 text-left flex-1 min-w-0"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#1F2937]" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9.35419 21C10.0593 21.6224 10.9856 22 12 22C13.0145 22 13.9407 21.6224 14.6458 21M18 8C18 6.4087 17.3679 4.88258 16.2427 3.75736C15.1174 2.63214 13.5913 2 12 2C10.4087 2 8.8826 2.63214 7.75738 3.75736C6.63216 4.88258 6.00002 6.4087 6.00002 8C6.00002 11.0902 5.22049 13.206 4.34968 14.6054C3.61515 15.7859 3.24788 16.3761 3.26134 16.5408C3.27626 16.7231 3.31488 16.7926 3.46179 16.9016C3.59448 17 4.19261 17 5.38887 17H18.6112C19.8074 17 20.4056 17 20.5382 16.9016C20.6852 16.7926 20.7238 16.7231 20.7387 16.5408C20.7522 16.3761 20.3849 15.7859 19.6504 14.6054C18.7795 13.206 18 11.0902 18 8Z" />
                        </svg>
                        <span className="text-[#1F2937] font-medium text-[13px] leading-5">Thông báo</span>
                      </button>
                      <div
                        className="relative"
                        onMouseEnter={() => setIsNotifSubOpen(true)}
                        onMouseLeave={() => setIsNotifSubOpen(false)}
                      >
                        <button
                          type="button"
                          onClick={() => setIsNotifSubOpen((v) => !v)}
                          className="px-2.5 py-1 rounded-md text-[#4B5563] font-medium text-xs hover:bg-slate-100 hover:text-[#1F2937] transition-all duration-200 shrink-0"
                        >
                          {notifAllowed ? 'Bật' : 'Tắt'}
                        </button>
                        {isNotifSubOpen && (
                          <div className="absolute right-0 top-full mt-1 min-w-[100px] py-1.5 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-[110] animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                            <button
                              type="button"
                              onClick={() => setNotifOption(true)}
                              className={`w-full px-3 py-2 text-left text-[13px] font-medium transition-colors ${notifAllowed ? 'bg-indigo-50 text-indigo-700' : 'text-[#1F2937] hover:bg-slate-50'}`}
                            >
                              Bật
                            </button>
                            <button
                              type="button"
                              onClick={() => setNotifOption(false)}
                              className={`w-full px-3 py-2 text-left text-[13px] font-medium transition-colors ${!notifAllowed ? 'bg-indigo-50 text-indigo-700' : 'text-[#1F2937] hover:bg-slate-50'}`}
                            >
                              Tắt
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 px-3 py-2.5 w-full rounded-lg hover:bg-[#F9FAFB] transition-all duration-200 text-left group"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#1F2937] group-hover:text-rose-500 transition-colors" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 8L22 12M22 12L18 16M22 12H9M15 4.20404C13.7252 3.43827 12.2452 3 10.6667 3C5.8802 3 2 7.02944 2 12C2 16.9706 5.8802 21 10.6667 21C12.2452 21 13.7252 20.5617 15 19.796" />
                      </svg>
                      <span className="text-[#1F2937] font-medium text-[13px] leading-5 group-hover:text-rose-500 transition-colors">{t.logout}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="content">
          {isPendingTenant && (
            <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
              {t.pendingAlert}
            </div>
          )}
          <Outlet />
        </div>
      </main>
    </div>
  )
}
