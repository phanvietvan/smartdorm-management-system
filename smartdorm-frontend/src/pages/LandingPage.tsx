import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Zap,
  Users,
  Lock,
  Eye,
  Activity,
  ShieldCheck,
  Cpu,
  Shield,
  Globe
} from 'lucide-react'
import Lottie from 'lottie-react'
import appleAnimation from '../assets/apple-download.json'
import playstoreAnimation from '../assets/playstore.json'
import dashboardAnimation from '../assets/portal-desktop-animation.json'
import uiuxAnimation from '../assets/workflow-isometric-animation.json'
import securityAnimation from '../assets/security.json'
import cctvAnimation from '../assets/cctv.json'
import AIChatBot from '../components/AIChatBot'
import MainNavbar from '../components/MainNavbar'
import BackToTop from '../components/BackToTop'

// Assets from the provided HTML
const HERO_BG = "https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&q=80&w=2000"

export default function LandingPage() {


  return (
    <div className="min-h-screen bg-[#f5f6f9] dark:bg-slate-950 text-[#2c2f31] dark:text-slate-100 font-['Plus_Jakarta_Sans'] selection:bg-[#4b49cb]/10 selection:text-[#4b49cb] overflow-x-hidden antialiased">
      
      <MainNavbar />

      <main>
        {/* Hero Section */}
        <header id="top" className="relative h-screen flex items-center justify-center px-6 bg-[#f5f6f9] dark:bg-slate-950 overflow-hidden">
          <div className="absolute inset-0 z-0 overflow-hidden text-slate-200">
            <img className="w-full h-full object-cover opacity-100 transition-opacity duration-1000" src={HERO_BG} alt="Hero Background" />
            {/* Minimal Bottom Fade only for transition */}
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#f5f6f9] dark:from-slate-950 to-transparent"></div>
          </div>
          
          <div className="relative z-10 max-w-5xl text-center space-y-6 pt-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#cbceff]/60 dark:bg-indigo-900/40 text-[#192490] dark:text-indigo-200 border border-[#4b49cb]/20"
            >
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Hệ sinh thái SmartDorm</span>
            </motion.div>
            
            <div className="space-y-0 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <motion.h1 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-6xl md:text-8xl font-black tracking-tighter text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.3)] leading-tight py-2"
              >
                Cách mạng Quản lý<br/>
                <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#6e6bff] to-[#e056b3] px-2 py-4 -my-4">SmartDorm.</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-xl mx-auto text-white/80 dark:text-slate-400 text-sm md:text-lg font-bold italic tracking-tight pt-2 drop-shadow-md"
              >
                Kiến tạo không gian sống thông minh,<br className="hidden md:block"/> tối ưu vận hành & nâng tầm trải nghiệm.
              </motion.p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col md:flex-row gap-4 justify-center pt-8"
            >
              <Link to="/rooms-available" className="px-12 py-4.5 bg-primary text-white rounded-full font-black text-lg shadow-2xl shadow-primary/20 hover:scale-[1.05] active:scale-95 transition-all outline-none flex items-center justify-center">
                Tìm phòng ngay
              </Link>
              <Link to="/register" className="px-12 py-4.5 bg-slate-900/40 backdrop-blur-xl border border-white/10 text-white rounded-full font-bold text-lg hover:bg-slate-900/60 hover:scale-[1.05] hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all text-center flex items-center justify-center outline-none">
                Hợp tác cho chủ nhà
              </Link>
            </motion.div>
          </div>

          {/* Upsized Slender Pill Stats Card */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 z-20">
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: 'spring', damping: 20 }}
              className="bg-white/70 dark:bg-slate-950/70 backdrop-blur-3xl rounded-full py-4 px-10 shadow-[0_30px_60px_rgba(0,0,0,0.15)] border border-white/40 dark:border-slate-800/50"
            >
              <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-slate-500/10">
                <div className="flex items-center gap-4 px-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Zap size={18} strokeWidth={2.5} />
                  </div>
                  <div className="space-y-0 text-left">
                    <p className="text-[9px] text-primary font-black tracking-widest uppercase mb-0.5">Hiệu suất</p>
                    <p className="text-2xl font-black tracking-tighter text-on-surface leading-none">+45%</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 px-6">
                  <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                    <Users size={18} strokeWidth={2.5} />
                  </div>
                  <div className="space-y-0 text-left">
                    <p className="text-[9px] text-secondary font-black tracking-widest uppercase mb-0.5">Cư dân</p>
                    <p className="text-2xl font-black tracking-tighter text-on-surface leading-none">2k+</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 px-6">
                  <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary">
                    <Activity size={18} strokeWidth={2.5} />
                  </div>
                  <div className="space-y-0 text-left">
                    <p className="text-[9px] text-tertiary font-black tracking-widest uppercase mb-0.5">Vận hành</p>
                    <p className="text-2xl font-black tracking-tighter text-on-surface leading-none">24/7</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 px-6">
                  <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center text-error">
                    <Cpu size={18} strokeWidth={2.5} />
                  </div>
                  <div className="space-y-0 text-left">
                    <p className="text-[9px] text-error font-black tracking-widest uppercase mb-0.5">Tự động</p>
                    <p className="text-2xl font-black tracking-tighter text-on-surface leading-none">98%</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </header>

        {/* Operation Core: The Digital Pulse - Vibrant & Energetic Version */}
        <section id="operation-core" className="h-screen bg-slate-950 relative overflow-hidden flex flex-col justify-center py-10">
          {/* Immersive & Vibrant Atmospheric Background */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            {/* Dynamic Color Orbs */}
            <div className="absolute top-10 left-10 w-[45rem] h-[45rem] bg-indigo-600/20 rounded-full blur-[160px] animate-pulse"></div>
            <div className="absolute top-1/2 right-0 w-[40rem] h-[40rem] bg-pink-600/15 rounded-full blur-[160px] animate-pulse delay-700"></div>
            <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[60rem] h-[30rem] bg-blue-600/15 rounded-full blur-[180px] animate-pulse delay-1000"></div>
            
            {/* Decorative Light Streaks */}
            <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent"></div>
            <div className="absolute top-0 left-1/3 w-px h-full bg-gradient-to-b from-transparent via-purple-500/10 to-transparent"></div>
          </div>

          <div className="relative z-10 max-w-[1700px] mx-auto px-6 w-full flex flex-col items-center">
            <div className="text-center mb-6">
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 backdrop-blur-xl mb-3"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-pink-500"></span>
                </span>
                <span className="text-[8px] font-black text-indigo-300 uppercase tracking-[0.4em]">The Digital Pulse</span>
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-8xl font-black tracking-tighter text-white leading-none mb-3"
              >
                Real-time <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-500 to-pink-500">Tracking.</span>
              </motion.h2>
              <p className="text-base text-slate-300 max-w-xl mx-auto font-medium italic opacity-80">
                Giám sát mọi biến động với <span className="text-white font-bold underline decoration-indigo-500/50 underline-offset-4">độ trễ bằng không.</span>
              </p>
            </div>

            <div className="relative flex flex-col items-center justify-center w-full">
              {/* Dual Centerpiece Visualization - Scaled Down for Balance */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="relative w-full max-w-6xl flex flex-col md:flex-row items-center justify-center gap-8 md:gap-24 -my-4"
              >
                {/* Security Animation with Vibrant Aura - Slightly smaller */}
                <div className="relative w-full max-w-[20rem] flex items-center justify-center group">
                  <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full opacity-40 group-hover:opacity-100 transition-all duration-1000 scale-110"></div>
                  <Lottie animationData={securityAnimation} loop={true} className="w-full h-auto relative z-10 scale-100 drop-shadow-[0_0_20px_rgba(99,102,241,0.3)]" />
                </div>

                {/* CCTV Animation with Vibrant Aura - Slightly smaller */}
                <div className="relative w-full max-w-[20rem] flex items-center justify-center group">
                  <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full opacity-40 group-hover:opacity-100 transition-all duration-1000 scale-110"></div>
                  <Lottie animationData={cctvAnimation} loop={true} className="w-full h-auto relative z-10 scale-100 drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]" />
                </div>
                
                {/* Floating "Insight" Cards - Compact for Balance */}
                <div className="absolute -left-6 top-1/2 -translate-y-1/2 hidden xl:block scale-75">
                  <motion.div 
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                    className="bg-slate-900/60 backdrop-blur-3xl p-4 rounded-[1.5rem] border border-white/10 shadow-2xl border-l-cyan-500/50 border-l-4 w-36"
                  >
                    <p className="text-[8px] font-black text-cyan-400 uppercase tracking-widest mb-1">Grid Load</p>
                    <p className="text-xl font-black text-white tracking-tighter">4.2 <span className="text-[10px] text-slate-500">kW/h</span></p>
                  </motion.div>
                </div>

                <div className="absolute -right-6 top-1/2 -translate-y-1/2 hidden xl:block scale-75">
                  <motion.div 
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="bg-slate-900/60 backdrop-blur-3xl p-4 rounded-[1.5rem] border border-white/10 shadow-2xl border-r-indigo-500/50 border-r-4 w-36"
                  >
                    <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1">Health Index</p>
                    <p className="text-xl font-black text-white tracking-tighter">99.9 <span className="text-[10px] text-slate-500">%</span></p>
                  </motion.div>
                </div>
              </motion.div>

              {/* Feature Grid - Balanced & Compact Panels */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 w-full max-w-6xl relative z-20 pb-4">
                {[
                  { title: "Meters", desc: "Theo dõi chỉ số điện nước 24/7.", icon: <Zap className="w-7 h-7"/>, color: "from-cyan-400 to-blue-600" },
                  { title: "Access", desc: "Mở khóa vân tay & PIN từ xa.", icon: <Lock className="w-7 h-7"/>, color: "from-indigo-400 to-purple-600" },
                  { title: "Security", desc: "Giám sát Camera AI thông minh.", icon: <Eye className="w-7 h-7"/>, color: "from-pink-400 to-rose-600" }
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ y: -10, scale: 1.01 }}
                    className="p-6 rounded-[2.5rem] bg-white/[0.04] border border-white/10 backdrop-blur-[40px] transition-all duration-500 group relative overflow-hidden shadow-xl"
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500 relative`}>
                      <div className="absolute inset-0 rounded-2xl bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative z-10">{item.icon}</div>
                    </div>
                    
                    <h3 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-400 transition-all">
                      {item.title}
                    </h3>
                    <p className="text-slate-400 text-lg font-medium italic leading-relaxed mb-10 group-hover:text-slate-200 transition-colors">
                      {item.desc}
                    </p>

                    {/* Bottom Accent Bar */}
                    <div className={`absolute bottom-0 left-0 h-2 w-full bg-gradient-to-r ${item.color} opacity-30 group-hover:opacity-100 transition-opacity duration-500`}></div>
                    
                    {/* Status Indicator */}
                    <div className="absolute top-10 right-10 flex items-center gap-2 opacity-40 group-hover:opacity-100 transition-opacity">
                      <div className={`w-1.5 h-1.5 rounded-full bg-white animate-pulse`}></div>
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">Active</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* The Portal Command: Management Redefined - Obsidian Premium Version */}
        <section id="portal-command" className="h-screen bg-slate-950 relative overflow-hidden flex flex-col justify-center py-10">
          {/* Subtle Dynamic Background */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90rem] h-[90rem] bg-indigo-600/5 rounded-full blur-[200px] animate-pulse"></div>
            <div className="absolute top-0 right-0 w-[50rem] h-[50rem] bg-blue-600/5 rounded-full blur-[150px]"></div>
          </div>

          <div className="relative z-10 max-w-[1700px] mx-auto px-6 w-full flex flex-col items-center">
            {/* Header Content */}
            <div className="text-center mb-12 relative z-20">
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-xl mb-4"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></div>
                <span className="text-[10px] font-black text-blue-300 uppercase tracking-[0.4em]">Real-time System Status</span>
              </motion.div>
              
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 leading-none">
                The Portal <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-600 italic">Command.</span>
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium italic opacity-80">
                Điều phối toàn bộ hệ thống quản lý ký túc xá thông minh với <span className="text-white font-bold underline decoration-blue-500/30 underline-offset-8">quy trình tự động hóa 24/7.</span>
              </p>
            </div>

            {/* Central Dashboard Interface - Balanced Layout */}
            <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20 w-full max-w-7xl -mt-4">
              {/* Monitoring Stats - Left Side (More Compact) */}
              <div className="flex flex-col gap-4 w-full lg:w-72 order-2 lg:order-1">
                {[
                  { label: "Phòng trống", value: "24", unit: "Đơn vị", color: "blue" },
                  { label: "Yêu cầu mới", value: "08", unit: "Pending", color: "amber" },
                  { label: "Trạng thái IoT", value: "ONLINE", unit: "Connected", color: "emerald" }
                ].map((stat, i) => (
                  <motion.div 
                    key={i}
                    whileHover={{ x: 8, backgroundColor: "rgba(255,255,255,0.06)" }}
                    className="p-5 rounded-[1.8rem] bg-white/[0.03] border border-white/10 backdrop-blur-3xl transition-all duration-300 flex items-center justify-between group"
                  >
                    <div>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 group-hover:text-blue-400">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-black text-white tracking-tighter italic leading-none">{stat.value}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-full bg-${stat.color}-500/10 border border-${stat.color}-500/20 text-${stat.color}-400 text-[8px] font-black uppercase tracking-widest`}>
                      {stat.unit}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Isometric Visualization - Center/Right (Optimized Size) */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="w-full lg:w-[45rem] relative flex items-center justify-center order-1 lg:order-2 px-4"
              >
                <div className="absolute inset-0 bg-blue-500/5 blur-[120px] rounded-full"></div>
                <Lottie 
                  animationData={dashboardAnimation} 
                  loop={true} 
                  className="w-full h-auto drop-shadow-[0_0_60px_rgba(59,130,246,0.15)]" 
                />
              </motion.div>
            </div>

            {/* Bottom Core Features - Balanced Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mt-12 w-full max-w-7xl relative z-10 pt-10 border-t border-white/5">
              {[
                { n: "01", t: "QUẢN LÝ TẬP TRUNG", d: "Kiểm soát hàng ngàn dữ liệu dân cư chỉ trong vài giây." },
                { n: "02", t: "THANH TOÁN THÔNG MINH", d: "Hệ thống tự động đối soát doanh thu 24/7." },
                { n: "03", t: "BÁO CÁO CHUYÊN SÂU", d: "Tự động phân tích xu hướng và dự báo tương lai." },
                { n: "04", t: "TÍCH HỢP ĐA KÊNH", d: "Đồng bộ mượt mà với Mobile App và các thiết bị IoT." }
              ].map((item, i) => (
                <div key={i} className="group">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl font-black text-blue-500/20 group-hover:text-blue-500 transition-colors duration-500">{item.n}</span>
                    <h4 className="text-xs font-black text-white tracking-widest uppercase group-hover:text-blue-400 transition-colors">{item.t}</h4>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed group-hover:text-slate-300 transition-colors uppercase tracking-tight">{item.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Master Your Workflow (Enhanced Asymmetric Bento) */}
        <section id="digital-operations" className="py-24 bg-[#fcf8ff] dark:bg-slate-950 px-6 lg:px-12 overflow-hidden">
          <div className="max-w-[1700px] mx-auto">
            <div className="bg-[#0f0f1c] rounded-[4rem] p-8 lg:p-24 flex flex-col lg:flex-row items-center gap-20 overflow-hidden relative shadow-[0_80px_150px_-30px_rgba(0,0,0,0.6)] border border-white/5">
              
              {/* Ultra-Premium Mesh Background */}
              <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/20 blur-[150px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[120px] rounded-full"></div>
                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v2h-2v-2h2zm0 24v2h-2v-2h2zm0-48v2h-2v-2h2zm0 24v2h-2v-2h2zM6 34v2H4v-2h2zm0 24v2H4v-2h2zm0-48v2H4v-2h2zm0 24v2H4v-2h2zM34 6V4h2v2h-2zm0 24V28h2v2h-2zm0 24v-2h2v2h-2zm0-48V4h2v2h-2zm-24 0V4h2v2h-2zm0 24V28h2v2h-2zm0 24v-2h2v2h-2zm0-48V4h2v2h-2zM6 6V4H4v2h2zm0 24V28H4v2h2zm0 24v-2H4v2h2zm0-48V4H4v2h2zm28 28V28h-2v2h2zm0 24v-2h-2v2h2zm0-48V4h-2v2h2zm0 24V28h-2v2h2zM6 36v-2H4v2h2zm0 24v-2H4v2h2zm0-48v-2H4v2h2zm0 24v-2H4v2h2zM34 6V4h2v2h-2zm0 24V28h2v2h-2zm0 24v-2h2v2h-2zm0-48V4h2v2h-2zm-24 0V4h2v2h-2zm0 24V28h2v2h-2zm0 24v-2h2v2h-2zm0-48V4h2v2h-2zM36 36v-2h-2v2h2zm0 24v-2h-2v2h2zm0-48v-2h-2v2h2zm0 24v-2h-2v2h2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
              </div>
              
              <div className="lg:w-1/2 z-10 space-y-10">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black tracking-[0.3em] uppercase mb-4"
                >
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping"></span>
                  Luminous Experience
                </motion.div>
                
                <h2 className="text-6xl lg:text-8xl font-black text-white mb-8 leading-[0.95] tracking-tighter">
                  Master Your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Workflow</span>
                </h2>
                
                <p className="text-slate-400 text-xl mb-12 leading-relaxed font-bold italic opacity-90">
                  Mang theo toàn bộ hệ sinh thái SmartDorm trong túi của bạn. Trải nghiệm sự kết hợp hoàn hảo giữa công nghệ điều khiển từ xa và quản lý tự động 24/7.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {[
                    { icon: <Zap className="text-indigo-400" size={24} />, title: "Real-time Alerts", desc: "Thông báo đẩy tức thì mọi biến động." },
                    { icon: <ShieldCheck className="text-indigo-400" size={24} />, title: "Secure Access", desc: "Xác thực sinh trắc học chuẩn ngân hàng." },
                    { icon: <Activity className="text-indigo-400" size={24} />, title: "Fleet Management", desc: "Quản lý hàng ngàn thiết bị một lúc." },
                    { icon: <Lock className="text-indigo-400" size={24} />, title: "Remote Control", desc: "Điều khiển khóa & điện nước từ xa." }
                  ].map((item, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-4 group"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-indigo-500/20 transition-all duration-300 border border-white/5">
                        {item.icon}
                      </div>
                      <div>
                        <h4 className="text-white font-black text-lg tracking-tight uppercase">{item.title}</h4>
                        <p className="text-slate-500 text-sm font-bold italic">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-8 pt-10 border-t border-white/5">
                  <div className="flex items-center gap-4">
                    <motion.a 
                      whileHover={{ scale: 1.05 }}
                      href="#" 
                      className="block h-16 transition-all"
                    >
                      <Lottie animationData={appleAnimation} loop={true} className="h-full" />
                    </motion.a>
                    <motion.a 
                      whileHover={{ scale: 1.05 }}
                      href="#" 
                      className="block h-16 transition-all"
                    >
                      <Lottie animationData={playstoreAnimation} loop={true} className="h-full" />
                    </motion.a>
                  </div>
                  <div className="h-10 w-px bg-white/10 hidden sm:block"></div>
                  <div className="flex items-center gap-4 group cursor-pointer">
                    <div className="bg-white p-2 rounded-xl shadow-lg group-hover:scale-110 transition-transform">
                      <img alt="QR" className="w-12 h-12" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkGk5uDCSyDPGNbRuiuf8UOaWDFYl6QQrR5_G3QtmZsdii0eMvv2Ejw17gZ7ObkWdmmRw5SLZQ2oJkFlbOVX65yYQ8ce0-n_0FOpLB-X_RnPaV5AP-HfL8C0W4aS3-j1iM_p1NLXOztPPAJibaIV10hoofs08zNi223055eGqqxSpHJ_sRsrP2nnmjsM4MgSFM_-NV0UPBi44DfKQLR5z0YAztGhUCaFTQfBLzsq0TchTGt0dSoI_Gy7bnXFZTPI6-i2YyyERXJxd2"/>
                    </div>
                    <div>
                      <p className="text-white text-xs font-black uppercase tracking-widest">Scan QR Code</p>
                      <p className="text-slate-500 text-[10px] font-bold">Cài đặt ngay lập tức</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:w-1/2 relative flex justify-center py-20">
                <div className="relative">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    whileInView={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                    className="relative z-10 w-full max-w-2xl"
                  >
                    <Lottie animationData={uiuxAnimation} loop={true} className="drop-shadow-[0_50px_100px_rgba(110,107,255,0.3)]" />
                  </motion.div>

                  {/* Floating Analytical Cards */}
                  <motion.div 
                    animate={{ y: [0, -15, 0], x: [0, 5, 0] }}
                    transition={{ duration: 6, repeat: Infinity }}
                    className="absolute top-10 -right-20 bg-white shadow-2xl p-5 rounded-3xl z-20 border border-slate-100 hidden lg:block w-[220px]"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Doanh thu tháng</span>
                    </div>
                    <div className="text-3xl font-black text-slate-900 tracking-tighter">98,590,000đ</div>
                    <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 w-[85%]"></div>
                    </div>
                  </motion.div>

                  <motion.div 
                    animate={{ y: [0, 15, 0], x: [0, -5, 0] }}
                    transition={{ duration: 5, repeat: Infinity }}
                    className="absolute bottom-20 -left-20 bg-indigo-600 shadow-2xl p-5 rounded-3xl z-20 hidden lg:block w-[200px]"
                  >
                    <div className="flex items-center gap-3 mb-3 text-white/50">
                      <Activity size={12} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Trạng thái TB</span>
                    </div>
                    <div className="text-2xl font-black text-white tracking-tighter">Online 24/7</div>
                    <div className="mt-3 flex gap-1">
                      {[1,2,3,4,5,6,7].map(i => (
                        <div key={i} className="h-4 w-2 bg-white/20 rounded-sm"></div>
                      ))}
                      <div className="h-4 w-2 bg-white rounded-sm"></div>
                    </div>
                  </motion.div>

                  {/* Decorative Elements */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA: Precision Future - obsidian Premium */}
        <section className="py-24 bg-slate-950 relative overflow-hidden px-6">
          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="relative p-12 lg:p-24 rounded-[4rem] bg-indigo-600/10 border border-white/5 backdrop-blur-3xl overflow-hidden flex flex-col items-center text-center shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]"
            >
              {/* Vibrant Background Orbs for CTA */}
              <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/20 blur-[150px] rounded-full animate-pulse"></div>
              <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-500/10 blur-[150px] rounded-full"></div>
              
              {/* Floating Technology Accents */}
              <div className="absolute top-10 right-10 w-32 h-32 opacity-20 hover:opacity-50 transition-opacity">
                <Lottie animationData={securityAnimation} loop={true} />
              </div>
              <div className="absolute bottom-10 left-10 w-32 h-32 opacity-20 hover:opacity-50 transition-opacity">
                <Lottie animationData={cctvAnimation} loop={true} />
              </div>

              <div className="relative z-20 space-y-10 max-w-4xl">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-black tracking-[0.4em] uppercase"
                >
                  Join the Ecosystem
                </motion.div>
                
                <h2 className="text-6xl md:text-8xl font-black text-white leading-none tracking-tighter">
                  Sẵn sàng <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600 italic underline decoration-blue-500/30 underline-offset-8">số hóa</span> <br/>tòa nhà của bạn?
                </h2>
                
                <p className="text-xl text-slate-400 font-medium italic max-w-2xl mx-auto leading-relaxed opacity-80">
                  Bắt đầu hành trình chuyển đổi số với hệ sinh thái SmartDorm ngay hôm nay. Trải nghiệm sự giao thoa hoàn hảo giữa <span className="text-white">công nghệ & thẩm mỹ.</span>
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
                  <motion.button 
                    whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -10px rgba(79,70,229,0.5)" }}
                    whileTap={{ scale: 0.98 }}
                    className="px-12 py-6 rounded-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black text-lg uppercase tracking-widest shadow-2xl transition-all"
                  >
                    Liên hệ tư vấn ngay
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.08)" }}
                    whileTap={{ scale: 0.98 }}
                    className="px-12 py-6 rounded-full bg-white/[0.03] border border-white/10 text-white font-black text-lg uppercase tracking-widest backdrop-blur-3xl transition-all"
                  >
                    Dùng thử miễn phí
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Final Footer: Precision Curator Philosophy */}
      <footer className="bg-slate-950 pt-24 pb-12 border-t border-white/5 relative overflow-hidden">
        {/* Subtle light orb in footer */}
        <div className="absolute bottom-0 right-0 w-[40rem] h-[40rem] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
            {/* Brand Section */}
            <div className="lg:col-span-5 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                  <span className="font-black text-xl">S</span>
                </div>
                <h3 className="text-2xl font-black text-white tracking-widest uppercase">SmartDorm</h3>
              </div>
              <p className="text-slate-500 text-sm font-medium italic leading-relaxed max-w-sm uppercase tracking-tight">
                Hệ thống quản trị và tự động hóa vận hành bất động sản cho thuê số 1 Việt Nam. Triết lý thiết kế <span className="text-indigo-400">Precision Curator</span> mang lại sự cân bằng giữa công nghệ và thẩm mỹ.
              </p>
              <div className="flex gap-4">
                {[Zap, Users, Shield, Globe].map((Icon, i) => (
                  <motion.div key={i} whileHover={{ y: -5 }} className="w-10 h-10 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer">
                    <Icon size={18} />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Navigation Grid */}
            <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-10">
              {[
                { title: "Platform", links: ["Architecture API", "IoT SDK", "Cloud Engine"] },
                { title: "Company", links: ["Sustainability", "Contact Sales", "Privacy Policy"] },
                { title: "Support", links: ["Documentation", "Terms of Service", "Changelog"] }
              ].map((col, i) => (
                <div key={i} className="space-y-6">
                  <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">{col.title}</h4>
                  <ul className="space-y-4">
                    {col.links.map((link, j) => (
                      <li key={j}>
                        <a href="#" className="text-sm font-bold text-slate-500 hover:text-white transition-colors tracking-tight uppercase">{link}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Copyright Area */}
          <div className="pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
              © 2024 SMARTDORM ECOSYSTEM. THE PRECISION CURATOR PHILOSOPHY.
            </p>
            <div className="flex items-center gap-8 text-slate-500">
              <span className="text-[10px] font-black uppercase tracking-widest cursor-pointer hover:text-white transition-colors">Vietnamese</span>
              <span className="text-[10px] font-black uppercase tracking-widest cursor-pointer hover:text-white transition-colors">Global (EN)</span>
            </div>
          </div>
        </div>
      </footer>

      <AIChatBot />
      <BackToTop />
    </div>
  )
}
