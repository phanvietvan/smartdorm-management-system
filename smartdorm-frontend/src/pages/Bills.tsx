import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { billsApi, type Bill } from '../api/bills'
import { notificationsApi } from '../api/notifications'
import { roomsApi, type Room } from '../api/rooms'
import { usersApi, type User } from '../api/users'
import { useAuth } from '../context/AuthContext'

export default function Bills() {
  const { user } = useAuth()
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
      billsApi.getAll({ roomId: user?.roomId }).then((r) => setBills(r.data)).catch(() => setError('Không thể tải hóa đơn của bạn'))
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
          const b = await billsApi.getAll({ roomId: user?.roomId })
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

      {/* Bill List / Table */}
      {isTenant ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {bills.length === 0 ? (
            <div className="col-span-full py-24 bg-white rounded-[2.5rem] border border-dashed border-slate-200 text-center space-y-5">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
              </div>
              <div>
                <p className="text-xl font-bold text-slate-700 font-['Outfit']">Bạn hiện chưa có hóa đơn</p>
                <p className="text-sm text-slate-400 max-w-sm mx-auto">Thông tin hóa đơn hàng tháng của bạn sẽ được hiển thị tại đây sau khi quản lý lập hóa đơn.</p>
              </div>
            </div>
          ) : (
            bills.map(b => (
              <div key={b._id} className="relative bg-white rounded-[2.2rem] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 border border-slate-100 group">
                {/* Status Accent Bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-2 ${b.status === 'paid' ? 'bg-emerald-500' : b.status === 'overdue' ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
                
                <div className="p-8 pb-10">
                  <div className="flex justify-between items-start mb-10">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                         <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                         <span className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">Kỳ thanh toán</span>
                      </div>
                      <h3 className="text-3xl font-extrabold text-slate-900 font-['Outfit'] flex items-baseline gap-2">
                        Tháng {b.month}
                        <span className="text-lg font-medium text-slate-400">/ {b.year}</span>
                      </h3>
                    </div>
                    
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-2xl border text-[11px] font-bold uppercase tracking-wider ${
                      b.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                      b.status === 'overdue' ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                      'bg-amber-50 text-amber-600 border-amber-100'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${b.status === 'paid' ? 'bg-emerald-500' : b.status === 'overdue' ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
                      {statusLabel[b.status] || b.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                    <div className="space-y-5">
                      <div className="p-5 bg-indigo-50/40 rounded-3xl border border-indigo-100/50">
                        <p className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">Tổng số tiền</p>
                        <p className="text-3xl font-black text-indigo-600 font-['Outfit'] tabular-nums">
                          {b.totalAmount?.toLocaleString()}
                          <span className="ml-1 text-sm font-semibold opacity-70">₫</span>
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <span className="px-3 py-1.5 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-bold border border-slate-100 italic">Mã: #{b._id.slice(-6).toUpperCase()}</span>
                        <span className="px-3 py-1.5 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-bold border border-slate-100">Hạn: 10/{(b.month % 12) + 1}</span>
                      </div>
                    </div>

                    <div className="space-y-3.5 border-l border-slate-100/80 pl-8">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-medium">Tiền phòng</span>
                        <span className="font-bold text-slate-700">{b.rentAmount?.toLocaleString()} ₫</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-medium">Điện ({b.electricityAmount/3500} kWh)</span>
                        <span className="font-bold text-slate-700">{b.electricityAmount?.toLocaleString()} ₫</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 font-medium">Tiền nước</span>
                        <span className="font-bold text-slate-700">{b.waterAmount?.toLocaleString()} ₫</span>
                      </div>
                      {b.otherAmount > 0 && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-400 font-medium">Phụ phí</span>
                          <span className="font-bold text-slate-700">{b.otherAmount?.toLocaleString()} ₫</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex border-t border-slate-50 divide-x divide-slate-50 bg-slate-50/10">
                  <Link 
                    to={`/app/bills/${b._id}`} 
                    className="flex-1 py-5 text-slate-600 font-bold text-center hover:bg-slate-50 hover:text-indigo-600 transition-all text-xs tracking-wider uppercase font-['Outfit']"
                  >
                    Xem chi tiết chỉ số
                  </Link>
                  {b.status !== 'paid' && (
                    <Link 
                      to="/app/payments" 
                      className="flex-1 py-5 bg-indigo-600 text-white font-bold text-center hover:bg-indigo-700 transition-all text-xs tracking-wider uppercase shadow-[0_15px_30px_-5px_rgba(79,70,229,0.3)] font-['Outfit']"
                    >
                      Thanh toán ngay
                    </Link>
                  )}
                </div>
              </div>
            ))
          )}
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
