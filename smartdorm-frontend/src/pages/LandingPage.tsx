import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Zap,
  Users,
  Award,
  RefreshCcw,
  Rocket,
  Lock,
  Eye
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
        <header className="relative h-screen flex items-center justify-center px-6 bg-[#f5f6f9] dark:bg-slate-950 overflow-hidden pb-48">
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
              <Link to="/rooms-available" className="px-10 py-5 bg-[#4b49cb] text-white rounded-2xl font-black text-lg shadow-2xl shadow-[#4b49cb]/20 hover:scale-[1.02] active:scale-95 transition-all outline-none">
                Tìm phòng ngay
              </Link>
              <Link to="/register" className="px-10 py-5 bg-white dark:bg-slate-800 border border-[#abadb0]/20 text-[#2c2f31] dark:text-white rounded-2xl font-black text-lg hover:bg-[#eff1f4] dark:hover:bg-slate-700 transition-colors text-center flex items-center justify-center outline-none">
                Hợp tác cho chủ nhà
              </Link>
            </motion.div>
          </div>

          {/* Floating Stats Card */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-5xl px-6 z-20">
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, type: 'spring', damping: 20 }}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 shadow-[0_32px_64px_rgba(0,0,0,0.08)] border border-white/40 dark:border-slate-800"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] text-[#973774] font-black tracking-widest uppercase">Hiệu suất</p>
                  <p className="text-3xl font-black tracking-tighter">+45%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-[#4b49cb] font-black tracking-widest uppercase">Cư dân</p>
                  <p className="text-3xl font-black tracking-tighter">2k+</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-[#3a45ad] font-black tracking-widest uppercase">Vận hành</p>
                  <p className="text-3xl font-black tracking-tighter">24/7</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-[#a70138] font-black tracking-widest uppercase">Tự động</p>
                  <p className="text-3xl font-black tracking-tighter">98%</p>
                </div>
              </div>
            </motion.div>
          </div>
        </header>

        {/* Real-time Tracking Section (Operation Core) */}
        <section id="operation-core" className="py-32 px-12 bg-[#f5f2fd] dark:bg-slate-900/50 relative overflow-hidden">
          {/* New subtle network background */}
          <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
            <img src="/operation_core_network_bg_1775691229058.png" className="w-full h-full object-cover" alt="network background" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#f5f2fd] via-transparent to-[#f5f2fd] dark:from-slate-950 dark:to-slate-950"></div>
          </div>
          
          <div className="max-w-[1700px] mx-auto relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end gap-12 mb-20">
              <div className="max-w-2xl">
                <motion.span 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  className="text-sm font-black text-[#854300] dark:text-orange-400 tracking-[0.2rem] uppercase mb-4 block"
                >
                  Operation Core
                </motion.span>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  className="text-5xl md:text-7xl font-black tracking-tighter text-[#1b1b23] dark:text-white"
                >
                  Real-time Tracking &<br/> Digital Presence
                </motion.h2>
              </div>
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-lg text-slate-600 dark:text-slate-400 max-w-sm mb-2 font-bold italic"
              >
                Giám sát mọi biến động tại cơ sở của bạn với độ trễ gần như bằng không thông qua hệ thống cảm biến thông minh.
              </motion.p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { icon: <Zap className="w-8 h-8"/>, title: "Smart Metering", desc: "Theo dõi chỉ số điện nước tự động, chốt số cuối tháng trong 1 giây không sai sót." },
                { icon: <Lock className="w-8 h-8"/>, title: "Access Control", desc: "Mở khóa từ xa, quản lý vân tay và mã PIN cho từng phòng cư dân trực tiếp từ portal." },
                { icon: <Eye className="w-8 h-8"/>, title: "Security AI", desc: "Phát hiện xâm nhập lạ hoặc hành vi bất thường trực tiếp thông qua camera AI." }
              ].map((feat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group bg-white dark:bg-slate-800 p-12 rounded-[2.5rem] hover:bg-[#4441c4] transition-all duration-500 hover:translate-y-[-8px] shadow-xl shadow-slate-200/50 dark:shadow-none"
                >
                  <div className="w-16 h-16 rounded-2xl bg-[#4441c4]/10 flex items-center justify-center mb-10 group-hover:bg-white/20 transition-colors text-[#4441c4] group-hover:text-white">
                    {feat.icon}
                  </div>
                  <h3 className="text-2xl font-black mb-4 group-hover:text-white tracking-tight">{feat.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 group-hover:text-white/80 leading-relaxed mb-8 font-bold italic">{feat.desc}</p>
                  <div className="h-1.5 w-12 bg-[#4441c4] group-hover:bg-white/40 transition-colors rounded-full"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Technology Showcase (The Portal Command) */}
        <section id="portal-command" className="py-40 px-12 bg-white dark:bg-slate-950 relative overflow-hidden">
          <div className="max-w-[1700px] mx-auto relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-24">
              <motion.h2 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="text-6xl md:text-8xl font-black tracking-tighter text-[#1b1b23] dark:text-white mb-8 italic"
              >
                The Portal Command
              </motion.h2>
              <p className="text-xl text-slate-500 dark:text-slate-400 font-bold italic">Một bảng điều khiển duy nhất cho tất cả các hoạt động. Từ quản lý hợp đồng, hóa đơn đến xử lý khiếu nại cư dân.</p>
            </div>

            <div className="relative bg-slate-100 dark:bg-slate-900 rounded-[4rem] p-4 lg:p-12 shadow-2xl overflow-hidden group border border-slate-200 dark:border-slate-800">
              <div className="bg-white dark:bg-slate-950 rounded-[3rem] overflow-hidden shadow-inner border border-slate-200/50 dark:border-slate-800 aspect-video relative">
                <img className="w-full h-full object-cover opacity-90 transition-transform duration-1000 group-hover:scale-105" src="/smartdorm_dashboard_ui_3d_1775690957148.png" alt="Dashboard Mockup" />
                <div className="absolute top-20 right-20 space-y-4">
                  <motion.div 
                    whileHover={{ x: -10 }}
                    className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-[#4441c4]/10 max-w-xs transform translate-x-12 group-hover:translate-x-0 transition-transform duration-1000"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-3 h-3 bg-[#4441c4] rounded-full animate-ping"></span>
                      <span className="font-black text-xs uppercase tracking-tight">Hợp đồng hết hạn</span>
                    </div>
                    <p className="text-3xl font-black text-[#4441c4]">12 Phòng</p>
                    <p className="text-[10px] text-slate-400 mt-2 italic font-bold">Tự động gửi thông báo gia hạn...</p>
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-12 mt-24">
              {[
                { n: "01", t: "Quản lý Tập trung", d: "Xử lý 100+ tòa nhà trong một giao diện duy nhất." },
                { n: "02", t: "Thanh toán Tự động", d: "Tích hợp VNPay, Momo tự động gạch nợ hóa đơn." },
                { n: "03", t: "Báo cáo Tài chính", d: "Xuất báo cáo P&L thời gian thực chỉ với 1 click." },
                { n: "04", t: "Hệ sinh thái API", d: "Kết nối dễ dàng với các phần mềm kế toán ERP." }
              ].map((item, i) => (
                <div key={i} className="space-y-4 border-l-2 border-[#4441c4]/20 pl-8 hover:border-[#4441c4] transition-colors">
                  <span className="text-[#4441c4] font-black text-4xl opacity-50">{item.n}</span>
                  <h4 className="text-xl font-black tracking-tight">{item.t}</h4>
                  <p className="text-sm text-slate-500 font-bold italic">{item.d}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute -bottom-[20%] -left-[10%] w-[600px] h-[600px] bg-[#4441c4]/5 rounded-full blur-[120px] pointer-events-none"></div>
        </section>

        {/* Digital Operations Bento Grid */}
        <section id="digital-operations" className="py-32 px-12 bg-[#f5f2fd] dark:bg-slate-900/50">
          <div className="max-w-[1700px] mx-auto">
            <div className="mb-20 space-y-4">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-[#1b1b23] dark:text-white">Digital Operations</h2>
              <div className="w-24 h-2 bg-[#4441c4] rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-8 min-h-[800px]">
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
