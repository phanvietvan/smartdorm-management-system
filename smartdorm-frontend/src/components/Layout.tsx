import { useState } from 'react'
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
  Plus
} from 'lucide-react'
import { cn } from '../lib/utils'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [showNotifications, setShowNotifications] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#f5f7f9] text-[#2c2f31] font-['Inter',_sans-serif] antialiased">
      {/* SideNavBar */}
      <aside className="h-screen w-64 fixed left-0 top-0 overflow-y-auto bg-[#f8fafc] flex flex-col py-6 px-4 z-50 border-r border-[#eef1f3]">
        <div className="mb-10 px-2 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#4b49cb] rounded-xl flex items-center justify-center">
            <Building2 className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#4b49cb] tracking-tighter leading-none">SmartDorm</h1>
            <p className="text-[10px] uppercase tracking-widest text-[#595c5e] font-bold opacity-70 mt-1">Editorial Admin</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {navLinks.map((link) => (
             <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium",
                  isActive 
                    ? "bg-[#eef2ff] text-[#4b49cb] border-l-4 border-[#4b49cb]" 
                    : "text-[#595c5e] hover:text-[#2c2f31] hover:bg-slate-200"
                )}
              >
                <link.icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{link.label}</span>
              </NavLink>
          ))}
        </nav>

        <div className="mt-auto px-2 space-y-3 pt-6">
          <button className="w-full bg-[#4b49cb] text-white py-3 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-[#3e3bbf] transition-colors shadow-md">
            <Plus className="w-4 h-4" />
            <span>New Entry</span>
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#595c5e] hover:bg-[#fee2e2] hover:text-[#b41340] transition-colors font-medium text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* TopNavBar */}
      <header className="fixed top-0 right-0 left-64 h-16 z-40 flex justify-between items-center px-8 bg-white/80 backdrop-blur-md border-b border-[#eef1f3]">
        <div className="flex items-center bg-[#eef1f3] px-4 py-2 rounded-xl w-80 lg:w-96 focus-within:bg-[#e5e9eb] transition-colors border border-transparent focus-within:border-slate-300">
          <Search className="text-[#595c5e] w-4 h-4 mr-2" />
          <input 
            type="text" 
            placeholder="Tìm kiếm thông tin..."
            className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none placeholder:text-[#9a9d9f] text-[#2c2f31]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-[#eef1f3] p-1 rounded-lg">
            <button className="px-3 py-1 rounded text-xs font-bold bg-white text-[#4b49cb] shadow-sm">VI</button>
            <button className="px-3 py-1 rounded text-xs font-bold text-[#595c5e] hover:bg-slate-200 transition-colors">EN</button>
          </div>

          <div className="flex items-center gap-4 border-l border-[#d9dde0] pl-6 h-10">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={cn(
                  "relative p-2.5 rounded-full transition-all duration-300",
                  showNotifications ? "bg-[#eef2ff] text-[#4b49cb] shadow-sm" : "hover:bg-slate-100 text-[#595c5e]"
                )}
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-[#b41340] rounded-full border-2 border-white animate-pulse"></span>
              </button>

              {/* Notification Fly-out */}
              <div className={cn(
                "absolute right-0 mt-3 w-96 bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-[#eef1f3] overflow-hidden z-50 transition-all duration-300 origin-top-right",
                showNotifications ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
              )}>
                <div className="p-5 border-b border-[#eef1f3] flex justify-between items-center bg-[#f8fafc]/50">
                  <h3 className="font-bold text-[#2c2f31]">Thông báo</h3>
                  <button className="text-xs font-bold text-[#4b49cb] hover:underline">Đánh dấu tất cả đã đọc</button>
                </div>
                
                <div className="max-h-[400px] overflow-y-auto">
                  {/* Notification Item: Unread */}
                  <div className="relative p-5 cursor-pointer hover:bg-[#f8fafc] transition-colors border-b border-[#f1f4f6]">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#4b49cb]"></div>
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#eef2ff] flex items-center justify-center text-[#4b49cb] flex-shrink-0">
                        <Bell className="w-5 h-5 text-[#4b49cb]" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-bold text-[#2c2f31]">Tín hiệu mới từ Tokyo Core</p>
                        <p className="text-xs text-[#595c5e] leading-relaxed">Nhóm biên tập đã đánh dấu sự thay đổi tần suất ưu tiên trong khu vực 7-B.</p>
                        <span className="text-[10px] font-bold text-[#9a9d9f] mt-2 uppercase tracking-wider">2 phút trước</span>
                      </div>
                    </div>
                  </div>

                  {/* Notification Item: System */}
                  <div className="p-5 cursor-pointer hover:bg-[#f8fafc] transition-colors border-b border-[#f1f4f6]">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
                         <Settings className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-bold text-[#2c2f31]">Hệ thống đã cập nhật</p>
                        <p className="text-xs text-[#595c5e] leading-relaxed">SmartDorm Engine v4.2.0 đã được triển khai. Các công cụ lưu trữ mới đã sẵn sàng.</p>
                        <span className="text-[10px] font-bold text-[#9a9d9f] mt-2 uppercase tracking-wider">1 giờ trước</span>
                      </div>
                    </div>
                  </div>

                  {/* Notification Item: Team */}
                  <div className="p-5 cursor-pointer hover:bg-[#f8fafc] transition-colors border-b border-[#f1f4f6]">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-[#eef1f3]">
                        <img 
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCKS59wqqdrz0byrKGWw5K3aeFgmmJatWktKVEO_78StBa2YgAMCOoqCRhBQo-NCWUsg90C9D7drLid090kYDd5ga_vQoz4IOCvKBuJgpYWzzmpCb0cex5NENGQ7FcvonUNvxKRBdunVBFStbM-IDjNh2y5LnscALizuHXu4KagHR4CjvBEBBjIf3G-3pimz75hqaRY5FMUIA-TTzFyr3lJWZVDRkYjQv1Cok1BRTVc7EY_GIeL-u4GRAibBlRWa2b_vGlhf_OoAmVo" 
                          alt="Elena"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-bold text-[#2c2f31]">Elena đã nhắc đến bạn</p>
                        <p className="text-xs text-[#595c5e] leading-relaxed">Elena đã đánh dấu mục biên tập mới của bạn là 'Sẵn sàng xét duyệt'.</p>
                        <span className="text-[10px] font-bold text-[#9a9d9f] mt-2 uppercase tracking-wider">3 giờ trước</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-[#f8fafc] text-center border-t border-[#eef1f3]">
                   <button 
                    onClick={() => {
                        setShowNotifications(false);
                        navigate('/app/notifications');
                    }}
                    className="w-full py-2.5 bg-[#4b49cb] text-white rounded-xl font-bold text-sm hover:bg-[#3e3bbf] transition-colors shadow-sm"
                   >
                    Xem tất cả thông báo
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition-colors">
              <div className="hidden md:block text-right">
                <p className="text-sm font-bold text-[#2c2f31] leading-tight">{user?.fullName || 'Tân Phạm'}</p>
                <p className="text-[10px] text-[#595c5e] font-medium">{user?.role || 'Administrator'}</p>
              </div>
              <img 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIGqMMTWK8yJGnyyKm7a732yEpjeBVDpKlZRcH6M-q9rKzY8uxWN03iPGb7z8-B8jattsl1sJVWKt5pFY4bSDbhu5eUXfo56OLAmy7aqwaOJrdYQQiGd5IbUs_NBOWt2YFmSycL_jeVgl056HTCDc1P6c8WwMrajD4CN6ybsCmraqvCXiEklCWBB38nw_PMeCaobYn3uPUK5V6izNxzDqVeekm0bJDRKiIYVnH4y2USL7cNrOIWbvpcsegf9ujYlbsEOR3e-zpAb2Y"
                className="w-9 h-9 rounded-full object-cover border border-[#e5e9eb]"
                alt="Avatar"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="ml-64 pt-24 px-8 pb-12">
         <Outlet />
      </main>
    </div>
  )
}

const navLinks = [
  { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/app/rooms', icon: Building2, label: 'Dormitories' },
  { to: '/app/users', icon: Users, label: 'Residents' },
  { to: '/app/bills', icon: ReceiptText, label: 'Invoices' },
  { to: '/app/maintenance', icon: Wrench, label: 'Maintenance' },
  { to: '/app/settings', icon: Settings, label: 'Settings' },
]
