import { useState, useEffect, useCallback } from 'react'
import { notificationsApi, type Notification } from '../api/notifications'
import NotificationItem from '../components/NotificationItem'
import { useSocket } from '../hooks/useSocket'
import { 
    Bell, 
    Filter, 
    CheckCheck, 
    RefreshCw
} from 'lucide-react'
import { cn } from '../lib/utils'

const NOTIFICATION_TYPES = [
  { id: 'all', label: 'Tất cả' },
  { id: 'bill', label: 'Hóa đơn' },
  { id: 'maintenance', label: 'Bảo trì' },
  { id: 'payment', label: 'Thanh toán' },
  { id: 'rental', label: 'Thuê phòng' },
  { id: 'message', label: 'Tin nhắn' },
  { id: 'broadcast', label: 'Thông báo chung' },
  { id: 'system', label: 'Hệ thống' }
]

export default function NotificationsPage() {
  const { socket } = useSocket()
  
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<'all' | 'unread'>('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  const loadData = useCallback(async (isFresh = true) => {
    try {
      setLoading(true)
      const currentPage = isFresh ? 1 : page
      const res = await notificationsApi.getAll({ 
        isRead: tab === 'unread' ? false : undefined,
        type: typeFilter === 'all' ? undefined : typeFilter,
        page: currentPage,
        limit: 20
      })
      
      const newItems = res.data?.data || []
      setNotifications(prev => isFresh ? newItems : [...prev, ...newItems])
      setHasMore(newItems.length === 20)
      if (isFresh) setPage(1)
    } catch (err: any) {
      setError(err.message || 'Lỗi tải dữ liệu')
    } finally {
      setLoading(false)
    }
  }, [tab, typeFilter, page])

  useEffect(() => {
    loadData(true)
  }, [tab, typeFilter])

  // Listen for real-time notifications via Socket.io
  useEffect(() => {
    if (!socket) return
    
    const handler = (newNote: Notification) => {
      // Add only if it matches current filter
      const matchesType = typeFilter === 'all' || newNote.type === typeFilter
      const matchesTab = tab === 'all' || !newNote.isRead
      
      if (matchesType && matchesTab) {
        setNotifications(prev => [newNote, ...prev])
      }
    }

    socket.on('new_notification', handler)
    return () => { socket.off('new_notification', handler) }
  }, [socket, typeFilter, tab])

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id)
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
      // Refetch if on unread tab
      if (tab === 'unread') {
          setNotifications(prev => prev.filter(n => n._id !== id))
      }
    } catch (err) {
      console.error('Error marking as read')
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead()
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
      if (tab === 'unread') setNotifications([])
    } catch (err) {
      console.error('Error marking all as read')
    }
  }

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10">
        <div>
          <div className="flex items-center gap-4 mb-4">
             <div className="w-14 h-14 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-indigo-200">
                <Bell className="text-white w-7 h-7" />
             </div>
             <h1 className="text-4xl font-black text-[#2c2f31] tracking-tighter font-display leading-none">Trung tâm thông báo</h1>
          </div>
          <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] ml-1">Kênh cập nhật tin tức trực tiếp từ ban quản lý</p>
        </div>

        <div className="flex items-center gap-3">
             <button 
                onClick={handleMarkAllRead}
                className="flex items-center gap-2 px-5 py-3.5 bg-white border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-all shadow-sm group"
             >
                <CheckCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Đánh dấu đã đọc hết</span>
             </button>
             <button 
                onClick={() => loadData(true)}
                className="p-3.5 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-100 hover:scale-110 active:scale-95 transition-all"
             >
                <RefreshCw className={cn("w-5 h-5", loading && "animate-spin")} />
             </button>
        </div>
      </div>

      {/* Control Area */}
      <div className="bg-white rounded-[2.5rem] p-4 shadow-[0_30px_60px_rgba(74,63,226,0.04)] border border-slate-50 mb-8 flex flex-wrap items-center gap-4 sticky top-28 z-30">
        <div className="flex bg-slate-50 p-1.5 rounded-2xl gap-1">
          {(['all', 'unread'] as const).map(t => (
            <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                    "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-500",
                    tab === t ? "bg-white text-indigo-600 shadow-lg shadow-indigo-100/50" : "text-slate-400 hover:text-slate-600"
                )}
            >
              {t === 'all' ? 'Tất cả' : 'Chưa đọc'}
            </button>
          ))}
        </div>

        <div className="h-10 w-px bg-slate-100 mx-2 hidden sm:block"></div>

        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide flex-1 pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          {NOTIFICATION_TYPES.map(type => (
            <button
              key={type.id}
              onClick={() => setTypeFilter(type.id)}
              className={cn(
                "whitespace-nowrap px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                typeFilter === type.id ? "bg-indigo-600 text-white shadow-lg" : "bg-white text-slate-400 border border-slate-100 hover:border-indigo-200"
              )}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications Canvas */}
      <div className="bg-white rounded-[3rem] shadow-[0_45px_100px_rgba(74,63,226,0.07)] border border-slate-50 overflow-hidden min-h-[500px]">
        {notifications.length === 0 && !loading ? (
             <div className="py-32 text-center">
                <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 animate-bounce opacity-40">
                    <Bell className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-black text-slate-800 font-display uppercase tracking-tight mb-2">Không tìm thấy thông báo</h3>
                <p className="text-sm font-bold text-slate-400">Bạn đã cập nhật hết mọi tin tức!</p>
             </div>
        ) : (
             <div className="divide-y divide-slate-50">
                {notifications.map((note, idx) => (
                    <NotificationItem 
                        key={note._id} 
                        note={note} 
                        onMarkRead={handleMarkRead}
                        index={idx}
                    />
                ))}
             </div>
        )}

        {hasMore && (
            <div className="p-10 text-center border-t border-slate-50">
                <button 
                  onClick={() => setPage(p => p + 1)}
                  disabled={loading}
                  className="px-12 py-5 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-xl hover:shadow-indigo-600/20 disabled:opacity-50"
                >
                  {loading ? 'Đang tải...' : 'Xem thêm thông báo'}
                </button>
            </div>
        )}
      </div>

      {error && <div className="mt-8 p-6 bg-rose-50 border border-rose-100 rounded-3xl text-rose-600 text-sm font-bold text-center">{error}</div>}
    </div>
  )
}
