import { useEffect, useState, useMemo } from 'react'
import { dashboardApi, type DashboardStats, type RevenueReport } from '../api/dashboard'
import { billsApi, type Bill } from '../api/bills'
import { notificationsApi, type Notification } from '../api/notifications'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Bed, Receipt, Banknote, Wrench, Zap, Send, X, Megaphone, CheckCircle, Info, Sun, Cloud, CloudRain, CloudLightning, Droplets, Thermometer } from 'lucide-react'
import { cn } from '../lib/utils'
import NotificationItem from '../components/NotificationItem'
import { useSocket } from '../hooks/useSocket'
import { weatherApi } from '../api/weather'

export default function Dashboard() {
  const { user } = useAuth()
  const { socket } = useSocket()
  const navigate = useNavigate()
  const isAdmin = user && ['admin', 'manager', 'accountant', 'landlord'].includes(user.role)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [revenue, setRevenue] = useState<RevenueReport | null>(null)
  const [recentBills, setRecentBills] = useState<Bill[]>([])
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([])
  
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [weatherData, setWeatherData] = useState<{
    temp: number,
    code: number,
    humidity: number,
    apparentTemp: number
  } | null>(null)

  // Broadcast Modal State
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false)
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    content: '',
    type: 'broadcast' as any,
    targetRole: 'tenant'
  })
  const [broadcasting, setBroadcasting] = useState(false)
  const [broadcastSuccess, setBroadcastSuccess] = useState(false)

  // Fetch initial data
  const fetchDashboardData = async () => {
    try {
      // Chỉ lấy 3 thông báo gần nhất theo yêu cầu
      const notifsRes = await notificationsApi.getAll({ limit: 3 })
      if (notifsRes && notifsRes.data) {
        setRecentNotifications(notifsRes.data.data || [])
      }

      const billsRes = await billsApi.getAll({ status: '' })
      if (billsRes && billsRes.data) {
        const sortedBills = (Array.isArray(billsRes.data) ? billsRes.data : [])
          .sort((a: any, b: any) => new Date(b.dueDate || 0).getTime() - new Date(a.dueDate || 0).getTime())
          .slice(0, 4)
        setRecentBills(sortedBills)
      }

      if (isAdmin) {
        const statsRes = await dashboardApi.getStats()
        if (statsRes && statsRes.data) {
          setStats(statsRes.data)
        }
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
    // Lấy thời tiết TP.HCM khi vào Dashboard & cập nhật mỗi 30s để đảm bảo "Real-time"
    const fetchWeather = () => {
      weatherApi.getCurrentWeather()
        .then(res => {
          if (res.data?.current) {
            const c = res.data.current
            setWeatherData({
              temp: c.temperature_2m,
              code: c.weather_code,
              humidity: c.relative_humidity_2m,
              apparentTemp: c.apparent_temperature
            })
          }
        })
        .catch(err => console.error("Weather fetch error:", err))
    }

    fetchWeather()
    const weatherInterval = setInterval(fetchWeather, 30000) // 30 giây cập nhật 1 lần

    return () => clearInterval(weatherInterval)
  }, [isAdmin])

  // Real-time listener for Dashboard list
  useEffect(() => {
    if (!socket) return
    const handler = (newNote: any) => {
      // Luôn giữ tối đa 3 thông báo mới nhất
      setRecentNotifications(prev => [newNote, ...prev].slice(0, 3))
    }
    socket.on('new_notification', handler)
    return () => { socket.off('new_notification', handler) }
  }, [socket])

  useEffect(() => {
    if (isAdmin) {
      dashboardApi.getRevenue(selectedYear)
        .then(res => setRevenue(res.data))
        .catch(console.error)
    }
  }, [selectedYear, isAdmin])

  const chartData = useMemo(() => {
    if (!revenue || !revenue.byMonth) return []
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months.map((m, i) => {
      const monthData = revenue.byMonth.find(d => d.month === i + 1)
      return { name: m, value: monthData ? monthData.total : 0 }
    })
  }, [revenue])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN').format(value)
  }

  const handleMarkRead = async (id: string) => {
    try {
      await notificationsApi.markRead(id)
      setRecentNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
    } catch (err) {
      console.error('Error marking as read from Dashboard:', err)
    }
  }

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!broadcastForm.title || !broadcastForm.content) return
    
    setBroadcasting(true)
    try {
      await notificationsApi.broadcast(broadcastForm)
      setBroadcastSuccess(true)
      setTimeout(() => {
        setIsBroadcastModalOpen(false)
        setBroadcastSuccess(false)
        setBroadcastForm({ title: '', content: '', type: 'broadcast', targetRole: 'tenant' })
      }, 2000)
    } catch (err) {
      console.error('Broadcast failed:', err)
      alert('Gửi thông báo thất bại. Vui lòng thử lại.')
    } finally {
      setBroadcasting(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px] w-full">
      <div className="w-8 h-8 border-4 border-[#4b49cb] border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  const metrics = isAdmin ? [
    { 
      label: 'Phòng', 
      value: `${stats?.rooms?.occupied || 0}/${stats?.rooms?.total || 0}`, 
      icon: Bed, 
      badge: stats?.rooms?.total ? `${Math.round((stats.rooms.occupied / stats.rooms.total) * 100)}% Capacity` : '0% Capacity', 
      badgeBg: 'bg-green-100', 
      badgeText: 'text-green-700', 
      iconBg: 'bg-[#eef2ff] text-[#4b49cb]' 
    },
    { 
      label: 'Hóa đơn', 
      value: `${stats?.bills?.pending || 0}`, 
      icon: Receipt, 
      badge: `${stats?.bills?.pending || 0} Pending`, 
      badgeBg: 'bg-amber-100', 
      badgeText: 'text-amber-700', 
      iconBg: 'bg-[#fce7f3] text-[#973774]' 
    },
    { 
      label: 'Yêu cầu thuê', 
      value: `${(stats as any)?.rentals?.pending || 0}`, 
      icon: Receipt, 
      badge: 'New Request', 
      badgeBg: 'bg-indigo-100', 
      badgeText: 'text-indigo-700', 
      iconBg: 'bg-indigo-50 text-indigo-600' 
    },
    { 
      label: 'Bảo trì', 
      value: `${stats?.maintenance?.pending || 0}`, 
      icon: Wrench, 
      badge: (stats?.maintenance?.pending || 0) > 0 ? 'High Priority' : 'All clear', 
      badgeBg: (stats?.maintenance?.pending || 0) > 0 ? 'bg-red-100' : 'bg-emerald-100', 
      badgeText: (stats?.maintenance?.pending || 0) > 0 ? 'text-red-700' : 'text-emerald-700', 
      iconBg: 'bg-[#ffe4e6] text-[#b41340]' 
    }
  ] : []

  // UI CHO NGƯỜI THUÊ (TENANT)
  if (!isAdmin) {
    const userRoom = (user as any)?.roomId
    const pendingBillsCount = recentBills.filter(b => b.status === 'unpaid' || b.status === 'pending').length

    const getWeatherInfo = (code: number) => {
        if (code === 0) return { label: 'Trời nắng rạng rỡ', icon: Sun, color: 'bg-amber-400' }
        if (code <= 3) return { label: 'Trời nhiều mây', icon: Cloud, color: 'bg-blue-300' }
        if (code >= 51 && code <= 67) return { label: 'Mưa vừa/nhẹ', icon: CloudRain, color: 'bg-indigo-400' }
        if (code >= 80) return { label: 'Mưa rào nặng hạt', icon: CloudRain, color: 'bg-blue-600' }
        if (code >= 95) return { label: 'Dông & Sấm sét', icon: CloudLightning, color: 'bg-purple-600' }
        return { label: 'Thời tiết ổn định', icon: Sun, color: 'bg-amber-400' }
    }
    
    const weather = weatherData ? getWeatherInfo(weatherData.code) : { label: 'Đang cập nhật...', icon: Zap, color: 'bg-slate-200' }
    const WeatherIcon = weather.icon

    return (
      <main className="w-full max-w-7xl mx-auto pb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <section className="mb-12">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-3 text-[#2c2f31] dark:text-white font-display">
            Chào mừng trở lại, {user?.fullName || 'Tân'}.
          </h2>
          <p className="text-[#595c5e] dark:text-slate-400 text-lg font-medium">
            {userRoom ? `Mọi thứ tại Phòng ${userRoom.name} đều đang hoạt động tốt hôm nay.` : "Chào mừng bạn đến với môi trường sống hiện đại SmartDorm."}
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white dark:bg-slate-900 p-7 rounded-[2rem] shadow-[0px_20px_50px_rgba(74,63,226,0.06)] border border-white/50 dark:border-slate-800 transition-all hover:shadow-2xl hover:-translate-y-1 duration-500">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-indigo-50 text-primary rounded-2xl">
                <Banknote className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 bg-[#d8caff] text-[#4e339c] text-[10px] font-black uppercase tracking-widest rounded-full">
                {userRoom ? 'Đã thuê' : 'Trống'}
              </span>
            </div>
            <p className="text-[#595c5e] dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1 opacity-60">Giá phòng thuê</p>
            <h3 className="text-2xl font-black font-display text-[#2c2f31] dark:text-white">
              {formatCurrency(userRoom?.price || 0)} đ
            </h3>
          </div>

          <div className="bg-white p-7 rounded-[2rem] shadow-[0px_20px_50px_rgba(74,63,226,0.06)] border border-white/50 transition-all hover:shadow-2xl hover:-translate-y-1 duration-500">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-fuchsia-50 text-tertiary rounded-2xl">
                <Receipt className="w-6 h-6" />
              </div>
              {pendingBillsCount > 0 && (
                <span className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-widest rounded-full animate-pulse">
                  Cần xử lý
                </span>
              )}
            </div>
            <p className="text-[#595c5e] dark:text-slate-400 text-xs font-bold uppercase tracking-widest mb-1 opacity-60">Hóa đơn chờ trả</p>
            <h3 className="text-4xl font-black font-display text-[#2c2f31] dark:text-white">{pendingBillsCount}</h3>
          </div>

          <div className="bg-white p-7 rounded-[2rem] shadow-[0px_20px_50px_rgba(74,63,226,0.06)] border border-white/50 transition-all hover:shadow-2xl hover:-translate-y-1 duration-500">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                <Wrench className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                Ổn định
              </span>
            </div>
            <p className="text-[#595c5e] text-xs font-bold uppercase tracking-widest mb-1 opacity-60">Tình trạng phòng</p>
            <h3 className="text-2xl font-black font-display text-[#2c2f31]">System Clear</h3>
          </div>

          <div className="bg-white p-7 rounded-[2rem] shadow-[0px_20px_50px_rgba(74,63,226,0.06)] border border-white/50 transition-all hover:shadow-2xl hover:-translate-y-1 duration-500">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                <Zap className="w-6 h-6" />
              </div>
            </div>
            <p className="text-[#595c5e] text-xs font-bold uppercase tracking-widest mb-1 opacity-60">Dịch vụ tòa nhà</p>
            <h3 className="text-2xl font-black font-display text-[#2c2f31]">Tất cả Sẵn sàng</h3>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2rem] overflow-hidden shadow-[0px_20px_50px_rgba(74,63,226,0.03)] border border-slate-50">
              <div className="px-8 py-6 flex justify-between items-center border-b border-slate-50/50">
                <h3 className="text-lg font-black font-display text-[#2c2f31]">Thông báo mới nhất</h3>
                <button className="text-primary text-xs font-black uppercase tracking-tighter hover:underline">Xem tất cả</button>
              </div>
              <div className="divide-y divide-slate-50">
                {recentNotifications.length > 0 ? recentNotifications.map((notif, idx) => (
                  <NotificationItem 
                    key={notif._id} 
                    note={notif} 
                    onMarkRead={handleMarkRead}
                    compact={false}
                    index={idx}
                  />
                )) : (
                  <div className="py-16 flex flex-col items-center justify-center text-slate-400 font-bold">
                    <Megaphone className="w-12 h-12 mb-4 opacity-10" />
                    <p className="text-xs uppercase tracking-[0.2em] opacity-40">Chưa có thông báo nào.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-[0px_20px_50px_rgba(74,63,226,0.03)] border border-slate-50">
              <div className="px-8 py-6 flex justify-between items-center border-b border-slate-50/50">
                <h3 className="text-lg font-black font-display text-[#2c2f31]">Lịch sử giao dịch</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-[10px] text-[#595c5e] font-black uppercase tracking-[0.2em] border-b border-slate-50/50">
                      <th className="px-8 py-5">Giao dịch</th>
                      <th className="px-8 py-5">Ngày hạn</th>
                      <th className="px-8 py-5">Trạng thái</th>
                      <th className="px-8 py-5 text-right">Số tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50/50">
                    {recentBills.length > 0 ? (
                      recentBills.map((bill) => (
                        <tr key={bill._id} className="hover:bg-slate-50/50 transition-all group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#2c2f31] group-hover:bg-primary group-hover:text-white transition-all">
                                <Receipt className="w-5 h-5" />
                              </div>
                              <span className="text-sm font-bold text-[#2c2f31]">Hóa đơn tháng {bill.month}/{bill.year}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-xs font-bold text-[#595c5e]">
                            {bill.dueDate ? new Date(bill.dueDate).toLocaleDateString('vi-VN') : '---'}
                          </td>
                          <td className="px-8 py-6">
                            <span className={cn(
                              "px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full",
                              bill.status === 'paid' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                            )}>
                              {bill.status === 'paid' ? 'THANH TOÁN XONG' : 'ĐANG CHỜ'}
                            </span>
                          </td>
                          <td className="px-8 py-6 text-sm font-black text-right text-[#2c2f31]">
                            {formatCurrency(bill.totalAmount)} đ
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-8 py-12 text-center text-[#595c5e] italic text-sm">Chưa có giao dịch nào được ghi nhận.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-glass border border-white/40 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-3xl rounded-full"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xl font-black font-display text-[#2c2f31]">Live Status</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#595c5e]">Real-time</span>
                  </div>
                </div>

                <div className="space-y-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="p-4 bg-primary text-white rounded-2xl shadow-lg shadow-indigo-100">
                        <Bed className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] text-[#595c5e] font-black uppercase tracking-widest opacity-60">Số phòng</p>
                        <p className="text-2xl font-black font-display text-[#2c2f31]">{userRoom?.name || '---'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className={cn("p-4 text-white rounded-2xl shadow-lg transition-all duration-1000", weather.color)}>
                        <WeatherIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-[10px] text-[#595c5e] font-black uppercase tracking-widest opacity-60">{weather.label}</p>
                        <p className="text-2xl font-black font-display text-[#2c2f31]">
                          {weatherData ? `${Math.round(weatherData.temp)}°C` : '--°C'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {weatherData && (
                    <div className="grid grid-cols-2 gap-4 mt-6 animate-in fade-in slide-in-from-top-2 duration-700">
                        <div className="bg-white/40 p-4 rounded-2xl border border-white/20">
                            <div className="flex items-center gap-2 mb-1">
                                <Droplets className="w-3 h-3 text-blue-500" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Độ ẩm</span>
                            </div>
                            <p className="font-black text-slate-700 tabular-nums">{weatherData.humidity}%</p>
                        </div>
                        <div className="bg-white/40 p-4 rounded-2xl border border-white/20">
                            <div className="flex items-center gap-2 mb-1">
                                <Thermometer className="w-3 h-3 text-rose-500" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cảm giác</span>
                            </div>
                            <p className="font-black text-slate-700 tabular-nums">{Math.round(weatherData.apparentTemp)}°C</p>
                        </div>
                    </div>
                  )}
                </div>
                
                <button className="w-full mt-12 py-5 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-indigo-100 hover:brightness-110 active:scale-95 transition-all">
                  Quản lý thiết bị
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary to-secondary p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap className="w-24 h-24 rotate-12" />
               </div>
               <div className="relative z-10">
                <h4 className="text-xl font-black mb-3 font-display">Cần hỗ trợ?</h4>
                <p className="text-white/80 text-sm mb-8 leading-relaxed font-medium">Đội ngũ kỹ thuật của SmartDorm luôn sẵn sàng hỗ trợ bạn 24/7 cho mọi vấn đề kỹ thuật.</p>
                <button className="w-full py-4 bg-white text-primary font-black uppercase tracking-widest text-xs rounded-xl shadow-lg hover:bg-slate-50 transition-all">
                  Nhắn tin ngay
                </button>
               </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  // UI CHO ADMIN/MANAGER
  return (
    <div className="w-full max-w-7xl mx-auto animate-in fade-in duration-1000">
      <div className="mb-10">
        <h2 className="text-4xl font-black tracking-tight text-[#2c2f31] mb-2 font-display">Quản Trị Hệ Thống</h2>
        <p className="text-[#595c5e] text-lg font-medium">Chào buổi sáng, <span className="font-bold text-primary">{user?.fullName || 'Tân'}</span>. Dưới đây là hiệu suất vận hành hôm nay.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {metrics.map((item, idx) => (
          <div key={idx} className="bg-white p-7 rounded-[2rem] shadow-[0px_20px_50px_rgba(74,63,226,0.04)] border border-slate-50 transition-all hover:shadow-xl hover:-translate-y-0.5 duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className={cn("p-4 rounded-2xl", item.iconBg)}>
                <item.icon className="w-6 h-6" />
              </div>
              <span className={cn("px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] rounded-full", item.badgeBg, item.badgeText)}>
                {item.badge}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-black text-[#595c5e] uppercase tracking-[0.15em] opacity-60">{item.label}</p>
              <h3 className="text-3xl font-black text-[#2c2f31] mt-1 font-display tracking-tighter">
                {item.value} 
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {/* Thống kê doanh thu */}
           <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-[0px_20px_50px_rgba(74,63,226,0.03)] border border-slate-50 relative overflow-hidden">
              <div className="flex justify-between items-center mb-10 relative z-10">
                <div>
                  <h3 className="text-xl font-black text-[#2c2f31] font-display uppercase tracking-tight">Thống kê doanh thu</h3>
                  <p className="text-sm text-[#595c5e] font-medium mt-1">Năm tài chính {selectedYear}</p>
                </div>
                <select 
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-slate-50 border-none rounded-2xl text-xs font-black py-3 px-6 outline-none focus:ring-2 focus:ring-primary/20 appearance-none shadow-sm cursor-pointer"
                >
                  <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
                  <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
                </select>
              </div>
              
              <div className="h-[320px] w-full flex items-end justify-between gap-4 pt-12 relative z-10">
                {chartData.map((m: any, idx: number) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-4 group relative h-full justify-end">
                      <div className="absolute -top-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100 bg-[#2c2f31] text-white px-3 py-1.5 rounded-xl text-[10px] font-black whitespace-nowrap z-20 shadow-xl">
                        {formatCurrency(m.value)}đ
                      </div>
                      <div 
                        className="w-full bg-indigo-50/50 rounded-2xl group-hover:bg-primary transition-all duration-500 relative overflow-hidden cursor-pointer" 
                        style={{ height: `${revenue && revenue.total > 0 ? (m.value / Math.max(...chartData.map((x: any) => x.value), 1)) * 100 : 0}%`, minHeight: '8px' }}
                      >
                        <div className="absolute inset-0 bg-gradient-t from-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </div>
                      <span className="text-[10px] font-black text-[#595c5e] uppercase tracking-widest">{m.name}</span>
                  </div>
                ))}
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/30 rounded-full blur-[100px] pointer-events-none"></div>
           </div>

           {/* Recent Bills Table */}
           <div className="bg-white rounded-[2.5rem] shadow-[0px_20px_50px_rgba(74,63,226,0.03)] border border-slate-50 overflow-hidden">
             <div className="px-10 py-8 flex justify-between items-center border-b border-slate-50 text-slate-800">
               <h3 className="text-xl font-black font-display tracking-tight leading-none">Hóa đơn cần xác nhận</h3>
               <button onClick={() => navigate('/app/bills')} className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline px-4 py-2 bg-indigo-50 rounded-xl transition-all">Toàn bộ hồ sơ →</button>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead>
                   <tr className="text-[9px] text-[#595c5e] uppercase tracking-[0.2em] font-black border-b border-slate-50 bg-slate-50/30">
                     <th className="px-10 py-6">Vị trí phòng</th>
                     <th className="px-10 py-6 text-right">Tổng giá trị</th>
                     <th className="px-10 py-6 text-center">Tình trạng</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                   {recentBills.length > 0 ? (
                     recentBills.map((bill) => (
                       <tr key={bill._id} className="hover:bg-slate-50/50 transition-all group">
                         <td className="px-10 py-6">
                           <span className="text-[15px] font-black text-[#2c2f31] font-display group-hover:text-primary transition-colors">{(bill.roomId as any)?.name}</span>
                         </td>
                         <td className="px-10 py-6 text-right font-black text-primary font-display text-[15px] tracking-tighter">{formatCurrency(bill.totalAmount)} đ</td>
                         <td className="px-10 py-6 text-center">
                           <span className={cn(
                             "px-3 py-1 text-[8px] font-black rounded-full uppercase tracking-widest inline-block border",
                             bill.status === 'paid' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                           )}>
                             {bill.status === 'paid' ? 'PAID' : 'PENDING'}
                           </span>
                         </td>
                       </tr>
                     ))
                   ) : (
                     <tr>
                       <td colSpan={3} className="px-10 py-16 text-center text-[#595c5e] font-display italic text-sm">Chưa ghi nhận dữ liệu trong kỳ.</td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
           </div>
        </div>

        <div className="space-y-8">
           {/* Latest Notifications Panel (Admin) */}
           <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-[0px_20px_50px_rgba(74,63,226,0.03)] border border-slate-50">
             <div className="px-8 py-6 flex justify-between items-center border-b border-slate-50/50 bg-slate-50/20">
               <h3 className="text-lg font-black text-[#2c2f31] font-display leading-none">Thông báo mới nhất</h3>
               <button onClick={() => navigate('/app/notifications')} className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline px-3 py-1.5 bg-white rounded-xl shadow-sm border border-slate-50 whitespace-nowrap">Tất cả</button>
             </div>
             <div className="divide-y divide-slate-50">
               {recentNotifications.length > 0 ? recentNotifications.map((notif, idx) => (
                 <NotificationItem 
                   key={notif._id} 
                   note={notif} 
                   onMarkRead={handleMarkRead}
                   compact={true}
                   index={idx}
                 />
               )) : (
                 <div className="py-16 flex flex-col items-center justify-center text-slate-400 font-bold">
                   <Megaphone className="w-12 h-12 mb-4 opacity-10" />
                   <p className="text-xs uppercase tracking-[0.2em] opacity-40">Hộp thư rỗng.</p>
                 </div>
               )}
             </div>
           </div>

           {/* Phát sóng thông báo */}
           <div className="bg-primary p-8 md:p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group h-fit">
             <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-700">
               <Megaphone className="w-48 h-48 rotate-[15deg]" />
             </div>
             <div className="relative z-10 flex flex-col gap-6">
               <div>
                 <h3 className="text-2xl font-black mb-1.5 font-display leading-tight tracking-tighter">Phát sóng thông báo</h3>
                 <p className="text-white/70 text-sm font-medium">Gửi thông báo nhanh đến cư dân.</p>
               </div>
               <button 
                 onClick={() => setIsBroadcastModalOpen(true)}
                 className="w-full py-4 bg-white text-primary font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-900 hover:text-white transition-all shadow-xl shadow-indigo-900/20 active:scale-[0.98]"
               >
                 Soạn thông báo ngay
               </button>
             </div>
           </div>
        </div>
      </div>

      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !broadcasting && setIsBroadcastModalOpen(false)}></div>
          
          <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="px-8 py-6 bg-slate-50 flex justify-between items-center border-b border-slate-100">
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-primary/10 text-primary rounded-lg">
                   <Megaphone className="w-5 h-5" />
                 </div>
                 <h3 className="text-lg font-black font-display text-[#2c2f31] uppercase">Gửi thông báo tổng</h3>
               </div>
               <button 
                onClick={() => setIsBroadcastModalOpen(false)}
                className="p-2 hover:bg-slate-200 rounded-full transition-all"
               >
                 <X className="w-5 h-5" />
               </button>
             </div>

             <div className="p-8">
               {broadcastSuccess ? (
                 <div className="py-12 text-center animate-in fade-in zoom-in-95">
                   <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                     <CheckCircle className="w-10 h-10" />
                   </div>
                   <h4 className="text-2xl font-black text-[#2c2f31] mb-2 font-display">Đã phát sóng!</h4>
                   <p className="text-slate-500 font-medium">Toàn bộ cư dân đã nhận được thông báo của bạn.</p>
                 </div>
               ) : (
                 <form onSubmit={handleBroadcastSubmit} className="space-y-6">
                   <div>
                     <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Tiêu đề thông báo</label>
                     <input 
                        type="text"
                        required
                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-700 placeholder:text-slate-300 transition-all"
                        placeholder="VD: Thông báo bảo trì điện nước..."
                        value={broadcastForm.title}
                        onChange={e => setBroadcastForm({...broadcastForm, title: e.target.value})}
                     />
                   </div>
                   
                   <div>
                     <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Nội dung chi tiết</label>
                     <textarea 
                        required
                        rows={5}
                        className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-bold text-slate-700 placeholder:text-slate-300 transition-all resize-none"
                        placeholder="Nhập nội dung bạn muốn gửi đến mọi người..."
                        value={broadcastForm.content}
                        onChange={e => setBroadcastForm({...broadcastForm, content: e.target.value})}
                     />
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Loại thông báo</label>
                        <select 
                          className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-black text-xs uppercase tracking-tight"
                          value={broadcastForm.type}
                          onChange={e => setBroadcastForm({...broadcastForm, type: e.target.value as any})}
                        >
                          <option value="broadcast">📢 Phát sóng chung</option>
                          <option value="system">⚙️ Hệ thống</option>
                          <option value="rental">📋 Yêu cầu thuê</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">Đối tượng nhận</label>
                        <select 
                          className="w-full px-5 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 font-black text-xs uppercase tracking-tight"
                          value={broadcastForm.targetRole}
                          onChange={e => setBroadcastForm({...broadcastForm, targetRole: e.target.value})}
                        >
                          <option value="tenant">Cư dân (Tenants)</option>
                          <option value="guest">Khách (Guests)</option>
                          <option value="manager">Quản lý (Managers)</option>
                        </select>
                     </div>
                   </div>

                   <div className="pt-4 flex items-center gap-3 bg-amber-50 p-4 rounded-2xl border border-amber-100">
                     <Info className="w-5 h-5 text-amber-600 shrink-0" />
                     <p className="text-[10px] text-amber-700 font-bold leading-relaxed px-1">Lưu ý: Thông báo sẽ được gửi Real-time và qua Push Notification tới thiết bị của cư dân ngay lập tức.</p>
                   </div>

                   <button 
                    disabled={broadcasting}
                    className={cn(
                      "w-full py-5 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3",
                      broadcasting ? "opacity-70 cursor-not-allowed" : "hover:bg-black"
                    )}
                   >
                     {broadcasting ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                     ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Gửi thông báo ngay</span>
                        </>
                     )}
                   </button>
                 </form>
               )}
             </div>
          </div>
        </div>
      )}
    </div>
  )
}
