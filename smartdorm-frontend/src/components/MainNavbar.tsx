import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Phone, Facebook, Mail, Menu, X, Info, Settings, LayoutDashboard, Search, ArrowRight, User, Globe } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSplash } from '../context/SplashContext'

export default function MainNavbar() {
  const { user } = useAuth()
  const { showSplash } = useSplash()
  const location = useLocation()
  const navigate = useNavigate()
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
    { label: 'Giới thiệu', id: 'top', icon: Info },
    { label: 'Vận hành', id: 'operation-core', icon: Settings },
    { label: 'Hệ thống', id: 'portal-command', icon: LayoutDashboard },
    { label: 'Ứng dụng', id: 'digital-operations', icon: Search }
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

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-0 h-screen w-full bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl z-[150] md:hidden flex flex-col"
            >
              {/* Header inside Menu */}
              <div className="flex justify-between items-center h-20 px-6 border-b border-slate-100 dark:border-slate-800">
                <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">SmartDorm<span className="text-primary">.</span></span>
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Links Section */}
              <div className="flex-1 overflow-y-auto py-6 px-6 space-y-1">
                <p className="text-[9px] font-black text-[#abadb0] uppercase tracking-[0.3em] mb-4">Chính - Navigation</p>
                {navLinks.map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                    onClick={() => handleScrollTo(item.id)}
                    className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-primary/5 dark:hover:bg-primary/10 group transition-all"
                  >
                    <div className="flex items-center gap-3">
                       <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-400 group-hover:text-primary transition-colors">
                          <item.icon size={18} />
                       </div>
                       <span className="font-black text-lg tracking-tight text-slate-800 dark:text-slate-200 group-hover:text-primary transition-colors uppercase">{item.label}</span>
                    </div>
                    <ArrowRight size={16} className="text-slate-300 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                  </motion.button>
                ))}

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="pt-2"
                >
                  <Link 
                    to="/rooms-available"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-primary/5 text-primary"
                  >
                    <div className="p-2.5 rounded-lg bg-primary text-white">
                       <Globe size={18} />
                    </div>
                    <span className="font-black text-lg tracking-tight uppercase">Tìm phòng</span>
                  </Link>
                </motion.div>
              </div>

              {/* Bottom Section: Auth & Social */}
              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 space-y-6">
                {user ? (
                   <div className="flex items-center justify-between p-3.5 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                      <div className="flex items-center gap-3">
                        <img src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.fullName}&background=4f46e5&color=fff`} className="w-10 h-10 rounded-[0.8rem] object-cover" />
                        <div>
                          <p className="font-black text-[13px] text-slate-900 dark:text-white leading-none">{user.fullName}</p>
                          <p className="text-[9px] uppercase font-bold text-primary mt-1">{user.role}</p>
                        </div>
                      </div>
                      <Link 
                        to="/app/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        className="p-2.5 bg-primary text-white rounded-lg shadow-lg shadow-primary/20"
                      >
                        <LayoutDashboard size={18} />
                      </Link>
                   </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                     <Link 
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-center p-3.5 border-2 border-slate-200 dark:border-slate-800 rounded-xl font-black uppercase text-[10px] tracking-widest text-slate-600 dark:text-slate-400"
                      >
                        Login
                      </Link>
                      <Link 
                        to="/register"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center justify-center p-3.5 bg-primary text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20"
                      >
                        Join
                      </Link>
                  </div>
                )}

                <div className="flex justify-between items-center px-1">
                   <div className="flex gap-3">
                      <a href="#" className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-primary transition-colors border border-slate-100 dark:border-slate-800 shadow-sm"><Facebook size={16} /></a>
                      <a href="#" className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-primary transition-colors border border-slate-100 dark:border-slate-800 shadow-sm"><Mail size={16} /></a>
                      <a href="#" className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-primary transition-colors border border-slate-100 dark:border-slate-800 shadow-sm"><Phone size={16} /></a>
                   </div>
                   <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest italic">SmartDorm v2.0</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  )
}
