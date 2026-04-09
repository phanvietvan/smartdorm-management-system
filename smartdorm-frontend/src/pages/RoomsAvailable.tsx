import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  roomsApi, 
  type Room 
} from '../api/rooms'
import { rentalApi } from '../api/rentalRequests'
import { useAuth } from '../context/AuthContext'
import MainNavbar from '../components/MainNavbar'
import BackToTop from '../components/BackToTop'

export default function RoomsAvailable() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    roomsApi.getAvailable()
      .then((r) => setRooms(r.data))
      .catch(() => setError('Không thể tải danh sách phòng'))
      .finally(() => setLoading(false))
  }, [])

  const handleBookRoom = async (roomId: string) => {
    if (!user) {
      navigate('/login')
      return
    }

    setBookingId(roomId)
    try {
      await rentalApi.create({
        fullName: user.fullName,
        phone: user.phone || 'Chưa có SĐT',
        email: user.email,
        roomId: roomId
      })
      setSuccessMsg(`Yêu cầu thuê phòng ${rooms.find(r => r._id === roomId)?.name} đã được gửi thành công!`)
      setTimeout(() => setSuccessMsg(''), 5000)
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể đăng ký thuê phòng lúc này')
    } finally {
      setBookingId(null)
    }
  }

  // Asset URLs provided in HTML
  const ASSETS = {
    HERO_BG: "https://lh3.googleusercontent.com/aida-public/AB6AXuANptZUq_aQk_vSHgNk8F2LnUI2OxIY50HN-AWUgW83VW2xifZLdXoTZOBbqA6QI2wG6jQZ5NqNaZIcPVdsdL5GRjxVn-QvgRx6uf_428hQuPZKiyeXGgrouFZDj-hDidKaA2D_Z-j_90BD910clojjRGcR0ZNy3wftTzl5UzPFt-uYNXsLafws59b2_qO9Lclz9LIeVcTJdbgRff7uxY_iFbflH9PSbSQ7-Qks8_vlPIi5Nyyi1mPr7iJVmNMsAN68a2xDFkTwhp52",
    HCMC: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBXN1Pq6y0iFlVywofGDW0iQyUP3VmWJ3MNryPLuFj8p1VAlzx4VlhfO7400RBCiV3mQxDRhSxkAfPOYCAVBEixLTIZRHwWQhpoWt2boHIHzcgySmNURTqNCetZ9IemhWRfYjppxYZvwj9j8AwC7zE5LYD6gnsZdcVlpPzYsjbhsPNyuAfFoUU10zTvHq861xTYrGC2uzA4t1seu6gWGoOPTvERJWfO90re_TFYmdVheus4qdL9mV-EmMpAGGzqG_qM2uPD5RpdeZS",
    HANOI: "https://lh3.googleusercontent.com/aida-public/AB6AXuBhEGph3HU23Z9zW-KdWbvc6F8CCUD8uRyH17snCRsTVrKm0t-i_7bxjAhEIRqom39CVdPsZgKjS2yIZSNU_0ipDRQ1NIn02G4oz9LgfzLEmedJAI36_pfHlxC98zeSphlgmJ2hzQ9OpWXTbtdjNN9pOvxIoCqwZO3Gzs4dr-NxnzYvaEle-qJgvKEh2KSlvKwo_vb954gTvNFbvtxZMhRixK3MMqGR0a8TsTyCauiZfXDaKLAg9FUVOt_Vnsgd0zf1_dZGBMsFwox-",
    DALAT: "https://lh3.googleusercontent.com/aida-public/AB6AXuDA-RblwHcZCb34JY2L96995Hz-k3aswxxU_iuzm4mEQ-DEoMc6_szp2EQpmE9Wcu0xhRv8ttwKZce_7zx8OpkC722gufkQePm8rFtY_DmpNwu_Z1cxKa3tRCym1j_D47fg-uR0YTN3sdllMYVGUEJN46qjE14lDSGGpqW4yfd0vE9eN9u6h7-TuKRY1J4cQUdGeW_CBHPeVRI3DglepDApVveIejM9mjnpQHvxskOKxihmWSkhVDp29TNAjKpMCJCkP0eFpga2LM-Y",
    DANANG: "https://lh3.googleusercontent.com/aida-public/AB6AXuDvhAV98KntYsR1HsB8M7P_h1JB0t_m5JiJDLoeUCnXpSThLF9zKHlGhVmBQSDsVPm2sPaDL6QJO-I2Vwy0ff5gz9kopHdhsCbpQzuf_5RinqWF50cTB4OY2DGX_yAZq8iUjNEEpQsIlFKzQL7wVgvnu6vCBqv3sZDfOuJRi9L9VC8qgb4td0AqMSfFkc0smUaSZmwoKkJDE9J5lBNqEqbDPDNcyG4ds-hoC542zZE7hVKj-lfA9e7fy6aZdSMVt1i6qwivc1tHjpbp",
    PHILOSOPHY: "https://lh3.googleusercontent.com/aida-public/AB6AXuBxTGQalcbr6Wln04xkSJSxp71g2kTl36dVvqm-vtNiOO090W_6GHVo2M8YxZWL9qeVPeQZ1ckZNOu8uqkCD3fPwG5rRYmfDOFvBUtcm1bWhnyKX0nI-Tc-PAicso8A5il19jhOoFFR78xl5Y2A6e99xLLAqfq08C4HdgTJxPg2Nqah-WJbkNUJkvJEjp6BsKIrjpvAgEhQtU8mz41UX1gJrzsWx803qQqnuo5lyawaOD6vUtfQBfQVTaD4pKM-sCpJSi3-thwAvEsB",
    ROOM_DEMO: "https://lh3.googleusercontent.com/aida-public/AB6AXuCoG2-yQywjzAy231w_pChu_YIk9NRg73MDWzTliCS-OtUHTEGIRg4ikYwBCi6pdimyW7IK1n9Dh1cHid6U5AtcWuWZKv5oULwkUjrx2hWRdhn4qL2fgX3RO22UDP0oBfE5EQQSiqmohMIEwxP-Hgsanz_ZV0YBExIU40uLTsfizdBIaHKfbQuSetvqXm3wVI4dkKnGxkWlMm9nJIMYQT2h5VvWwUvhW9ZzjhWrKIeWZLbKaRVVbkyMEraj4Aoq2pNJQoRL6_UUvAif"
  }

  return (
    <div className="font-['Plus_Jakarta_Sans'] bg-background text-on-surface min-h-screen selection:bg-primary/10 transition-colors duration-500">
      <MainNavbar />

      <main>
        {/* Hero Section - Optimized for full screen and sharpness */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden pt-20">
          <div className="absolute inset-0 z-0">
            <img 
              className="w-full h-full object-cover object-center scale-105 transition-transform duration-[10s] ease-linear" 
              src="https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&q=100&w=3840" 
              alt="Ha Long Bay 4K Sunset" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-background"></div>
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 w-full max-w-5xl px-6 text-center"
          >
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-2xl mb-8 -translate-y-4">
              Tìm Kiếm & Trải Nghiệm <br/><span className="text-secondary-container drop-shadow-[0_0_30px_rgba(197,196,254,0.5)]">Không Gian Sống Thông Minh</span>
            </h1>
            
            {/* Sophisticated Search Bar - Repurposed for SmartDorm */}
            <div className="bg-white/90 backdrop-blur-2xl rounded-2xl p-2 shadow-[0_30px_60px_rgba(92,89,240,0.2)] flex flex-col md:flex-row gap-2 max-w-4xl mx-auto border border-white">
              <div className="flex-1 flex items-center px-4 py-3 border-r-0 md:border-r border-outline-variant/30">
                <span className="material-symbols-outlined text-primary mr-3">location_on</span>
                <div className="text-left">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-outline">Khu Vực</label>
                  <select className="bg-transparent border-none p-0 text-sm font-bold focus:ring-0 text-on-surface w-full outline-none">
                    <option>Hồ Chí Minh (Quận 1, 7, TP. Thủ Đức)</option>
                    <option>Hà Nội (Cầu Giấy, Hai Bà Trưng)</option>
                    <option>Đà Nẵng (Hải Châu, Liên Chiểu)</option>
                  </select>
                </div>
              </div>
              <div className="flex-1 flex items-center px-4 py-3 border-r-0 md:border-r border-outline-variant/30">
                <span className="material-symbols-outlined text-primary mr-3">payments</span>
                <div className="text-left">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-outline">Khoảng Giá</label>
                  <select className="bg-transparent border-none p-0 text-sm font-bold focus:ring-0 text-on-surface w-full outline-none">
                    <option>1.5Tr - 3Tr VNĐ</option>
                    <option>3Tr - 5Tr VNĐ</option>
                    <option>Trên 5Tr VNĐ</option>
                  </select>
                </div>
              </div>
              <div className="flex-1 flex items-center px-4 py-3">
                <span className="material-symbols-outlined text-primary mr-3">home</span>
                <div className="text-left">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-outline">Loại Phòng</label>
                  <select className="bg-transparent border-none p-0 text-sm font-bold focus:ring-0 text-on-surface w-full outline-none">
                    <option>Phòng Đơn Cao Cấp</option>
                    <option>Phòng Đôi Tiện Nghi</option>
                    <option>Ký Túc Xá Luxury</option>
                    <option>Căn Hộ Studio</option>
                  </select>
                </div>
              </div>
              <button className="bg-primary hover:bg-primary-container text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95">
                <span className="material-symbols-outlined">search</span>
                Tìm Phòng
              </button>
            </div>
          </motion.div>
        </section>



        {/* Private Selection (Dynamic Rooms) */}
        <section className="py-32 bg-surface-container-low">
          <div className="max-w-[1920px] mx-auto px-12">
            <div className="flex flex-col md:flex-row justify-between items-center mb-20">
              <div className="space-y-4">
                <span className="text-primary font-bold tracking-[0.2em] uppercase text-xs">Phủ Sóng Cư Trú</span>
                <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-on-surface italic">Premium Collection</h2>
              </div>
              <div className="flex gap-4">
                <button className="w-16 h-16 rounded-full border border-outline-variant flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="w-16 h-16 rounded-full border border-outline-variant flex items-center justify-center hover:bg-primary hover:text-white transition-all duration-300">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 gap-6">
                <div className="w-16 h-16 border-t-4 border-l-4 border-primary rounded-full animate-spin"></div>
                <p className="text-sm font-black uppercase tracking-widest opacity-40 italic">Luminous Loading...</p>
              </div>
            ) : error ? (
                <div className="p-20 bg-white rounded-[3rem] text-center shadow-2xl border border-error/20">
                  <p className="text-xl font-black text-error italic">{error}</p>
                </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {rooms.map((r, i) => (
                  <motion.div 
                    key={r._id}
                    whileHover={{ y: -15 }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group bg-surface-container-lowest rounded-[3rem] overflow-hidden shadow-[0_40px_80px_rgba(27,27,35,0.06)] border border-white dark:border-slate-800 transition-all duration-500"
                  >
                    <div className="relative h-80 overflow-hidden">
                      <img 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                        src={ASSETS.ROOM_DEMO} 
                        alt={r.name} 
                      />
                      <div className="absolute top-6 left-6 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full shadow-lg">
                        {i % 2 === 0 ? 'Smart Living Choice' : 'Premium Selection'}
                      </div>
                      <div className="absolute top-6 right-6">
                        <button className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md hover:bg-white/40 text-white flex items-center justify-center transition-all">
                          <span className="material-symbols-outlined">favorite</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-10">
                      <div className="flex justify-between items-start mb-6">
                        <div>
                          <p className="text-tertiary font-bold text-xs uppercase tracking-[0.15em] mb-2 italic">
                            {typeof r.areaId === 'object' ? (r.areaId as any)?.name : 'Việt Nam'} • Tầng {r.floor}
                          </p>
                          <h3 className="text-2xl font-black text-on-surface tracking-tighter">{r.name}</h3>
                        </div>
                        <div className="text-right">
                          <span className="text-primary font-black text-3xl tracking-tighter">
                            {((r.price ?? 0) / 1000000).toFixed(1)}M
                          </span>
                          <p className="text-[10px] text-outline uppercase font-black tracking-widest mt-1">mỗi tháng</p>
                        </div>
                      </div>

                      <div className="flex gap-8 border-t border-outline-variant/15 pt-8 mb-10">
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-outline text-lg">bed</span>
                          <span className="text-sm font-black whitespace-nowrap">Studio Full</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-outline text-lg">square_foot</span>
                          <span className="text-sm font-black whitespace-nowrap">32 m²</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-outline text-lg">verified</span>
                          <span className="text-sm font-black whitespace-nowrap">An Ninh</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button 
                          onClick={() => handleBookRoom(r._id)}
                          disabled={bookingId === r._id}
                          className="flex-[2] py-4.5 bg-primary text-white text-center font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-container transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-3 group disabled:opacity-50"
                        >
                          {bookingId === r._id ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <>
                              Đăng ký thuê
                              <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">bolt</span>
                            </>
                          )}
                        </button>
                        <Link 
                          to={`/room/${r._id}`}
                          className="flex-1 py-4.5 bg-surface-container-high text-on-surface text-center font-black rounded-2xl hover:bg-surface-container-highest transition-all text-sm uppercase tracking-widest flex items-center justify-center"
                        >
                          Chi tiết
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Global Success Notification */}
        {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[100] bg-primary-container text-on-primary-container px-8 py-5 rounded-[2rem] shadow-2xl border border-white/20 flex items-center gap-4"
          >
            <span className="material-symbols-outlined text-primary">verified</span>
            <span className="font-bold text-sm">{successMsg}</span>
            <button onClick={() => setSuccessMsg('')} className="ml-4 opacity-50 hover:opacity-100 transition-opacity">
               <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </motion.div>
        )}


      </main>

      {/* Editorial Footer */}
      <footer className="w-full border-t border-outline-variant/15 bg-surface-container-low">
        <div className="max-w-[1700px] mx-auto px-12 py-32 flex flex-col items-center space-y-12">
          <div className="flex flex-col items-center gap-4">
            <span className="text-4xl font-black text-primary tracking-tighter italic uppercase">SmartDorm</span>
            <div className="w-12 h-1 bg-primary/30 rounded-full"></div>
          </div>
          <div className="flex flex-wrap justify-center gap-10 md:gap-20">
            {['Privacy Policy', 'Terms of Service', 'Cookie Settings', 'Press Kit'].map(l => (
              <a key={l} className="text-xs font-black uppercase tracking-[0.2em] text-outline hover:text-primary transition-colors italic" href="#">{l}</a>
            ))}
          </div>
          <p className="text-sm font-bold text-outline uppercase tracking-widest opacity-40">© 2024 SmartDorm Global. All rights reserved.</p>
        </div>
      </footer>

      <BackToTop />
    </div>
  )
}
