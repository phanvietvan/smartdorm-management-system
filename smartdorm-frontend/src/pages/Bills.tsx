import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { billsApi, type Bill } from '../api/bills'
import { notificationsApi } from '../api/notifications'
import { roomsApi, type Room } from '../api/rooms'
import { usersApi, type User } from '../api/users'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/utils'
import { useSocket } from '../hooks/useSocket'

export default function Bills() {
  const { user } = useAuth()
  const { socket } = useSocket()
  const isAdmin = user && ['admin', 'manager', 'landlord'].includes(user.role)
  const isTenant = user?.role === 'tenant'

  const [bills, setBills] = useState<Bill[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ 
    roomId: '', 
    tenantId: '', 
    month: new Date().getMonth() + 1, 
    year: new Date().getFullYear(), 
    rentAmount: 0, 
    prevElectricity: 0, 
    currElectricity: 0, 
    prevWater: 0, 
    currWater: 0, 
    otherAmount: 0 
  })

  const load = () => {
    if (isTenant) {
      const roomId = typeof user?.roomId === 'object' ? (user.roomId as any)?._id : user?.roomId
      billsApi.getAll({ roomId }).then((r) => setBills(r.data)).catch(() => setError('Không thể tải hóa đơn của bạn'))
    } else {
      billsApi.getAll().then((r) => setBills(r.data)).catch(() => setError('Không thể tải hóa đơn'))
      roomsApi.getAll().then((r) => setRooms(r.data)).catch(() => {})
      usersApi.getAll().then((r) => setUsers(r.data)).catch(() => {})
    }
  }

  useEffect(() => {
    setLoading(true)
    const fetchData = async () => {
      try {
        if (isTenant) {
          const roomId = typeof user?.roomId === 'object' ? (user.roomId as any)?._id : user?.roomId
          const b = await billsApi.getAll({ roomId })
          setBills(b.data)
        } else {
          const [b, r, u] = await Promise.all([
            billsApi.getAll(),
            roomsApi.getAll(),
            usersApi.getAll()
          ])
          setBills(b.data)
          setRooms(r.data)
          setUsers(u.data)
        }
      } catch (err) {
        setError('Không thể tải dữ liệu hóa đơn')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [isTenant, user?.roomId])

  useEffect(() => {
    if (!socket) return
    socket.on('new_notification', (notif: any) => {
      if (notif.type === 'bill') {
        load()
      }
    })
    return () => { socket.off('new_notification') }
  }, [socket])

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const roomId = form.roomId
    const month = form.month
    const year = form.year
    billsApi.create(form)
      .then(() => {
        // Gửi thông báo cho đúng phòng vừa tạo hóa đơn
        if (roomId) {
          notificationsApi.broadcast({
            title: 'Hóa đơn mới',
            content: `Bạn có hóa đơn tháng ${month}/${year}. Vui lòng thanh toán trước hạn.`,
            type: 'bill',
            roomId,
          }).catch(() => {})
        }
        load()
        setShowForm(false)
        setForm({ roomId: '', tenantId: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), rentAmount: 0, prevElectricity: 0, currElectricity: 0, prevWater: 0, currWater: 0, otherAmount: 0 })
        window.dispatchEvent(new CustomEvent('refetch-notifications'))
      })
      .catch((err) => setError(err.response?.data?.message || 'Lỗi thêm hóa đơn'))
      .finally(() => setSubmitting(false))
  }

  const statusLabel: Record<string, string> = { pending: 'Chờ thanh toán', paid: 'Đã thanh toán', overdue: 'Đã quá hạn' }
  const statusColors: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-600 border-amber-200/50',
    paid: 'bg-emerald-50 text-emerald-600 border-emerald-200/50',
    overdue: 'bg-rose-50 text-rose-600 border-rose-200/50'
  }

  if (loading && bills.length === 0) return (
    <div className="flex items-center justify-center p-12">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-['Outfit']">
            {isTenant ? 'Hóa đơn của tôi' : 'Quản lý hóa đơn'}
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {isTenant 
              ? `Hệ thống ghi nhận bạn có ${bills.length} hóa đơn` 
              : `Tổng cộng: ${bills.length} hóa đơn trong hệ thống.`
            }
          </p>
        </div>
        {isAdmin && (
          <button
             onClick={() => {
              setShowForm(!showForm)
              setError('')
            }}
             className={`px-4 py-2.5 text-white font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 ${showForm ? 'bg-slate-400 hover:bg-slate-500' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}
          >
            {showForm ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                Hủy bỏ
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                Tạo hóa đơn
              </>
            )}
          </button>
        )}
      </div>

      {error && !showForm && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 font-medium flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          {error}
        </div>
      )}

      {/* Create Form (Admin Only) */}
      {showForm && isAdmin && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transform origin-top transition-all">
          <h2 className="text-lg font-bold text-slate-800 mb-5 pb-4 border-b border-slate-100">Lập hóa đơn mới</h2>
          
          {error && <div className="p-3 mb-5 bg-rose-50 text-rose-600 rounded-lg text-sm font-medium border border-rose-100">{error}</div>}
          
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="space-y-1.5 text-sm">
              <label className="font-semibold text-slate-700">Phòng <span className="text-rose-500">*</span></label>
              <select 
                value={form.roomId} 
                onChange={(e) => {
                  const rid = e.target.value
                  const room = rooms.find(r => r._id === rid)
                  const tenant = users.find(u => u.roomId === rid || (typeof u.roomId === 'object' && (u.roomId as any)?._id === rid))
                  setForm(prev => ({ 
                    ...prev, 
                    roomId: rid, 
                    rentAmount: room?.price || 0,
                    tenantId: tenant?._id || ''
                  }))
                }} 
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800"
              >
                <option value="">-- Chọn phòng --</option>
                {rooms.map((r) => (
                  <option key={r._id} value={r._id}>{r.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1.5 text-sm">
              <label className="font-semibold text-slate-700">Người thuê <span className="text-rose-500">*</span></label>
              <select 
                value={form.tenantId} 
                onChange={(e) => setForm({ ...form, tenantId: e.target.value })} 
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800"
              >
                <option value="">-- Chọn người thuê --</option>
                {users.filter((u) => u.role === 'tenant').map((u) => (
                  <option key={u._id} value={u._id}>{u.fullName}</option>
                ))}
              </select>
              {form.roomId && !form.tenantId && (
                <p className="text-[10px] text-rose-500 font-medium mt-1">Phòng này chưa có người thuê được gán!</p>
              )}
            </div>
            
            <div className="space-y-1.5 text-sm">
              <label className="font-semibold text-slate-700">Kỳ thanh toán</label>
              <div className="flex gap-2">
                <input 
                  type="number" min={1} max={12} 
                  value={form.month} 
                  onChange={(e) => setForm({ ...form, month: +e.target.value })} 
                  className="w-1/2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800 text-center"
                  title="Tháng"
                />
                <input 
                  type="number" min={2020} 
                  value={form.year} 
                  onChange={(e) => setForm({ ...form, year: +e.target.value })} 
                  className="w-1/2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800 text-center"
                  title="Năm"
                />
              </div>
            </div>
            
            <div className="space-y-1.5 text-sm">
              <label className="font-semibold text-slate-700">Tiền phòng (VNĐ)</label>
              <input 
                type="number" 
                value={form.rentAmount === 0 ? '' : form.rentAmount} 
                onChange={(e) => setForm({ ...form, rentAmount: +e.target.value || 0 })} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800 text-right"
                placeholder="0"
              />
            </div>
            
            <div className="space-y-1.5 text-sm">
              <label className="font-semibold text-slate-700">Chỉ số điện (kWh)</label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={form.prevElectricity === 0 ? '' : form.prevElectricity} 
                  onChange={(e) => setForm({ ...form, prevElectricity: +e.target.value || 0 })} 
                  className="w-1/2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800 text-right"
                  placeholder="Chỉ số cũ"
                  title="Chỉ số điện cũ"
                />
                <input 
                  type="number" 
                  value={form.currElectricity === 0 ? '' : form.currElectricity} 
                  onChange={(e) => setForm({ ...form, currElectricity: +e.target.value || 0 })} 
                  className="w-1/2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800 text-right"
                  placeholder="Chỉ số mới"
                  title="Chỉ số điện mới"
                />
              </div>
            </div>
            
            <div className="space-y-1.5 text-sm">
              <label className="font-semibold text-slate-700">Chỉ số nước (m³) </label>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={form.prevWater === 0 ? '' : form.prevWater} 
                  onChange={(e) => setForm({ ...form, prevWater: +e.target.value || 0 })} 
                  className="w-1/2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800 text-right"
                  placeholder="Chỉ số cũ"
                  title="Chỉ số nước cũ"
                />
                <input 
                  type="number" 
                  value={form.currWater === 0 ? '' : form.currWater} 
                  onChange={(e) => setForm({ ...form, currWater: +e.target.value || 0 })} 
                  className="w-1/2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800 text-right"
                  placeholder="Chỉ số mới"
                  title="Chỉ số nước mới"
                />
              </div>
            </div>

            <div className="space-y-1.5 text-sm">
              <label className="font-semibold text-slate-700">Phụ phí khác (VNĐ)</label>
              <input 
                type="number" 
                value={form.otherAmount === 0 ? '' : form.otherAmount} 
                onChange={(e) => setForm({ ...form, otherAmount: +e.target.value || 0 })} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800 text-right"
                placeholder="0"
              />
            </div>
            
            <div className="lg:col-span-3 flex justify-end pt-4 mt-2 border-t border-slate-100">
              <button 
                type="submit" 
                className="px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Đang xử lý...
                  </>
                ) : 'Tạo hóa đơn'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TENANT PORTAL UI - EDITORIAL CANVAS */}
      {isTenant ? (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {/* Hero Section: Account Statement */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-indigo-400 to-indigo-500 p-10 rounded-[2.5rem] text-white flex flex-col justify-between shadow-[0_20px_50px_rgba(74,63,226,0.1)] min-h-[350px]">
              <div className="relative z-10">
                <p className="text-white/70 font-black tracking-[0.2em] text-[10px] mb-4 uppercase">Sao kê tài khoản hiện tại</p>
                <h2 className="text-5xl font-black tracking-tighter font-display leading-[0.9] text-white">Tổng dư nợ<br/>cần thanh toán.</h2>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-baseline gap-4 mb-10">
                  <span className="text-7xl font-black font-display tracking-tighter text-white">
                    {bills.filter(b => b.status === 'pending' || b.status === 'unpaid').reduce((acc, b) => acc + (b.totalAmount || 0), 0).toLocaleString()} <span className="text-3xl opacity-50 font-normal">₫</span>
                  </span>
                  {bills.some(b => b.status !== 'paid') && (
                    <span className="bg-white/20 text-white px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase backdrop-blur-md">Hạn chót: 10/{(new Date().getMonth() + 2) % 12 || 12}</span>
                  )}
                </div>
                
                <div className="flex gap-4">
                  <Link to="/app/payments" className="bg-white text-indigo-500 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.03] active:scale-[0.98] transition-all flex items-center gap-3 shadow-xl">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    Thanh toán ngay
                  </Link>
                  <button className="bg-white/10 text-white border border-white/20 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-3 backdrop-blur-sm">
                    Cài đặt thanh toán
                  </button>
                </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -right-24 -bottom-24 w-72 h-72 bg-white/10 rounded-full blur-[80px] pointer-events-none"></div>
              <div className="absolute right-12 top-12 w-48 h-48 bg-white/10 rounded-full blur-[60px] pointer-events-none"></div>
            </div>

            {/* Eco-Incentive Program Card (Bento Style) */}
            <div className="bg-white p-9 rounded-[2.5rem] shadow-[0px_20px_50px_rgba(74,63,226,0.03)] border border-slate-50 flex flex-col justify-between group overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
                <svg className="w-32 h-32 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253"></path></svg>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-2 text-emerald-500 mb-6">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <span className="text-[10px] font-black tracking-[0.2em] uppercase">ECO-INCENTIVE</span>
                </div>
                <h3 className="text-2xl font-black font-display tracking-tight leading-tight mb-4">Ghi nhận sống xanh.</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                  Mức tiêu thụ năng lượng của bạn đang thấp hơn trung bình khu nhà <span className="text-emerald-500 font-bold">12%</span>. Bạn nhận được một khoản tin dụng quà tặng!
                </p>
              </div>
              
              <div className="mt-10 p-5 bg-emerald-50 rounded-2xl flex items-center gap-5 border border-emerald-100/50">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                  <span className="text-sm font-black">-đ</span>
                </div>
                <div>
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest opacity-70">ÁP DỤNG THÁNG TỚI</p>
                  <p className="text-base font-bold text-slate-800">Sustainability Credit</p>
                </div>
              </div>
            </div>
          </section>

          {/* Monthly Breakdown: Service Cards */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black font-display tracking-tight">Chi tiết hóa đơn tháng gần nhất</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dữ liệu từ {bills[0] ? `tháng ${bills[0].month}/${bills[0].year}` : 'N/A'}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Rent */}
              <div className="bg-white p-7 rounded-[2rem] shadow-[0px_20px_50px_rgba(74,63,226,0.03)] border border-slate-50 hover:shadow-xl transition-all duration-300 group">
                <div className="w-14 h-14 bg-primary/5 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                   <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 opacity-60">TIỀN PHÒNG</p>
                <p className="text-2xl font-black font-display text-slate-800">{bills[0]?.rentAmount?.toLocaleString()} đ</p>
                <div className="text-[10px] text-emerald-500 font-bold mt-4 flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full w-fit">
                  <div className="w-1 h-1 bg-emerald-500 rounded-full"></div>
                  Fixed Rate
                </div>
              </div>
              
              {/* Electricity */}
              <div className="bg-white p-7 rounded-[2rem] shadow-[0px_20px_50px_rgba(74,63,226,0.03)] border border-slate-50 hover:shadow-xl transition-all duration-300 group">
                <div className="w-14 h-14 bg-amber-500/5 rounded-2xl flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 opacity-60">TIỀN ĐIỆN</p>
                <p className="text-2xl font-black font-display text-slate-800">{bills[0]?.electricityAmount?.toLocaleString()} đ</p>
                <div className="text-[10px] text-amber-600 font-bold mt-4 flex items-center gap-1.5 px-3 py-1 bg-amber-50 rounded-full w-fit">
                   <div className="w-1 h-1 bg-amber-500 rounded-full"></div>
                   {(bills[0]?.electricityAmount || 0) / 3500} kWh
                </div>
              </div>
              
              {/* Water */}
              <div className="bg-white p-7 rounded-[2rem] shadow-[0px_20px_50px_rgba(74,63,226,0.03)] border border-slate-50 hover:shadow-xl transition-all duration-300 group">
                <div className="w-14 h-14 bg-blue-500/5 rounded-2xl flex items-center justify-center text-blue-500 mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 opacity-60">TIỀN NƯỚC</p>
                <p className="text-2xl font-black font-display text-slate-800">{bills[0]?.waterAmount?.toLocaleString()} đ</p>
                <div className="text-[10px] text-blue-600 font-bold mt-4 flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-full w-fit">
                   <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                   Metered Usage
                </div>
              </div>
              
              {/* Internet/Others */}
              <div className="bg-white p-7 rounded-[2rem] shadow-[0px_20px_50px_rgba(74,63,226,0.03)] border border-slate-50 hover:shadow-xl transition-all duration-300 group">
                <div className="w-14 h-14 bg-rose-500/5 rounded-2xl flex items-center justify-center text-rose-500 mb-6 group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.485c5.857-5.857 15.355-5.857 21.213 0"></path></svg>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 opacity-60">PHỤ PHÍ</p>
                <p className="text-2xl font-black font-display text-slate-800">{(bills[0]?.otherAmount || 0).toLocaleString()} đ</p>
                <div className="text-[10px] text-rose-500 font-bold mt-4 flex items-center gap-1.5 px-3 py-1 bg-rose-50 rounded-full w-fit">
                   <div className="w-1 h-1 bg-rose-500 rounded-full"></div>
                   Building Services
                </div>
              </div>
            </div>
          </section>

          {/* Payment History Section */}
          <section className="bg-white rounded-[2.5rem] overflow-hidden shadow-[0px_20px_50px_rgba(74,63,226,0.03)] border border-slate-50">
            <div className="p-9 flex items-center justify-between border-b border-slate-50">
              <h3 className="text-2xl font-black font-display tracking-tight">Lịch sử thanh toán</h3>
              <button className="text-primary font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:underline">
                Xem chi tiết
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">
                    <th className="px-9 py-6">Mã hóa đơn</th>
                    <th className="px-9 py-6">Kỳ thu</th>
                    <th className="px-9 py-6">Số tiền</th>
                    <th className="px-9 py-6">Trạng thái</th>
                    <th className="px-9 py-6 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {bills.length > 0 ? (
                    bills.map((bill) => (
                      <tr key={bill._id} className="hover:bg-slate-50/50 transition-all group">
                        <td className="px-9 py-6">
                           <span className="text-sm font-black text-slate-800 font-display">#INV-{bill._id.slice(-6).toUpperCase()}</span>
                        </td>
                        <td className="px-9 py-6 text-xs text-slate-500 font-bold uppercase tracking-widest leading-none">Tháng {bill.month}/{bill.year}</td>
                        <td className="px-9 py-6 font-black text-slate-800 text-lg tracking-tight font-display">{bill.totalAmount?.toLocaleString()} đ</td>
                        <td className="px-9 py-6">
                           <span className={cn(
                             "px-4 py-1.5 text-[9px] font-black rounded-full uppercase tracking-widest inline-block border",
                             bill.status === 'paid' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                             bill.status === 'pending' ? "bg-amber-50 text-amber-600 border-amber-100" : 
                             "bg-rose-50 text-rose-600 border-rose-100"
                           )}>
                             {bill.status === 'paid' ? 'ĐÃ TRẢ' : bill.status === 'pending' ? 'CHỜ TRẢ' : 'QUÁ HẠN'}
                           </span>
                        </td>
                        <td className="px-9 py-6 text-right">
                          <Link to={`/app/bills/${bill._id}`} className="p-3 bg-slate-50 text-slate-400 hover:bg-primary hover:text-white rounded-xl transition-all inline-block shadow-sm">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"></path></svg>
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-9 py-20 text-center text-slate-400 italic font-medium">Bạn chưa có dữ liệu giao dịch nào.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mã / Phòng</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Người thuê</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Kỳ thu</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Tổng thanh toán</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {bills.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      </div>
                      <h3 className="text-sm font-bold text-slate-800">Không có dữ liệu hóa đơn</h3>
                    </td>
                  </tr>
                ) : (
                  bills.map((b) => (
                    <tr key={b._id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{typeof b.roomId === 'object' ? (b.roomId as any)?.name : 'Khách vãng lai'}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">#{b._id.slice(-6).toUpperCase()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-700">{typeof b.tenantId === 'object' ? (b.tenantId as any)?.fullName : '—'}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-600">
                          {String(b.month).padStart(2, '0')} / {b.year}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-bold text-indigo-600 text-sm">
                          {b.totalAmount?.toLocaleString('vi-VN')}₫
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${statusColors[b.status] || 'bg-slate-100 text-slate-600'}`}>
                          {statusLabel[b.status] || b.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          to={`/app/bills/${b._id}`} 
                          className="inline-flex items-center justify-center px-3 py-1.5 text-sm font-semibold text-indigo-600 bg-indigo-50 border border-transparent rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        >
                          Chi tiết
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
