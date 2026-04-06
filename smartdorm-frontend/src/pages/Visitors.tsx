import { useEffect, useState } from 'react'
import { visitorsApi, type Visitor } from '../api/visitors'
import { roomsApi, type Room } from '../api/rooms'
import { usersApi, type User } from '../api/users'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../hooks/useSocket'
import { 
  Eye, X, Phone, User as UserIcon, MapPin, 
  Clock, FileText, Megaphone,
  ShieldCheck, Car
} from 'lucide-react'
import { cn } from '../lib/utils'

export default function Visitors() {
  const { user } = useAuth()
  const { socket } = useSocket()
  const isAdminOrSecurity = user && ['admin', 'manager', 'landlord', 'security'].includes(user.role)

  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', roomId: '', tenantId: '', purpose: '', plateNumber: '' })
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null)

  const load = () => {
    visitorsApi.getAll().then((r) => setVisitors(r.data)).catch(() => setError('Không thể tải dữ liệu khách ra vào'))
    roomsApi.getAll().then((r) => setRooms(r.data)).catch(() => {})
    usersApi.getAll().then((r) => setUsers(r.data)).catch(() => {})
  }

  useEffect(() => {
    Promise.all([visitorsApi.getAll(), roomsApi.getAll(), usersApi.getAll()])
      .then(([v, r, u]) => { setVisitors(v.data); setRooms(r.data); setUsers(u.data) })
      .catch(() => setError('Không thể tải danh sách khách. Vui lòng thử lại.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!socket) return
    socket.on('new_notification', (notif: any) => {
      if (notif.type === 'visitor') {
        load()
      }
    })
    return () => { socket.off('new_notification') }
  }, [socket])

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    visitorsApi.create({ ...form, roomId: form.roomId, tenantId: form.tenantId })
      .then(() => { 
        load(); 
        setShowForm(false); 
        setForm({ name: '', phone: '', roomId: '', tenantId: '', purpose: '', plateNumber: '' }) 
      })
      .catch((err) => setError(err.response?.data?.message || 'Lỗi đăng ký khách mới'))
      .finally(() => setSubmitting(false))
  }

  const handleCheckout = (id: string) => {
    if (!window.confirm('Xác nhận khách đã rời khỏi tòa nhà?')) return
    visitorsApi.checkout(id).then(() => load()).catch(() => setError('Không thể checkout cho khách này'))
  }

  if (loading && visitors.length === 0) return (
    <div className="flex items-center justify-center p-12">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-[#2c2f31] tracking-tight font-display">Sổ đăng ký khách vào ra</h1>
          <p className="text-[#595c5e] font-medium mt-1">
            Ghi chép và theo dõi khách đến thăm để đảm bảo an ninh tòa nhà.
          </p>
        </div>
        {isAdminOrSecurity && (
          <button
             onClick={() => {
              setShowForm(!showForm)
              setError('')
            }}
             className={cn(
               "px-6 py-3 text-white font-black rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 text-xs uppercase tracking-widest",
               showForm ? "bg-slate-800 hover:bg-black" : "bg-primary hover:bg-indigo-700 shadow-indigo-200 active:scale-95"
             )}
          >
            {showForm ? (
              <>
                <X className="w-4 h-4" />
                Hủy bỏ
              </>
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                Đăng ký khách mới
              </>
            )}
          </button>
        )}
      </div>

      {error && !showForm && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 font-bold flex items-center gap-3 animate-in slide-in-from-top-2">
          <Megaphone className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Check-in Form */}
      {showForm && isAdminOrSecurity && (
        <div className="bg-white rounded-[2.5rem] p-8 shadow-[0px_20px_50px_rgba(74,63,226,0.03)] border border-slate-50 transform origin-top animate-in zoom-in-95 duration-200">
          <h2 className="text-xl font-black text-[#2c2f31] mb-6 pb-4 border-b border-slate-50 font-display">Thông tin khách đến thăm</h2>
          
          {error && <div className="p-4 mb-6 bg-rose-50 text-rose-600 rounded-2xl text-sm font-bold border border-rose-100">{error}</div>}
          
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2 text-sm lg:col-span-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Họ và tên khách <span className="text-rose-500">*</span></label>
              <input 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                required 
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-700 placeholder:text-slate-300 transition-all"
                placeholder="VD: Nguyễn Văn A"
              />
            </div>
            
            <div className="space-y-2 text-sm">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Số điện thoại liên hệ</label>
              <input 
                value={form.phone} 
                onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-700 placeholder:text-slate-300 transition-all"
                placeholder="VD: 0912345678"
              />
            </div>
            
            <div className="space-y-2 text-sm">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Biển số xe (nếu có)</label>
              <input 
                value={form.plateNumber} 
                onChange={(e) => setForm({ ...form, plateNumber: e.target.value })} 
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-700 placeholder:text-slate-300 transition-all"
                placeholder="VD: 29A-123.45"
              />
            </div>
            
            <div className="space-y-2 text-sm">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Phòng cần thăm <span className="text-rose-500">*</span></label>
              <select 
                value={form.roomId} 
                onChange={(e) => setForm({ ...form, roomId: e.target.value })} 
                required
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-black text-xs uppercase transition-all"
              >
                <option value="">-- Chọn phòng --</option>
                {rooms.map((r) => (
                  <option key={r._id} value={r._id}>{r.name}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2 text-sm">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Người đại diện (Chủ phòng) <span className="text-rose-500">*</span></label>
              <select 
                value={form.tenantId} 
                onChange={(e) => setForm({ ...form, tenantId: e.target.value })} 
                required
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-black text-xs uppercase transition-all"
              >
                <option value="">-- Chọn người thuê --</option>
                {users.filter((u) => u.role === 'tenant').map((u) => (
                  <option key={u._id} value={u._id}>{u.fullName}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2 text-sm">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Mục đích chuyến thăm</label>
              <input 
                value={form.purpose} 
                onChange={(e) => setForm({ ...form, purpose: e.target.value })} 
                className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-700 placeholder:text-slate-300 transition-all"
                placeholder="VD: Gặp người thân, giao hàng..." 
              />
            </div>
            
            <div className="lg:col-span-3 flex justify-end pt-6 mt-2 border-t border-slate-50">
              <button 
                type="submit" 
                className="px-8 py-4 bg-primary text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-black transition-all shadow-xl shadow-indigo-100 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-3 active:scale-95"
                disabled={submitting}
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : <ShieldCheck className="w-4 h-4" />}
                Xác nhận thông tin
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white rounded-[2.5rem] shadow-[0px_20px_50px_rgba(74,63,226,0.03)] border border-slate-50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/30 border-b border-slate-50">
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Khách ghé thăm</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Điểm đến</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mục đích</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Thời gian vào</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Trạng thái</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {visitors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                      <ShieldCheck className="w-8 h-8 text-slate-200" />
                    </div>
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest italic">Không có dữ liệu lưu trú.</h3>
                  </td>
                </tr>
              ) : (
                visitors.map((v) => {
                  const hasLeft = Boolean(v.checkOutAt);
                  
                  return (
                    <tr key={v._id} className="hover:bg-slate-50/50 transition-all group">
                      <td className="px-8 py-6">
                        <div className="font-black text-[#2c2f31] flex items-center gap-3 font-display text-lg">
                          <div className={cn("w-2 h-2 rounded-full", hasLeft ? "bg-slate-200" : "bg-emerald-500 animate-pulse")}></div>
                          {v.name}
                        </div>
                        {v.phone && <div className="text-[11px] text-[#595c5e] font-black uppercase tracking-tight mt-1 opacity-60">{v.phone}</div>}
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-black text-primary font-display text-lg tracking-tighter">
                          {typeof v.roomId === 'object' ? v.roomId?.name : 'Phòng không xác định'}
                        </div>
                        <div className="text-[10px] text-[#595c5e] font-black uppercase tracking-widest mt-1">
                          Gặp: <span className="text-primary/70">{typeof v.tenantId === 'object' ? v.tenantId?.fullName : '—'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm text-[#595c5e] font-bold line-clamp-1 italic">{v.purpose || '-'}</div>
                      </td>
                      <td className="px-8 py-6">
                        {v.checkInAt ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-[#2c2f31]">{new Date(v.checkInAt).toLocaleDateString('vi-VN')}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(v.checkInAt).toLocaleTimeString('vi-VN')}</span>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex flex-col items-center">
                          {hasLeft ? (
                            <span className="px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] bg-slate-50 text-slate-400 border border-slate-100">Đã rời đi</span>
                          ) : (
                            <span className="px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.1em] bg-emerald-50 text-emerald-600 border border-emerald-100">Đang lưu trú</span>
                          )}
                        </div>
                      </td>
                      
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => setSelectedVisitor(v)}
                            className="p-2.5 text-slate-400 hover:text-primary hover:bg-slate-50 rounded-xl transition-all"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          
                          {isAdminOrSecurity && !hasLeft && (
                            <button 
                              onClick={() => handleCheckout(v._id)}
                              className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm active:scale-95"
                            >
                              Checkout
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedVisitor && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedVisitor(null)}></div>
          
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="px-8 py-6 bg-slate-50 flex justify-between items-center border-b border-slate-100">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-primary/10 text-primary rounded-xl">
                   <UserIcon className="w-5 h-5" />
                 </div>
                 <h3 className="text-xl font-black font-display text-[#2c2f31] uppercase tracking-tighter">Chi tiết khách đến</h3>
               </div>
               <button 
                onClick={() => setSelectedVisitor(null)}
                className="p-2 hover:bg-slate-200 rounded-full transition-all"
               >
                 <X className="w-5 h-5 text-slate-400" />
               </button>
             </div>

             <div className="p-8 space-y-8">
               {/* Guest Profile */}
               <div className="flex items-start gap-6">
                 <div className="w-20 h-20 bg-indigo-50 border-4 border-white shadow-xl rounded-3xl flex items-center justify-center flex-shrink-0 text-primary font-black text-2xl font-display">
                   {selectedVisitor.name.charAt(0).toUpperCase()}
                 </div>
                 <div>
                   <h4 className="text-2xl font-black text-[#2c2f31] font-display leading-tight">{selectedVisitor.name}</h4>
                   <div className="flex items-center gap-2 text-primary font-black text-[11px] uppercase tracking-[0.1em] mt-1">
                     <Phone className="w-3.5 h-3.5" />
                     {selectedVisitor.phone || 'Không có số điện thoại'}
                   </div>
                 </div>
               </div>

               {/* Detail Grid */}
               <div className="grid grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                 <div className="space-y-1">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <MapPin className="w-3 h-3" /> Điểm đến
                   </p>
                   <p className="text-lg font-black text-[#2c2f31] font-display tracking-tight">
                     {typeof selectedVisitor.roomId === 'object' ? selectedVisitor.roomId?.name : '...'}
                   </p>
                 </div>
                 <div className="space-y-1">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <UserIcon className="w-3 h-3" /> Người đón
                   </p>
                   <p className="text-sm font-black text-primary font-display">
                     {typeof selectedVisitor.tenantId === 'object' ? selectedVisitor.tenantId?.fullName : '...'}
                   </p>
                 </div>
                 <div className="space-y-1">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <Car className="w-3 h-3" /> Biển số xe
                   </p>
                   <p className="text-sm font-black text-[#2c2f31] font-display">
                     {selectedVisitor.plateNumber || '—'}
                   </p>
                 </div>
                 <div className="space-y-1 col-span-2 pt-2 border-t border-slate-200/50">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-3 h-3" /> Thời gian lưu trú
                    </p>
                    <div className="flex flex-col gap-1 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg">Vào</span>
                        <span className="text-sm font-black text-[#2c2f31]">
                          {selectedVisitor.checkInAt ? new Date(selectedVisitor.checkInAt).toLocaleString('vi-VN') : '—'}
                        </span>
                      </div>
                      {selectedVisitor.checkOutAt && (
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg">Ra</span>
                          <span className="text-sm font-black text-[#2c2f31]">
                            {new Date(selectedVisitor.checkOutAt).toLocaleString('vi-VN')}
                          </span>
                        </div>
                      )}
                    </div>
                 </div>
               </div>

               {/* Purpose */}
               <div className="space-y-2">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                   <FileText className="w-3 h-3" /> Mục đích chuyến thăm
                 </p>
                 <div className="p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 text-sm font-bold text-slate-700 italic leading-relaxed">
                   "{selectedVisitor.purpose || 'Không có ghi chú mục đích cụ thể.'}"
                 </div>
               </div>

               {/* Status Badge */}
               <div className="pt-4">
                 <div className={cn(
                   "w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-[10px] border shadow-sm",
                   selectedVisitor.checkOutAt 
                    ? "bg-slate-50 text-slate-400 border-slate-100" 
                    : "bg-emerald-50 text-emerald-600 border-emerald-100"
                 )}>
                   {selectedVisitor.checkOutAt ? (
                     <>
                       <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                       Đã hoàn tất thủ tục ra
                     </>
                   ) : (
                     <>
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                       Đang trong tòa nhà
                     </>
                   )}
                 </div>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  )
}
