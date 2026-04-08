import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Home as HomeIcon, 
  ShieldCheck, 
  Zap, 
  Users, 
  CreditCard, 
  ArrowRight,
  CheckCircle2,
  Menu,
  X
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from '../components/ThemeToggle'
import AIChatBot from '../components/AIChatBot'

export default function LandingPage() {
  console.log('Rendering LandingPage at root /')
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user } = useAuth()

  const features = [
    {
      icon: <ShieldCheck className="w-8 h-8 text-indigo-500" />,
      title: "Quản lý an toàn",
      desc: "Hệ thống bảo mật cao, quản lý khách ra vào và thông tin cư dân chặt chẽ."
    },
    {
      icon: <Zap className="w-8 h-8 text-amber-500" />,
      title: "Hóa đơn tự động",
      desc: "Tự động tính toán tiền điện, nước và gửi thông báo thanh toán hàng tháng."
    },
    {
      icon: <CreditCard className="w-8 h-8 text-emerald-500" />,
      title: "Thanh toán VNPAY",
      desc: "Tích hợp cổng thanh toán trực tuyến, tiện lợi và minh bạch cho người thuê."
    },
    {
      icon: <Users className="w-8 h-8 text-rose-500" />,
      title: "Cộng đồng văn minh",
      desc: "Kết nối cư dân thông qua hệ thống tin nhắn và thông báo nội bộ."
    }
  ]

  const stats = [
    { label: "Phòng đã thuê", value: "95%" },
    { label: "Người dùng", value: "500+" },
    { label: "Hài lòng", value: "4.9/5" },
    { label: "Khu vực", value: "10+" }
  ]

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/30 selection:text-indigo-900 dark:selection:text-indigo-200 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform duration-300">
              <HomeIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter italic">
              Smart<span className="text-indigo-600">Dorm</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/rooms-available" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">Xem phòng</Link>
            <a href="#features" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-indigo-600 transition-colors">Tính năng</a>
            <ThemeToggle />
            <div className="h-6 w-px bg-slate-200 mx-2"></div>
            {user ? (
              <Link 
                to="/app/dashboard" 
                className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-full shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all active:scale-95"
              >
                Vào Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-4">
                <Link to="/login" className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors">Đăng nhập</Link>
                <Link 
                  to="/register" 
                  className="px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-full shadow-lg shadow-slate-200 hover:bg-indigo-600 hover:shadow-indigo-300 transition-all active:scale-95"
                >
                  Bắt đầu ngay
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white border-b border-slate-200 px-6 py-8 flex flex-col gap-6 shadow-xl"
          >
            <Link to="/rooms-available" className="text-lg font-bold text-slate-900">Xem phòng</Link>
            <a href="#features" className="text-lg font-bold text-slate-900">Tính năng</a>
            <div className="h-px w-full bg-slate-100"></div>
            <Link to="/login" className="text-lg font-bold text-slate-900">Đăng nhập</Link>
            <Link to="/register" className="w-full py-4 bg-indigo-600 text-white text-center font-bold rounded-2xl shadow-lg shadow-indigo-100">Đăng ký ngay</Link>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-3xl opacity-50 -z-10 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-emerald-50 rounded-full blur-3xl opacity-50 -z-10 animate-pulse"></div>

        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full mb-6">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
              </span>
              <span className="text-indigo-700 text-xs font-bold uppercase tracking-wider">Hệ thống quản lý thông minh 2024</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight mb-8">
              Nâng tầm trải nghiệm <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">ký túc xá</span> hiện đại.
            </h1>
            
            <p className="text-xl text-slate-500 font-medium leading-relaxed mb-10 max-w-xl">
              SmartDorm giúp bạn tìm kiếm không gian sống lý tưởng, quản lý hóa đơn minh bạch và kết nối cộng đồng cư dân chỉ với vài lần chạm.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/rooms-available" 
                className="group px-8 py-5 bg-indigo-600 text-white text-lg font-bold rounded-2xl shadow-xl shadow-indigo-200 hover:bg-indigo-700 hover:shadow-indigo-300 transition-all flex items-center justify-center gap-3"
              >
                Xem phòng trống
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/login" 
                className="px-8 py-5 bg-white text-slate-900 text-lg font-bold rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all flex items-center justify-center"
              >
                Đăng nhập
              </Link>
            </div>

            <div className="mt-12 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`w-12 h-12 rounded-full border-4 border-white overflow-hidden bg-slate-200`}>
                    <img src={`https://i.pravatar.cc/150?u=${i+10}`} alt="avatar" />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(i => (
                    <svg key={i} className="w-4 h-4 text-amber-500 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  ))}
                </div>
                <p className="text-sm font-bold text-slate-800">Cư dân tin dùng</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(79,70,229,0.2)] border-8 border-white">
              <img 
                src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=1000" 
                alt="Smart Dorm Interior" 
                className="w-full h-full object-cover"
              />
              {/* Overlay elements */}
              <div className="absolute bottom-8 left-8 right-8 p-6 bg-white/30 backdrop-blur-3xl rounded-3xl border border-white/40">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-bold text-lg mb-1">Standard Queen Room</h4>
                    <p className="text-white/80 text-sm font-medium">Khu A • Tầng 3</p>
                  </div>
                  <div className="px-4 py-2 bg-indigo-600 rounded-xl text-white font-black">
                    3.5tr <span className="text-[10px] font-normal opacity-80">/tháng</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 p-5 bg-white rounded-3xl shadow-xl flex items-center gap-4 border border-slate-100"
            >
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tiện ích</p>
                <p className="text-slate-900 font-black">Wi-Fi Tốc độ cao</p>
              </div>
            </motion.div>

            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-10 -left-10 p-5 bg-white rounded-3xl shadow-xl flex items-center gap-4 border border-slate-100"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">An ninh</p>
                <p className="text-slate-900 font-black">Camera 24/7</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <h3 className="text-5xl font-black text-slate-900 mb-2">{stat.value}</h3>
                <p className="text-slate-500 font-bold tracking-wide uppercase text-xs">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-base font-black text-indigo-600 uppercase tracking-[0.2em] mb-4">Tại sao chọn chúng tôi</h2>
            <p className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">Giải pháp toàn diện cho không gian sống hiện đại.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all duration-300"
              >
                <div className="mb-6 p-4 bg-slate-50 w-fit rounded-2xl group-hover:bg-indigo-50 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto relative group">
          <div className="absolute inset-0 bg-indigo-600 rounded-[3rem] shadow-2xl shadow-indigo-200 rotate-1 group-hover:rotate-0 transition-transform duration-500"></div>
          <div className="relative bg-slate-900 rounded-[3rem] p-12 md:p-24 overflow-hidden flex flex-col items-center text-center">
            {/* Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

            <motion.h2 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tight max-w-3xl leading-tight"
            >
              Sẵn sàng trải nghiệm cuộc sống tiện nghi hơn?
            </motion.h2>

            <div className="flex flex-col sm:flex-row gap-6 mt-4">
              <Link 
                to="/register" 
                className="px-10 py-5 bg-white text-slate-900 text-lg font-bold rounded-2xl shadow-lg hover:bg-slate-50 transition-all"
              >
                Đăng ký tài khoản
              </Link>
              <Link 
                to="/rooms-available" 
                className="px-10 py-5 bg-indigo-600 text-white text-lg font-bold rounded-2xl shadow-lg hover:bg-indigo-700 transition-all"
              >
                Tìm phòng ngay
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-12">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <HomeIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-slate-900 tracking-tighter italic">
                Smart<span className="text-indigo-600">Dorm</span>
              </span>
            </div>
            
            <div className="flex gap-12 text-sm font-bold text-slate-400 uppercase tracking-widest">
              <Link to="/rooms-available" className="hover:text-indigo-600 transition-colors">Về chúng tôi</Link>
              <a href="#" className="hover:text-indigo-600 transition-colors">Điều khoản</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Bảo mật</a>
              <a href="#" className="hover:text-indigo-600 transition-colors">Liên hệ</a>
            </div>

            <p className="text-slate-400 text-sm font-medium italic">
              &copy; 2024 SmartDorm. Nâng tầm sống Việt.
            </p>
          </div>
        </div>
      </footer>
      <AIChatBot />
    </div>
  )
}
