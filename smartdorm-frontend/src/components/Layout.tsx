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

          <div className="flex items-center gap-4 border-l border-[#d9dde0] pl-6">
            <div className="relative cursor-pointer hover:bg-slate-100 p-2 rounded-full transition-colors">
              <Bell className="text-[#595c5e] w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#b41340] rounded-full border border-white"></span>
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
