import { useEffect, useState } from 'react'
import { visitorsApi, type Visitor } from '../api/visitors'
import { roomsApi, type Room } from '../api/rooms'
import { usersApi, type User } from '../api/users'
import { useAuth } from '../context/AuthContext'

export default function Visitors() {
  const { user } = useAuth()
  const isAdminOrSecurity = user && ['admin', 'manager', 'landlord', 'security'].includes(user.role)

  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '', roomId: '', tenantId: '', purpose: '' })

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

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    visitorsApi.create({ ...form, roomId: form.roomId, tenantId: form.tenantId })
      .then(() => { 
        load(); 
        setShowForm(false); 
        setForm({ name: '', phone: '', roomId: '', tenantId: '', purpose: '' }) 
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
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Sổ đăng ký khách vào ra</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Ghi chép và theo dõi khách đến thăm để đảm bảo an ninh tòa nhà.
          </p>
        </div>
        {isAdminOrSecurity && (
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg>
                Đăng ký khách mới
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

      {/* Check-in Form */}
      {showForm && isAdminOrSecurity && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 transform origin-top transition-all">
          <h2 className="text-lg font-bold text-slate-800 mb-5 pb-4 border-b border-slate-100">Thông tin khách đến thăm</h2>
          
          {error && <div className="p-3 mb-5 bg-rose-50 text-rose-600 rounded-lg text-sm font-medium border border-rose-100">{error}</div>}
          
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="space-y-1.5 text-sm lg:col-span-2">
              <label className="font-semibold text-slate-700">Họ và tên khách <span className="text-rose-500">*</span></label>
              <input 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                required 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800"
                placeholder="VD: Nguyễn Văn A"
              />
            </div>
            
            <div className="space-y-1.5 text-sm">
              <label className="font-semibold text-slate-700">Số điện thoại liên hệ</label>
              <input 
                value={form.phone} 
                onChange={(e) => setForm({ ...form, phone: e.target.value })} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800"
                placeholder="VD: 0912345678"
              />
            </div>
            
            <div className="space-y-1.5 text-sm">
              <label className="font-semibold text-slate-700">Phòng cần thăm <span className="text-rose-500">*</span></label>
              <select 
                value={form.roomId} 
                onChange={(e) => setForm({ ...form, roomId: e.target.value })} 
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
              <label className="font-semibold text-slate-700">Người đại diện (Chủ phòng) <span className="text-rose-500">*</span></label>
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
            </div>
            
            <div className="space-y-1.5 text-sm">
              <label className="font-semibold text-slate-700">Mục đích chuyến thăm</label>
              <input 
                value={form.purpose} 
                onChange={(e) => setForm({ ...form, purpose: e.target.value })} 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-800"
                placeholder="VD: Gặp người thân, giao hàng..." 
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
                    Đang lưu...
                  </>
                ) : 'Xác nhận thông tin khách'}
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
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Khách ghé thăm</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Điểm đến</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mục đích</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Thời gian vào</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Trạng thái</th>
                {isAdminOrSecurity && <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {visitors.length === 0 ? (
                <tr>
                  <td colSpan={isAdminOrSecurity ? 6 : 5} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                      <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">Không có dữ liệu khách ra vào</h3>
                  </td>
                </tr>
              ) : (
                visitors.map((v) => {
                  const hasLeft = Boolean(v.checkOutAt);
                  
                  return (
                    <tr key={v._id} className={`hover:bg-slate-50/70 transition-colors group ${!hasLeft ? 'bg-indigo-50/30' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${hasLeft ? 'bg-slate-300' : 'bg-emerald-500 animate-pulse'}`}></div>
                          {v.name}
                        </div>
                        {v.phone && <div className="text-xs text-slate-500 font-medium mt-1">{v.phone}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-indigo-600 line-clamp-1">
                          {typeof v.roomId === 'object' ? v.roomId?.name : 'Phòng không xác định'}
                        </div>
                        <div className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">
                          Gặp: <span className="text-slate-700">{typeof v.tenantId === 'object' ? v.tenantId?.fullName : '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600 font-medium line-clamp-2">{v.purpose || '-'}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                        {v.checkInAt ? (
                          <div className="flex flex-col">
                            <span>{new Date(v.checkInAt).toLocaleDateString('vi-VN')}</span>
                            <span className="text-xs text-slate-400">{new Date(v.checkInAt).toLocaleTimeString('vi-VN')}</span>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          {hasLeft ? (
                            <>
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">Đã rời đi</span>
                              <span className="text-xs text-slate-400 mt-1">{new Date(v.checkOutAt!).toLocaleTimeString('vi-VN')}</span>
                            </>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">Đang ở trong tòa nhà</span>
                          )}
                        </div>
                      </td>
                      
                      {isAdminOrSecurity && (
                        <td className="px-6 py-4 text-right">
                          {!hasLeft ? (
                            <button 
                              onClick={() => handleCheckout(v._id)}
                              className="inline-flex items-center justify-center px-4 py-1.5 text-sm font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-all shadow-sm"
                            >
                              Khách ra
                            </button>
                          ) : (
                            <span className="text-sm font-medium text-slate-400 italic">Hoàn tất</span>
                          )}
                        </td>
                      )}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
