import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { billsApi, type Bill } from '../api/bills'
import { roomsApi, type Room } from '../api/rooms'
import { usersApi, type User } from '../api/users'
import { useAuth } from '../context/AuthContext'

export default function Bills() {
  const { user } = useAuth()
  const isAdmin = user && ['admin', 'manager', 'landlord'].includes(user.role)

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
    billsApi.getAll().then((r) => setBills(r.data)).catch(() => setError('Không thể tải hóa đơn'))
    roomsApi.getAll().then((r) => setRooms(r.data)).catch(() => {})
    usersApi.getAll().then((r) => setUsers(r.data)).catch(() => {})
  }

  useEffect(() => {
    Promise.all([billsApi.getAll(), roomsApi.getAll(), usersApi.getAll()])
      .then(([b, r, u]) => { setBills(b.data); setRooms(r.data); setUsers(u.data) })
      .catch(() => setError('Không thể tải dữ liệu'))
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    billsApi.create(form)
      .then(() => { 
        load(); 
        setShowForm(false); 
        setForm({ roomId: '', tenantId: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), rentAmount: 0, prevElectricity: 0, currElectricity: 0, prevWater: 0, currWater: 0, otherAmount: 0 }) 
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
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Quản lý hóa đơn</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Tổng cộng: <span className="text-indigo-600 font-bold">{bills.length}</span> hóa đơn trong hệ thống.
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

      {/* Create Form */}
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
              <label className="font-semibold text-slate-700">Chỉ số nước (m³)</label>
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

      {/* Table Section */}
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
                      <div className="font-bold text-slate-800">{typeof b.roomId === 'object' ? b.roomId?.name : 'Khách vãng lai'}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">#{b._id.slice(-6).toUpperCase()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700">{typeof b.tenantId === 'object' ? b.tenantId?.fullName : '—'}</div>
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
    </div>
  )
}
