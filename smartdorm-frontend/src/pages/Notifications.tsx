import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { notificationsApi, type Notification } from '../api/notifications'

export default function Notifications() {
  const { user } = useAuth()
  const isAdmin = user && ['admin', 'manager', 'landlord'].includes(user.role)
  
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Broadcast Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general',
    targetRole: ''
  })

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await notificationsApi.getAll()
      setNotifications(res.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải thông báo')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
    } catch (err) {
      console.error('Error marking as read')
    }
  }

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await notificationsApi.broadcast(formData)
      setIsModalOpen(false)
      loadData()
      setFormData({ title: '', content: '', type: 'general', targetRole: '' })
      alert('Gửi thông báo hàng loạt thành công!')
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi gửi thông báo')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Trung Tâm Thông Báo</h1>
          <p className="text-sm text-slate-500 mt-1">Cập nhật tin tức và thông báo từ ban quản lý</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-indigo-200 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
            Gửi Thông Báo (Broadcast)
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col divide-y divide-slate-100">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Chưa có thông báo nào.</div>
        ) : (
          notifications.map(note => (
            <div 
              key={note._id} 
              className={`p-5 transition-colors ${!note.isRead ? 'bg-indigo-50/30' : 'hover:bg-slate-50'}`}
              onClick={() => !note.isRead && handleMarkRead(note._id)}
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {!note.isRead && <span className="flex-shrink-0 w-2 h-2 rounded-full bg-indigo-500"></span>}
                    <h3 className={`text-base font-semibold ${!note.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                      {note.title}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500">
                      {note.type}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1.5 whitespace-pre-wrap">{note.content}</p>
                  <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    {new Date(note.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
                {!note.isRead && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleMarkRead(note._id); }}
                    className="flex-shrink-0 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-100/50"
                  >
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Broadcast Modal */}
      {isAdmin && isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-100">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Gửi Thông Báo Hàng Loạt</h3>
              <button type="button" onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <form onSubmit={handleBroadcast} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tiêu đề <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-700"
                  placeholder="Nhập tiêu đề thông báo..."
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Người Nhận (Lọc theo Đối Tượng)</label>
                <select
                  value={formData.targetRole}
                  onChange={(e) => setFormData(prev => ({ ...prev, targetRole: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-700"
                >
                  <option value="">-- Gửi tất cả mọi người --</option>
                  <option value="tenant">Chỉ người thuê phòng (Tenant)</option>
                  <option value="staff">Chỉ nhân viên (Staff)</option>
                  <option value="admin">Chỉ ban quản lý (Admin/Manager)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Loại Thông Báo</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-700"
                >
                  <option value="general">Thông báo chung</option>
                  <option value="bill">Tài chính / Hóa đơn</option>
                  <option value="maintenance">Sự cố / Bảo trì</option>
                  <option value="system">Hệ thống</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nội dung <span className="text-rose-500">*</span></label>
                <textarea
                  required
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium text-slate-700 resize-none"
                  placeholder="Viết nội dung chi tiết..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors disabled:opacity-70 flex items-center gap-2"
                >
                  {submitting ? 'Đang gửi...' : 'Gửi Thông Báo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
