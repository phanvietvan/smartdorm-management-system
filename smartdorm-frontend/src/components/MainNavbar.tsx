import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Phone, Facebook, Mail, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSplash } from '../context/SplashContext'

export default function MainNavbar() {
  const { user } = useAuth()
  const { showSplash } = useSplash()
  const location = useLocation()
  const path = location.pathname
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        const currentScrollY = window.scrollY
        
        // Prevent jitter: only trigger if scroll distance is significant
        if (Math.abs(currentScrollY - lastScrollY) < 10) return

        if (currentScrollY > lastScrollY && currentScrollY > 100) { // scrolling down
          setIsVisible(false)
          setIsMenuOpen(false) // Close menu on scroll
        } else { // scrolling up
          setIsVisible(true)
        }
        setLastScrollY(currentScrollY)
      }
    }

    window.addEventListener('scroll', controlNavbar)
    return () => window.removeEventListener('scroll', controlNavbar)
  }, [lastScrollY])

  const isRooms = path === '/rooms-available'

  const navLinks = [
    { label: 'Giới thiệu', id: 'top' },
    { label: 'Vận hành', id: 'operation-core' },
    { label: 'Hệ thống', id: 'portal-command' },
    { label: 'Ứng dụng', id: 'digital-operations' }
  ]

  const handleScrollTo = (id: string) => {
    setIsMenuOpen(false)
    if (path === '/') {
      const element = document.getElementById(id)
      if (element) {
        const offset = 80 // height of navbar
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - offset
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        })
      }
    } else {
      window.location.href = `/#${id}`;
    }
  }

  return (
    <>
      <motion.nav 
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -110 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="fixed top-0 w-full z-[100] bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl shadow-[0_8px_60px_rgba(0,0,0,0.05)] border-b border-white/20 dark:border-slate-800/20 px-4 lg:px-10 pointer-events-auto"
      >
        <div className="flex justify-between items-center h-20 max-w-[1440px] mx-auto relative">
          {/* Left: Logo */}
          <div className="shrink-0 flex items-center">
            <Link 
              to="/" 
              onClick={() => showSplash(1200)}
              className="text-2xl lg:text-4xl font-black tracking-tighter text-slate-900 dark:text-white hover:text-[#4b49cb] transition-colors relative z-20"
            >
              SmartDorm
            </Link>
          </div>
          
          {/* Center: Desktop Menu */}
          <div className="flex-1 hidden md:flex justify-center px-4 overflow-hidden">
            <div className="flex gap-4 lg:gap-14 font-['Plus_Jakarta_Sans']">
              {navLinks.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleScrollTo(item.id)}
                  className="transition-all font-bold tracking-tight text-xs lg:text-sm px-2 text-on-surface-variant hover:text-primary relative group uppercase tracking-widest whitespace-nowrap"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full"></span>
                </button>
              ))}
              <Link 
                className={`transition-colors font-bold tracking-tight text-xs lg:text-sm px-2 uppercase tracking-widest whitespace-nowrap ${isRooms ? 'text-primary' : 'text-on-surface-variant hover:text-primary'}`} 
                to="/rooms-available"
              >
                Tìm phòng
              </Link>
            </div>
          </div>

          {/* Right: Actions & Hamburger */}
          <div className="shrink-0 flex justify-end items-center gap-2 lg:gap-8">
            <div className="hidden lg:flex items-center gap-6 pr-8 border-r border-[#abadb0]/20">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="p-2 rounded-xl hover:bg-[#4b49cb]/5 text-[#595c5e] dark:text-slate-400 hover:text-[#4b49cb] transition-all" title="Facebook">
                <Facebook size={18} strokeWidth={2.5} />
              </a>
              <a href="mailto:contact@smartdorm.com" className="p-2 rounded-xl hover:bg-[#4b49cb]/5 text-[#595c5e] dark:text-slate-400 hover:text-[#4b49cb] transition-all" title="Email">
                <Mail size={18} strokeWidth={2.5} />
              </a>
              <a href="tel:0123456789" className="p-2 rounded-xl hover:bg-[#4b49cb]/5 text-[#595c5e] dark:text-slate-400 hover:text-[#4b49cb] transition-all" title="Call us">
                <Phone size={18} strokeWidth={2.5} />
              </a>
            </div>
            
            {user ? (
               <div className="flex items-center gap-3 relative z-50">
                  <div className="hidden xl:flex flex-col items-end pr-2">
                    <span className="text-[9px] font-black text-[#abadb0] uppercase tracking-widest leading-none mb-1">AUTHENTICATED</span>
                    <span className="text-[11px] font-black leading-none uppercase tracking-tight text-[#2c2f31] dark:text-white truncate max-w-[120px]">{user.fullName}</span>
                  </div>
                  <Link 
                    to="/app/dashboard" 
                    className="p-1 rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#4b49cb] shadow-xl shadow-[#4b49cb]/10 hover:shadow-[#4b49cb]/20 transition-all active:scale-95 flex items-center gap-2 px-3 py-1.5 cursor-pointer relative z-[60] pointer-events-auto"
                  >
                     <div className="w-6 h-6 rounded-xl bg-[#4b49cb] text-white flex items-center justify-center font-black text-[10px] italic shadow-lg">
                       {user.fullName?.charAt(0).toUpperCase()}
                     </div>
                     <span className="text-[10px] font-black text-[#2c2f31] dark:text-white uppercase tracking-tighter hidden sm:inline">Dashboard</span>
                  </Link>
               </div>
            ) : (
              <div className="hidden sm:flex items-center gap-4 text-nowrap relative z-50">
                <Link to="/login" className="text-sm font-bold text-on-surface-variant hover:text-primary px-2 py-1">Login</Link>
                <Link 
                  to="/register" 
                  className="px-6 py-2.5 bg-primary text-white rounded-full text-xs font-black shadow-[0_10px_20px_rgba(92,89,240,0.3)] hover:shadow-primary/40 hover:scale-105 transition-all outline-none"
                >
                  Tham gia ngay
                </Link>
              </div>
            )}

            {/* Hamburger Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex md:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white transition-all active:scale-90"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 overflow-hidden"
            >
              <div className="flex flex-col p-6 gap-6">
                {navLinks.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleScrollTo(item.id)}
                    className="text-left font-black text-lg tracking-tight text-slate-700 dark:text-slate-300 hover:text-primary transition-colors uppercase"
                  >
                    {item.label}
                  </button>
                ))}
                <Link 
                  to="/rooms-available"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-left font-black text-lg tracking-tight text-primary uppercase"
                >
                  Tìm phòng
                </Link>
                {!user && (
                  <div className="flex flex-col gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <Link 
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="text-center py-4 font-black uppercase tracking-widest text-slate-600 dark:text-slate-400"
                    >
                      Đăng nhập
                    </Link>
                    <Link 
                      to="/register"
                      onClick={() => setIsMenuOpen(false)}
                      className="text-center py-4 px-6 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                    >
                      Tham gia ngay
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  )
}
