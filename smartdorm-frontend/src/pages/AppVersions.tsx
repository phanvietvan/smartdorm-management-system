import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { 
  Monitor, 
  Smartphone, 
  ExternalLink
} from 'lucide-react'
import MainNavbar from '../components/MainNavbar'
import BackToTop from '../components/BackToTop'

export default function AppVersions() {
  const versions = [
    {
      id: 'web',
      name: 'SmartDorm Web Portal',
      type: 'Nền tảng Quản trị',
      description: 'Hệ thống quản lý tập trung dành cho chủ nhà và quản lý tòa nhà. Theo dõi doanh thu, hợp đồng và vận hành toàn diện trên màn hình lớn.',
      features: ['Quản lý hợp đồng điện tử', 'Báo cáo doanh thu thời gian thực', 'Hệ thống đối soát VNPAY', 'Điều khiển IoT tập trung'],
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200',
      icon: <Monitor className="w-8 h-8" />,
      color: 'bg-indigo-600',
      linkText: 'Truy cập Web App'
    },
    {
      id: 'mobile',
      name: 'SmartDorm Resident App',
      type: 'Ứng dụng Cư dân',
      description: 'Người bạn đồng hành không thể thiếu của mỗi cư dân. Thanh toán hóa đơn, điều khiển phòng thông minh và kết nối cộng đồng chỉ với một cú chạm.',
      features: ['Điều khiển thiết bị IoT trong phòng', 'Thanh toán tiền điện nước 1 chạm', 'Chatbot AI hỗ trợ 24/7', 'Ký danh khách thăm thông minh'],
      image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&q=80&w=1200',
      icon: <Smartphone className="w-8 h-8" />,
      color: 'bg-pink-600',
      linkText: 'Tải xuống (App Store/Play Store)'
    }
  ]

  return (
    <div className="relative min-h-screen font-['Plus_Jakarta_Sans'] text-[#2c2f31] dark:text-slate-100 antialiased overflow-x-hidden selection:bg-[#4b49cb]/10 selection:text-[#4b49cb]">
      
      <MainNavbar />

      {/* Solid Background Layer */}
      <div className="fixed inset-0 z-[-2] bg-[#e2e4e7] dark:bg-slate-950"></div>

      {/* HCM Skyline (Bitexco) Background Texture with Dimmer */}
      <div className="fixed inset-0 z-[-1] opacity-20 pointer-events-none">
        <img src="https://images.unsplash.com/photo-1555921015-5532091f6026?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover" alt="hcm bitexco night" />
        <div className="absolute inset-0 bg-slate-950/25"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#e2e4e7]/20 to-[#e2e4e7] dark:to-slate-950"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 pt-40 pb-20 px-12 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-[#4b49cb] font-black mb-8 block border-b border-[#4b49cb]/20 pb-4 inline-block italic">Đa nền tảng. Một trải nghiệm.</span>
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] mb-10 text-transparent bg-clip-text bg-gradient-to-b from-[#2c2f31] via-[#2c2f31] to-[#abadb0] dark:from-white dark:to-slate-800">
            Hệ sinh thái <br/> 
            <span className="italic font-thin text-[#abadb0] tracking-[-0.05em] block mt-4 lowercase opacity-80">SmartDorm</span>
          </h1>
          <p className="text-2xl text-[#595c5e] dark:text-slate-400 font-medium italic leading-relaxed max-w-2xl mx-auto opacity-70">
            Kết nối liền mạch giữa quản lý và cư dân thông qua bộ công nghệ mạnh mẽ nhất trên cả nền tảng Web và Di động.
          </p>
        </motion.div>
      </header>

      {/* App Versions List */}
      <section className="relative z-10 px-12 pb-40 max-w-[1600px] mx-auto space-y-32">
        {versions.map((app, index) => (
          <motion.div 
            key={app.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} items-center gap-20`}
          >
            {/* Image Perspective */}
            <div className="flex-1 relative group">
              <div className="absolute inset-0 bg-[#4b49cb]/5 rounded-[3rem] blur-3xl group-hover:bg-[#4b49cb]/10 transition-colors"></div>
              <motion.div 
                whileHover={{ rotateY: index % 2 === 0 ? 5 : -5, rotateX: 2 }}
                className="relative rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white dark:border-slate-800 aspect-video lg:aspect-square"
              >
                <img src={app.image} alt={app.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-12">
                   <div className="flex items-center gap-4 text-white">
                      <div className={`p-4 rounded-2xl ${app.color} shadow-lg`}>
                        {app.icon}
                      </div>
                      <div>
                        <div className="text-xs font-black uppercase tracking-widest opacity-70">{app.type}</div>
                        <div className="text-2xl font-black">{app.name}</div>
                      </div>
                   </div>
                </div>
              </motion.div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-10">
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter">{app.name}</h2>
                <p className="text-xl text-[#595c5e] dark:text-slate-400 font-medium leading-relaxed italic">
                  {app.description}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {app.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="font-bold text-sm tracking-tight">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="pt-6">
                <button className={`flex items-center gap-3 px-10 py-5 rounded-2xl text-white font-black text-lg shadow-xl shadow-[#4b49cb]/20 active:scale-95 transition-all ${app.color}`}>
                  {app.linkText}
                  <ExternalLink className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </section>

      {/* CTA Footer */}
      <section className="relative z-10 px-12 pb-40 text-center">
        <div className="max-w-5xl mx-auto rounded-[4rem] bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl p-20 shadow-[0_40px_100px_rgba(0,0,0,0.08)] border border-white dark:border-slate-800">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-8 italic">Sẵn sàng nâng tầm <br/>không gian sống?</h2>
          <div className="flex justify-center gap-8">
            <Link to="/register" className="bg-[#4b49cb] text-white px-12 py-5 rounded-2xl font-black text-lg active:scale-95 transition-all">Hợp tác ngay</Link>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="py-20 text-center border-t border-[#abadb0]/10">
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#abadb0]">© 2024 SmartDorm Ecosystem. Crafted for perfection.</div>
      </footer>
      <BackToTop />
    </div>
  )
}

function CheckCircle2({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  )
}
