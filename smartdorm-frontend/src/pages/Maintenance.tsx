import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { maintenanceApi, type MaintenanceRequest } from '../api/maintenance'
import { notificationsApi } from '../api/notifications'
import { roomsApi, type Room } from '../api/rooms'
import { useAuth } from '../context/AuthContext'
import SuccessScreen from '../components/SuccessScreen'
import { useSocket } from '../hooks/useSocket'

export default function Maintenance() {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([])
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ roomId: '', title: '', description: '' })
  const [showSuccess, setShowSuccess] = useState(false)

  const { user } = useAuth()
  const isTenant = user?.role === 'tenant'
  const { socket } = useSocket()

  const load = () => Promise.all([
    maintenanceApi.getAll().then((r) => setRequests(r.data)).catch(() => setError('Không thể tải danh sách yêu cầu sửa chữa')),
    roomsApi.getAll().then((r) => setRooms(r.data)).catch(() => {}),
  ])

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  // Real-time listener
  useEffect(() => {
    if (!socket) return
    const handler = (newNote: any) => {
      if (newNote.type === 'maintenance') {
        load()
      }
    }
    socket.on('new_notification', handler)
    return () => { socket.off('new_notification', handler) }
  }, [socket])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const reportTitle = form.title || 'Yêu cầu sửa chữa'
    const content = form.description ? `${reportTitle}: ${form.description}` : reportTitle
    try {
      await maintenanceApi.create(form)
      // Gửi thông báo cho admin và chủ trọ khi người thuê báo sự cố (backend phải cho phép tenant gọi với targetRole admin/landlord)
      try {
        await notificationsApi.broadcast({
          title: 'Báo cáo sự cố mới',
          content: `Người thuê báo: ${content}`,
          type: 'maintenance',
          targetRole: 'admin',
        })
      } catch (broadcastErr: any) {
        console.warn('Broadcast to admin failed:', broadcastErr?.response?.status, broadcastErr?.response?.data)
      }
      try {
        await notificationsApi.broadcast({
          title: 'Báo cáo sự cố mới',
          content: `Người thuê báo: ${content}`,
          type: 'maintenance',
          targetRole: 'landlord',
        })
      } catch (broadcastErr: any) {
        console.warn('Broadcast to landlord failed:', broadcastErr?.response?.status, broadcastErr?.response?.data)
      }
      setForm({ roomId: '', title: '', description: '' })
      setShowSuccess(true)
      window.dispatchEvent(new CustomEvent('refetch-notifications'))
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi tạo yêu cầu sửa chữa')
    } finally {
      setSubmitting(false)
    }
  }

  const statusLabel: Record<string, string> = { pending: 'Chờ xử lý', in_progress: 'Đang sửa', completed: 'Hoàn thành' }
  const statusColors: Record<string, string> = {
    pending: 'bg-rose-50 text-rose-600 border-rose-200/50',
    in_progress: 'bg-amber-50 text-amber-600 border-amber-200/50',
    completed: 'bg-emerald-50 text-emerald-600 border-emerald-200/50'
  }

  if (loading && requests.length === 0) return (
    <div className="flex items-center justify-center p-12">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  if (showSuccess) {
    return (
      <SuccessScreen
        message="Gửi yêu cầu sửa chữa thành công!"
        onDone={() => {
          setShowSuccess(false)
          load()
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Yêu cầu bảo trì, sửa chữa</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Quản lý các sự cố kỹ thuật và tiến độ khắc phục.
          </p>
        </div>
        {isTenant && (
          <button
             onClick={() => {
              setShowForm(!showForm)
              setError('')
            }}
             className={`px-4 py-2.5 text-white font-semibold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2 ${showForm ? 'bg-slate-400 hover:bg-slate-500' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'}`}
          >
            {showForm ? (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                Hủy bỏ
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                Báo sự cố
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

      {/* Tenant Repair Form */}
      {showForm && isTenant && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-rose-100 transform origin-top transition-all relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
          
          <h2 className="text-lg font-bold text-slate-800 mb-5 pb-4 border-b border-slate-100">Gửi yêu cầu bảo trì, sửa chữa</h2>
          
          {error && <div className="p-3 mb-5 bg-rose-50 text-rose-600 rounded-lg text-sm font-medium border border-rose-100">{error}</div>}
          
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="space-y-1.5 text-sm lg:col-span-1">
              <label className="font-semibold text-slate-700">Chọn phòng <span className="text-rose-500">*</span></label>
              <select 
                value={form.roomId} 
                onChange={(e) => setForm({ ...form, roomId: e.target.value })} 
                required
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium text-slate-800"
              >
                <option value="">-- Chọn phòng xảy ra sự cố --</option>
                {rooms.map((r) => (
                  <option key={r._id} value={r._id}>{r.name} {r.floor ? `(Tầng ${r.floor})` : ''}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1.5 text-sm lg:col-span-2">
              <label className="font-semibold text-slate-700">Tiêu đề sự cố <span className="text-rose-500">*</span></label>
              <input 
                value={form.title} 
                onChange={(e) => setForm({ ...form, title: e.target.value })} 
                required 
                placeholder="VD: Điều hòa không mát, Rò rỉ nước ở phòng tắm..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium text-slate-800"
              />
            </div>
            
            <div className="space-y-1.5 text-sm lg:col-span-3">
              <label className="font-semibold text-slate-700">Mô tả chi tiết tình trạng</label>
              <textarea 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                rows={4} 
                placeholder="Mô tả cụ thể vị trí, tình trạng hư hỏng, thời gian phát hiện để thợ dễ dàng nắm bắt..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-medium text-slate-800 resize-none"
              />
            </div>
            
            <div className="lg:col-span-3 flex justify-end pt-4 mt-2 border-t border-slate-100">
              <button 
                type="submit" 
                className="px-6 py-2.5 bg-rose-600 text-white font-semibold rounded-xl hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={submitting || !form.roomId || !form.title}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Đang gửi...
                  </>
                ) : 'Gửi yêu cầu bảo trì'}
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
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Người báo</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nội dung sự cố</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ngày báo</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Trạng thái</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mb-3">
                      <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">Không có yêu cầu bảo trì nào</h3>
                    <p className="text-xs text-slate-500 mt-1">Mọi thứ đang hoạt động bình thường.</p>
                  </td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{typeof r.roomId === 'object' ? r.roomId?.name : 'Chưa rõ'}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">#{r._id.slice(-5).toUpperCase()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-700">{typeof r.tenantId === 'object' ? r.tenantId?.fullName : '—'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 line-clamp-1">{r.title}</div>
                      {r.description && <div className="text-sm text-slate-500 mt-0.5 line-clamp-1">{r.description}</div>}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString('vi-VN') : '-'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${statusColors[r.status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {statusLabel[r.status] || r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/app/maintenance/${r._id}`} 
                        className="inline-flex items-center justify-center p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                        title="Xem chi tiết"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
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
