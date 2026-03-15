import { useState, useEffect, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { notificationsApi, type Notification } from '../api/notifications'
import NotificationItem from '../components/NotificationItem'

export default function Notifications() {
  const { user } = useAuth()
  const location = useLocation()
  const isAdmin = user && ['admin', 'manager', 'landlord'].includes(user.role)
  
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'all' | 'unread'>('all')

  // Broadcast Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'general',
    targetRole: ''
  })

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      // Lấy tất cả lịch sử thông báo từ DB (không lọc isRead), limit để tránh quá tải
      const res = await notificationsApi.getAll({ limit: 100 })
      const list = Array.isArray(res.data) ? res.data : []
      setNotifications(list)
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Không thể tải thông báo'
      setError(msg)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Refetch mỗi khi vào trang Thông báo (điều hướng từ Bills, v.v.)
  useEffect(() => {
    if (location.pathname === '/app/notifications') loadData()
  }, [location.pathname, loadData])

  // Refetch khi focus lại tab hoặc nhận event từ trang khác (vd: vừa tạo hóa đơn)
  useEffect(() => {
    const onFocus = () => loadData()
    const onRefetch = () => loadData()
    window.addEventListener('focus', onFocus)
    window.addEventListener('refetch-notifications', onRefetch)
    return () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('refetch-notifications', onRefetch)
    }
  }, [loadData])

  // Polling 5s khi đang ở trang Thông báo để thông báo mới (vd: hóa đơn) hiện kịp
  useEffect(() => {
    if (location.pathname !== '/app/notifications') return
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [location.pathname, loadData])

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

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 animate-pulse">
          <div>
            <div className="h-8 w-64 bg-slate-200 rounded-lg mb-2" />
            <div className="h-4 w-96 bg-slate-100 rounded" />
          </div>
        </div>
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-xl w-fit">
          <div className="h-10 w-24 bg-slate-200 rounded-lg" />
          <div className="h-10 w-28 bg-slate-200 rounded-lg" />
        </div>
        <div className="bg-white rounded-2xl shadow-md overflow-hidden divide-y divide-slate-100">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="p-5 flex gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-200 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-slate-200 rounded" />
                <div className="h-3 w-full bg-slate-100 rounded" />
                <div className="h-3 w-1/3 bg-slate-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto min-w-0 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 min-w-0">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight truncate">Trung Tâm Thông Báo</h1>
          <p className="text-sm text-slate-500 mt-1 truncate">Cập nhật tin tức và thông báo từ ban quản lý</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={() => loadData()}
            disabled={loading}
            className="px-4 py-2.5 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 hover:scale-[1.02] active:scale-[0.98] text-slate-700 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center gap-2 disabled:opacity-60"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            Làm mới
          </button>
          {isAdmin && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] text-white text-sm font-semibold rounded-xl shadow-sm shadow-indigo-200 transition-all duration-200 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"></path></svg>
              Gửi Thông Báo (Broadcast)
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1.5 bg-slate-100/60 rounded-xl w-fit">
        <button
          type="button"
          onClick={() => setTab('all')}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${tab === 'all' ? 'bg-white text-slate-900 shadow-md scale-[1.02]' : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'}`}
        >
          Tất cả
        </button>
        <button
          type="button"
          onClick={() => setTab('unread')}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 flex items-center gap-2 ${tab === 'unread' ? 'bg-white text-slate-900 shadow-md scale-[1.02]' : 'text-slate-600 hover:text-slate-800 hover:bg-white/50'}`}
        >
          Chưa đọc
          {notifications.filter(n => !n.isRead).length > 0 && (
            <span className="min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold shadow-sm notif-dot-pulse">
              {notifications.filter(n => !n.isRead).length > 9 ? '9+' : notifications.filter(n => !n.isRead).length}
            </span>
          )}
        </button>
      </div>

      {/* Notifications List - style Facebook */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden min-w-0">
        {(tab === 'unread' ? notifications.filter(n => !n.isRead) : notifications).length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            </div>
            <p className="text-slate-500 font-medium">
              {tab === 'unread' ? 'Không có thông báo chưa đọc' : 'Chưa có thông báo nào'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Bấm &quot;Làm mới&quot; để tải lại</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {(tab === 'unread' ? notifications.filter(n => !n.isRead) : notifications).map((note, i) => (
              <NotificationItem
                key={note._id}
                note={note}
                onMarkRead={handleMarkRead}
                compact={false}
                index={i}
              />
            ))}
          </div>
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
