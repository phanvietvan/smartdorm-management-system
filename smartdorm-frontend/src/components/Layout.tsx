import { useState, useEffect, type FormEvent } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { notificationsApi, type Notification } from '../api/notifications'

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
  
  const t = translations[lang]

  // Persist language preference
  useEffect(() => {
    const savedLang = localStorage.getItem('language') as 'vi' | 'en'
    if (savedLang && (savedLang === 'vi' || savedLang === 'en')) {
      setLang(savedLang)
    }
  }, [])

  const isAdmin = user && adminRoles.includes(user.role)
  const isPendingTenant = user && ['tenant', 'guest'].includes(user.role) && user.status !== 'approved'

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault()
    logout()
    navigate('/login')
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

  // Load unread notifications
  useEffect(() => {
    if (user && user.status === 'approved') {
      notificationsApi.getAll({ isRead: false })
        .then(res => setNotifications(res.data.filter(n => !n.isRead)))
        .catch(() => {})
    }
  }, [user])

  const handleMarkRead = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await notificationsApi.markRead(id)
      setNotifications(prev => prev.filter(n => n._id !== id))
    } catch (err) {}
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <h2>Smart<span className="text-slate-800">Dorm</span></h2>
        <nav>
          <NavLink to="/app/dashboard" end className={({ isActive }) => isActive ? 'active' : ''}>
            {t.dashboard}
          </NavLink>
          <NavLink to="/app/rooms" className={({ isActive }) => isActive ? 'active' : ''}>
            {t.rooms}
          </NavLink>
          {isAdmin && (
            <NavLink to="/app/areas" className={({ isActive }) => isActive ? 'active' : ''}>
              {t.areas}
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/app/services" className={({ isActive }) => isActive ? 'active' : ''}>
              {t.services}
            </NavLink>
          )}
          {user?.role !== 'guest' && (
            <>
              <NavLink to="/app/bills" className={({ isActive }) => isActive ? 'active' : ''}>
                {t.bills}
              </NavLink>
              <NavLink to="/app/payments" className={({ isActive }) => isActive ? 'active' : ''}>
                {t.payments}
              </NavLink>
            </>
          )}

          {user && ['admin', 'manager', 'landlord'].includes(user.role) && (
            <NavLink to="/app/users" className={({ isActive }) => isActive ? 'active' : ''}>
              {t.users}
            </NavLink>
          )}

          <div className="nav-section">{t.utilities}</div>
          {isAdmin && (
            <NavLink to="/app/visitors" className={({ isActive }) => isActive ? 'active' : ''}>
              {t.visitors}
            </NavLink>
          )}
          <NavLink to="/app/messages" className={({ isActive }) => isActive ? 'active' : ''}>
            {t.messages}
          </NavLink>
          {user?.role !== 'guest' && (
            <NavLink to="/app/maintenance" className={({ isActive }) => isActive ? 'active' : ''}>
              {t.maintenance}
            </NavLink>
          )}
        </nav>
      </aside>
      
      <main className="main">
        <header className="header bg-white px-8 py-4 flex justify-between items-center shadow-sm relative z-10">
          {/* Left side: Search */}
          <div className="flex-1 max-w-xl">
            <form onSubmit={handleSearch} className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <input 
                type="text" 
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100/70 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-700"
              />
            </form>
          </div>

          {/* Right side: Actions & Profile */}
          <div className="flex items-center gap-6">
            {/* Notification */}
            <div className="relative">
              <button 
                onClick={() => setIsNotifMenuOpen(!isNotifMenuOpen)}
                className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
                </svg>
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                    {notifications.length > 9 ? '9+' : notifications.length}
                  </span>
                )}
              </button>

              {isNotifMenuOpen && (
                <div className="absolute top-full right-0 mt-3 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-sm font-bold text-slate-800">Thông báo mới</h3>
                    <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{notifications.length} chưa đọc</span>
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-slate-500">
                        Bạn không có thông báo mới nào.
                      </div>
                    ) : (
                      notifications.map(note => (
                        <div key={note._id} className="p-4 hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => navigate('/app/notifications')}>
                          <div className="flex gap-3">
                            <div className="flex-shrink-0 mt-1">
                              <span className="w-2 h-2 rounded-full bg-indigo-600 block"></span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-slate-800 truncate">{note.title}</p>
                              <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">{note.content}</p>
                              <p className="text-[10px] text-slate-400 mt-2 font-medium">{new Date(note.createdAt).toLocaleDateString('vi-VN')}</p>
                            </div>
                            <button 
                              onClick={(e) => handleMarkRead(note._id, e)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                              title="Đánh dấu đã đọc"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  <div className="p-2 border-t border-slate-100 bg-slate-50/50">
                    <button 
                      onClick={() => { setIsNotifMenuOpen(false); navigate('/app/notifications'); }}
                      className="w-full py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                    >
                      Xem tất cả
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Language */}
            <div className="relative">
              <div 
                className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 px-2 py-1.5 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
              >
                <img 
                  src={lang === 'vi' ? "https://flagcdn.com/w20/vn.png" : "https://flagcdn.com/w20/gb.png"} 
                  alt={lang === 'vi' ? "Tiếng Việt" : "English"} 
                  className="w-6 h-4 object-cover rounded-sm shadow-sm" 
                />
                <span className="text-sm font-medium text-slate-600 hidden md:block">
                  {lang === 'vi' ? 'Tiếng Việt' : 'English'}
                </span>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {isLangMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-40 bg-white border border-slate-100 rounded-xl shadow-lg py-1 overflow-hidden">
                  <button 
                    onClick={() => handleLanguageChange('vi')}
                    className={`w-full text-left px-4 py-2 text-sm font-medium flex items-center gap-3 hover:bg-slate-50 transition-colors ${lang === 'vi' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'}`}
                  >
                    <img src="https://flagcdn.com/w20/vn.png" alt="VN" className="w-5 h-3 object-cover rounded-sm shadow-sm" />
                    Tiếng Việt
                  </button>
                  <button 
                    onClick={() => handleLanguageChange('en')}
                    className={`w-full text-left px-4 py-2 text-sm font-medium flex items-center gap-3 hover:bg-slate-50 transition-colors ${lang === 'en' ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'}`}
                  >
                    <img src="https://flagcdn.com/w20/gb.png" alt="EN" className="w-5 h-3 object-cover rounded-sm shadow-sm" />
                    English
                  </button>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative">
              <div 
                className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 px-2 py-1.5 rounded-lg transition-colors border-l border-slate-100 pl-6"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              >
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'User')}&background=c7d2fe&color=3730a3&bold=true`} 
                  alt="Avatar" 
                  className="w-10 h-10 rounded-full object-cover border-2 border-indigo-100" 
                />
                <div className="hidden md:block text-right">
                  <p className="text-sm font-bold text-slate-800 leading-tight">{user?.fullName || 'Người Dùng'}</p>
                  <p className="text-xs text-slate-500 font-medium">
                    {user?.role ? roleLabels[user.role] || user.role : 'Thành viên'}
                  </p>
                </div>
                <svg className={`w-4 h-4 text-slate-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {isProfileMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg py-1 overflow-hidden z-20">
                  <div className="px-4 py-3 border-b border-slate-100/80 mb-1 md:hidden">
                    <p className="text-sm font-bold text-slate-800 truncate">{user?.fullName || 'Người Dùng'}</p>
                    <p className="text-xs text-slate-500 font-medium truncate">
                      {user?.role ? roleLabels[user.role] || user.role : 'Thành viên'}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => { setIsProfileMenuOpen(false); navigate('/app/settings'); }}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center gap-3"
                  >
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {t.settings}
                  </button>
                  
                  <div className="h-px bg-slate-100/80 my-1 mx-2"></div>
                  
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-3"
                  >
                    <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    {t.logout}
                  </button>
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
