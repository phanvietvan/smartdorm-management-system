import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Zap,
  Users,
  Award,
  RefreshCcw,
  Rocket,
  Lock,
  Eye,
  Activity,
  Cpu
} from 'lucide-react'
import AIChatBot from '../components/AIChatBot'
import MainNavbar from '../components/MainNavbar'
import BackToTop from '../components/BackToTop'

// Assets from the provided HTML
const LOGO_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuDVvNbv8IrvBTPrPFW4xhw91KqkxFXtTQsJNSOL3-AVubs1PQpn4cdB7F5DiwZ5grGqVOX8bH1PX4vBhmMHsrT147B0zxLwFPnhX3DhLgbL1CQ_48Y_yrgsKJGmozsBvMOhceflAaKz8skT9tnY-qG3Ejx6V9vU1RD3jM72wDWhSAxss8IsCmGz6is88P0UcSnXABQAdsS4CrticISfhCgV0SV0R3MZMkGlce9qqpoINPAhuLr1jlWitxg8qAYlAd9dEXmCBihmMidu"
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
                className="text-6xl md:text-8xl font-black tracking-tighter text-[#2c2f31] dark:text-white leading-[0.9]"
              >
                Cách mạng Quản lý<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4b49cb] to-[#973774]">SmartDorm.</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="max-w-xl mx-auto text-[#595c5e] dark:text-slate-400 text-sm md:text-lg font-bold italic tracking-tight pt-2"
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

        {/* Real-time Tracking Section (Operation Core) */}
        <section id="operation-core" className="px-12 h-screen flex flex-col justify-center bg-slate-950 relative overflow-hidden">
          {/* Muted premium network background */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <img src="/operation_core_bg.png" className="w-full h-full object-cover opacity-30 mix-blend-lighten" alt="modern network background" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950"></div>
          </div>
          
          <div className="max-w-[1700px] mx-auto relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-24">
              <div className="max-w-2xl">
                <motion.span 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="text-xs font-black text-indigo-400 tracking-[0.4rem] uppercase mb-6 block"
                >
                  Operation Core
                </motion.span>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.9]"
                >
                  Real-time Tracking &<br/> Digital Presence
                </motion.h2>
              </div>
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-xl text-slate-400 max-w-sm mb-2 font-bold italic leading-tight"
              >
                Giám sát mọi biến động tại cơ sở của bạn với độ trễ gần như bằng không thông qua hệ thống cảm biến thông minh.
              </motion.p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-10">
              {[
                { 
                  icon: <Zap className="w-8 h-8"/>, 
                  title: "Smart Metering", 
                  desc: "Theo dõi chỉ số điện nước tự động, chốt số cuối tháng trong 1 giây không sai sót.",
                  color: "from-blue-500 to-indigo-600"
                },
                { 
                  icon: <Lock className="w-8 h-8"/>, 
                  title: "Access Control", 
                  desc: "Mở khóa từ xa, quản lý vân tay và mã PIN cho từng phòng cư dân trực tiếp từ portal.",
                  color: "from-indigo-600 to-purple-600"
                },
                { 
                  icon: <Eye className="w-8 h-8"/>, 
                  title: "Security AI", 
                  desc: "Phát hiện xâm nhập lạ hoặc hành vi bất thường trực tiếp thông qua camera AI.",
                  color: "from-purple-600 to-pink-600"
                }
              ].map((feat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.8 }}
                  whileHover={{ y: -12, scale: 1.02 }}
                  className="group relative bg-white/5 backdrop-blur-3xl p-14 rounded-[3.5rem] transition-all duration-500 border border-white/10 shadow-2xl overflow-hidden"
                >
                  {/* Subtle hover gradient glow */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feat.color} opacity-0 group-hover:opacity-[0.05] transition-opacity duration-500`}></div>
                  
                  <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-12 text-white shadow-lg shadow-indigo-500/10 group-hover:scale-110 transition-transform duration-500`}>
                    {feat.icon}
                  </div>
                  
                  <h3 className="text-3xl font-black mb-6 text-white group-hover:text-indigo-300 transition-colors tracking-tighter uppercase">{feat.title}</h3>
                  <p className="text-slate-400 group-hover:text-slate-200 leading-relaxed mb-10 font-bold italic text-lg transition-colors">{feat.desc}</p>
                  
                  <div className={`h-1.5 w-16 bg-gradient-to-r ${feat.color} rounded-full`}></div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Showcase (The Portal Command) */}
        <section id="portal-command" className="px-12 h-screen flex flex-col justify-center bg-[#f8f9fc] dark:bg-slate-950 relative overflow-hidden">
          {/* Soothing abstract background pattern */}
          <div className="absolute inset-0 z-0 pointer-events-none opacity-40 dark:opacity-20">
            <img src="/portal_system_bg.png" className="w-full h-full object-cover" alt="abstract tech background" />
            <div className="absolute inset-0 bg-gradient-to-br from-[#f8f9fc] via-transparent to-[#f8f9fc] dark:from-slate-950 dark:to-slate-950"></div>
          </div>

          <div className="max-w-[1700px] mx-auto relative z-10 w-full flex flex-col items-center">
            <div className="text-center max-w-4xl mx-auto mb-8">
              <motion.span 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-indigo-500/80 font-black text-[9px] uppercase tracking-[0.4rem] mb-2 block"
              >
                Control Center
              </motion.span>
              <motion.h2 
                initial={{ opacity: 0, y: -10 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-5xl md:text-7xl font-black tracking-tighter text-[#2a2a35] dark:text-white mb-2 leading-none"
              >
                The Portal<span className="italic text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500 ml-3">Command</span>
              </motion.h2>
              <p className="text-lg text-slate-500 dark:text-slate-400 font-bold italic leading-tight">Một bảng điều khiển duy nhất cho tất cả các hoạt động.</p>
            </div>

            <div className="relative group w-full max-w-5xl">
              {/* Outer Glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-[4rem] blur-3xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              
              <div className="relative bg-slate-950 rounded-[3rem] p-3 shadow-[0_40px_80px_rgba(0,0,0,0.3)] overflow-hidden border border-white/5">
                <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden relative aspect-[21/9]">
                  <img 
                    className="w-full h-full object-cover opacity-80 transition-transform duration-1000 group-hover:scale-105" 
                    src="/portal_dashboard.png" 
                    alt="Premium Dashboard Mockup" 
                  />
                  
                  {/* Scaled down Floating Glass Cards */}
                  <div className="absolute top-6 right-6 space-y-4">
                    <motion.div 
                      whileHover={{ scale: 1.05, x: -5 }}
                      className="bg-white/5 backdrop-blur-3xl p-5 rounded-[1.5rem] shadow-2xl border border-white/10 max-w-[180px] transition-all duration-500"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="font-black text-[8px] text-white/50 uppercase tracking-widest">Hết hạn</span>
                      </div>
                      <p className="text-xl font-black text-white tracking-tighter">12 Phòng</p>
                    </motion.div>

                    <motion.div 
                      whileHover={{ scale: 1.05, x: -5 }}
                      className="bg-white/5 backdrop-blur-3xl p-5 rounded-[1.5rem] shadow-2xl border border-white/10 max-w-[180px] transition-all duration-500"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-black text-[8px] text-white/50 uppercase tracking-widest">Doanh thu</span>
                      </div>
                      <p className="text-xl font-black text-white tracking-tighter">98.5%</p>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mt-12 w-full">
              {[
                { n: "01", t: "Quản lý Tập trung", d: "Kiểm soát hàng ngàn tệp dữ liệu cư dân chỉ trong vài giây." },
                { n: "02", t: "Thanh toán Thông minh", d: "Hệ thống tự động đối soát và ghi nhận doanh thu 24/7." },
                { n: "03", t: "Báo cáo Chuyên sâu", d: "Tự động phân tích xu hướng và dự báo tài chính tương lai." },
                { n: "04", t: "Tích hợp Đa kênh", d: "Đồng bộ hóa mượt mà với Mobile App và các thiết bị IoT." }
              ].map((item, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="space-y-6 group"
                >
                  <span className="text-5xl font-black text-indigo-600/20 group-hover:text-indigo-600 transition-colors duration-500">{item.n}</span>
                  <div className="space-y-2">
                    <h4 className="text-2xl font-black tracking-tighter uppercase">{item.t}</h4>
                    <p className="text-base text-slate-500 dark:text-slate-400 font-bold italic leading-relaxed">{item.d}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <div className="absolute top-[20%] right-[-10%] w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none"></div>
        </section>

        {/* Digital Operations Bento Grid */}
        <section id="digital-operations" className="px-12 h-screen flex flex-col justify-center bg-[#f5f2fd] dark:bg-slate-900/50">
          <div className="max-w-[1700px] mx-auto w-full">
            <div className="mb-12 space-y-2">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-[#1b1b23] dark:text-white">Digital Operations</h2>
              <div className="w-16 h-1.5 bg-[#4b49cb] rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 h-[600px]">
              <motion.div 
                whileHover={{ scale: 0.98 }}
                className="md:col-span-2 md:row-span-1 bg-white dark:bg-slate-800 rounded-[3rem] p-16 flex flex-col justify-between relative overflow-hidden group shadow-xl"
              >
                <div className="relative z-10 max-w-md">
                  <h3 className="text-4xl font-black mb-6 tracking-tight">Hệ thống Ticket 24/7</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-lg font-bold italic leading-relaxed">Cư dân báo cáo sự cố qua App, kỹ thuật viên nhận lệnh tức thì trên Portal. Theo dõi tiến độ sửa chữa minh bạch.</p>
                </div>
                <img className="absolute right-0 bottom-0 w-1/2 h-full object-cover opacity-10 group-hover:opacity-30 transition-opacity duration-700" src="/smart_lock_iot_detail_1775690970931.png" alt="maintenance" />
              </motion.div>

              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-[#4441c4] rounded-[3rem] p-12 text-white flex flex-col justify-center items-center text-center shadow-2xl shadow-[#4441c4]/30"
              >
                <Award className="w-24 h-24 mb-6" />
                <h3 className="text-3xl font-black mb-4 tracking-tight">Tiêu chuẩn 5 Sao</h3>
                <p className="text-white/80 font-bold italic">Mang lại trải nghiệm sống đẳng cấp cho cư dân của bạn.</p>
              </motion.div>

              <motion.div 
                whileHover={{ rotate: 1 }}
                className="bg-white dark:bg-slate-800 rounded-[3rem] p-12 flex flex-col justify-between shadow-xl"
              >
                <div>
                  <Users className="w-12 h-12 text-[#4441c4] mb-8" />
                  <h3 className="text-3xl font-black mb-4 tracking-tight">Cộng đồng Số</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 font-bold italic">Tổ chức sự kiện, khảo sát ý kiến và truyền thông nội bộ hiệu quả hơn bao giờ hết.</p>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }}
                className="md:col-span-2 bg-white dark:bg-slate-800 rounded-[3rem] p-16 flex items-center justify-between overflow-hidden shadow-xl"
              >
                <div className="max-w-lg">
                  <h3 className="text-4xl font-black mb-6 tracking-tight">Tự động hóa Quy trình</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-lg font-bold italic">Hệ thống tự động nhắc nợ, tự động xuất hợp đồng điện tử và tự động phân tích hành vi tiêu thụ điện năng.</p>
                </div>
                <div className="hidden lg:flex gap-6">
                  <div className="w-32 h-32 rounded-3xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center shadow-inner">
                    <RefreshCcw className="text-[#4441c4] w-12 h-12 animate-spin-slow" />
                  </div>
                  <div className="w-32 h-32 rounded-3xl bg-[#4441c4] flex items-center justify-center shadow-xl">
                    <Rocket className="text-white w-12 h-12" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 px-12 bg-white dark:bg-slate-950">
          <div className="max-w-[1700px] mx-auto bg-[#1b1b23] rounded-[4rem] p-16 md:p-32 text-center relative overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.3)]">
            <div className="absolute inset-0 opacity-10">
              <img className="w-full h-full object-cover" src="/futuristic_smart_building_cta_1775690988668.png" alt="Tech" />
            </div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="relative z-10"
            >
              <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-12 leading-tight italic">
                Sẵn sàng số hóa<br/>tòa nhà của bạn?
              </h2>
              <div className="flex flex-wrap justify-center gap-8">
                <Link to="/register" className="px-16 py-7 bg-[#4441c4] text-white text-2xl font-black rounded-3xl hover:scale-105 transition-transform shadow-2xl shadow-[#4441c4]/20">
                  Liên hệ tư vấn ngay
                </Link>
                <Link to="/login" className="px-16 py-7 bg-white/10 text-white text-2xl font-black rounded-3xl backdrop-blur-md hover:bg-white/20 transition-all border border-white/20">
                  Dùng thử miễn phí
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-24 px-12 bg-white dark:bg-slate-950 border-t border-slate-200/15">
        <div className="flex flex-col md:flex-row justify-between items-start max-w-[1920px] mx-auto gap-12">
          <div className="space-y-8 max-w-md">
            <div className="flex items-center gap-3">
              <img alt="SmartDorm Logo" className="h-6 w-auto" src={LOGO_URL} />
              <span className="text-2xl font-black text-[#1b1b23] dark:text-white tracking-tighter">SmartDorm</span>
            </div>
            <p className="text-slate-500 font-bold uppercase tracking-[0.05em] text-[12px] leading-relaxed italic">
              Hệ thống quản trị và tự động hóa vận hành bất động sản cho thuê số 1 Việt Nam. Triết lý thiết kế Luminous Curator mang lại sự cân bằng giữa công nghệ và trải nghiệm nhân văn.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 lg:gap-24">
            <div className="space-y-4">
              <h5 className="font-extrabold text-xs uppercase tracking-widest text-[#1b1b23] dark:text-white">Platform</h5>
              <ul className="space-y-3">
                {['Architecture API', 'IoT SDK', 'Cloud Engine'].map(l => (
                  <li key={l}><a className="text-slate-500 hover:text-[#4441c4] transition-colors font-bold uppercase tracking-[0.05em] text-[11px]" href="#">{l}</a></li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="font-extrabold text-xs uppercase tracking-widest text-[#1b1b23] dark:text-white">Company</h5>
              <ul className="space-y-3">
                {['Sustainability', 'Contact Sales', 'Privacy Policy'].map(l => (
                  <li key={l}><a className="text-slate-500 hover:text-[#4441c4] transition-colors font-bold uppercase tracking-[0.05em] text-[11px]" href="#">{l}</a></li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h5 className="font-extrabold text-xs uppercase tracking-widest text-[#1b1b23] dark:text-white">Support</h5>
              <ul className="space-y-3">
                {['Documentation', 'Terms of Service', 'Changelog'].map(l => (
                  <li key={l}><a className="text-slate-500 hover:text-[#4441c4] transition-colors font-bold uppercase tracking-[0.05em] text-[11px]" href="#">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-[1920px] mx-auto mt-20 pt-10 border-t border-slate-200/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-slate-500 font-bold uppercase tracking-[0.05em] text-[11px]">© 2024 SmartDorm Ecosystem. The Luminous Curator Philosophy.</p>
          <div className="flex gap-8">
             <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-[#4441c4] transition-all cursor-pointer"><Zap size={18} /></div>
             <div className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-[#4441c4] transition-all cursor-pointer"><Users size={18} /></div>
          </div>
        </div>
      </footer>

      <AIChatBot />
      <BackToTop />
    </div>
  )
}
