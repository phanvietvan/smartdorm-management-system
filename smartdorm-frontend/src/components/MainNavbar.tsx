import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Phone } from 'lucide-react'
import { motion } from 'framer-motion'

export default function MainNavbar() {
  const { user } = useAuth()
  const location = useLocation()
  const path = location.pathname
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY
        
        // Prevent jitter: only trigger if scroll distance is significant
        if (Math.abs(currentScrollY - lastScrollY) < 10) return

        if (currentScrollY > lastScrollY && currentScrollY > 100) { // scrolling down
          setIsVisible(false)
        } else { // scrolling up
          setIsVisible(true)
        }
        setLastScrollY(currentScrollY)
      }
    }

    window.addEventListener('scroll', controlNavbar)
    return () => window.removeEventListener('scroll', controlNavbar)
  }, [lastScrollY])

  const isHome = path === '/'
  const isRooms = path === '/rooms-available'
  const isApps = path === '/apps'

  return (
    <motion.nav 
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -110 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed top-0 w-full z-[100] bg-white/60 dark:bg-slate-950/60 backdrop-blur-2xl shadow-[0_8px_60px_rgba(0,0,0,0.02)] border-b border-white/20 dark:border-slate-800/20 px-12 pointer-events-auto"
    >
      <div className="flex justify-between items-center h-20 max-w-7xl mx-auto relative">
        {/* Left: Logo - Limited width to prevent overlap */}
        <div className="w-fit flex items-center pr-10">
          <Link to="/" className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white hover:text-[#4b49cb] transition-colors relative z-20">
            SmartDorm
          </Link>
        </div>
        
        {/* Center: Menu - Flex-1 with justify-center to keep it centered */}
        <div className="flex-1 hidden md:flex justify-center">
          <div className="flex gap-16 lg:gap-24 font-['Plus_Jakarta_Sans']">
            <Link 
              className={`transition-colors font-bold tracking-tight text-sm px-2 ${isHome ? 'text-primary dark:text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'}`} 
              to="/"
            >
              Giới thiệu
            </Link>
            <Link 
              className={`transition-colors font-bold tracking-tight text-sm px-2 ${isRooms ? 'text-primary dark:text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'}`} 
              to="/rooms-available"
            >
              Tìm phòng
            </Link>
            <Link 
              className={`transition-colors font-bold tracking-tight text-sm px-2 ${isApps ? 'text-primary dark:text-primary border-b-2 border-primary pb-1' : 'text-on-surface-variant hover:text-primary'}`} 
              to="/apps"
            >
              Ứng dụng
            </Link>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="w-fit flex justify-end items-center gap-6 lg:gap-8 min-w-[300px]">
          <div className="hidden lg:flex items-center gap-4 pr-6 border-r border-[#abadb0]/20">
            <a href="tel:0123456789" className="p-2 rounded-xl hover:bg-[#4b49cb]/5 text-[#595c5e] dark:text-slate-400 hover:text-[#4b49cb] transition-all" title="Call us">
              <Phone size={18} strokeWidth={2.5} />
            </a>
          </div>
          {user ? (
             <div className="flex items-center gap-4 relative z-50">
                <div className="hidden xl:flex flex-col items-end">
                  <span className="text-[9px] font-black text-[#abadb0] uppercase tracking-widest leading-none mb-1">AUTHENTICATED</span>
                  <span className="text-[11px] font-black leading-none uppercase tracking-tight text-[#2c2f31] dark:text-white truncate max-w-[100px]">{user.fullName}</span>
                </div>
                <Link 
                  to="/app/dashboard" 
                  className="p-1 rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#4b49cb] shadow-xl shadow-[#4b49cb]/10 hover:shadow-[#4b49cb]/20 transition-all active:scale-95 flex items-center gap-2 px-3 py-1.5 cursor-pointer relative z-[60] pointer-events-auto"
                >
                   <div className="w-6 h-6 rounded-xl bg-[#4b49cb] text-white flex items-center justify-center font-black text-[10px] italic shadow-lg">
                     {user.fullName?.charAt(0).toUpperCase()}
                   </div>
                   <span className="text-[11px] font-black text-[#2c2f31] dark:text-white uppercase tracking-tighter">Dashboard</span>
                </Link>
             </div>
          ) : (
            <div className="flex items-center gap-4 text-nowrap relative z-50">
              <Link to="/login" className="text-sm font-bold text-on-surface-variant hover:text-primary px-2 py-1">Login</Link>
              <Link 
                to="/register" 
                className="px-6 py-2.5 bg-primary text-white rounded-full text-xs font-black shadow-[0_10px_20px_rgba(92,89,240,0.3)] hover:shadow-primary/40 hover:scale-105 transition-all outline-none"
              >
                Tham gia ngay
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  )
}
