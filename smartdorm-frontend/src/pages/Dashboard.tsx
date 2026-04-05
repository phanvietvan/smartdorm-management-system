import { useEffect, useState, useMemo } from 'react'
import { dashboardApi, type DashboardStats, type RevenueReport } from '../api/dashboard'
import { billsApi, type Bill } from '../api/bills'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../context/AuthContext'
import { Bed, Receipt, Banknote, Wrench, ArrowRight, MoreVertical, Zap, Droplet } from 'lucide-react'
import { cn } from '../lib/utils'

export default function Dashboard() {
  const { user } = useAuth()
  const isAdmin = user && ['admin', 'manager', 'accountant', 'landlord'].includes(user.role)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [revenue, setRevenue] = useState<RevenueReport | null>(null)
  const [recentBills, setRecentBills] = useState<Bill[]>([])
  
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

  useEffect(() => {
    setLoading(true)
    const promises: Promise<any>[] = [billsApi.getAll({ status: '' })]
    if (isAdmin) promises.push(dashboardApi.getStats())

    Promise.all(promises)
      .then((results) => {
        const billsRes = results[0]
        const statsRes = isAdmin ? results[1] : null
        if (statsRes && statsRes.data) setStats(statsRes.data)
        if (billsRes && billsRes.data) {
           setRecentBills((Array.isArray(billsRes.data) ? billsRes.data : [])
            .sort((a: any, b: any) => new Date(b.dueDate || 0).getTime() - new Date(a.dueDate || 0).getTime())
            .slice(0, 4))
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [isAdmin])

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

  if (loading) return (
    <div className="flex items-center justify-center min-h-[300px] w-full">
      <div className="w-8 h-8 border-4 border-[#4b49cb] border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  const metrics = [
    { label: 'Phòng', value: `${stats?.rooms?.occupied || 25}/${stats?.rooms?.total || 30}`, icon: Bed, badge: '83% Capacity', badgeBg: 'bg-green-100', badgeText: 'text-green-700', iconBg: 'bg-[#eef2ff] text-[#4b49cb]' },
    { label: 'Hóa đơn', value: '12', sub: 'chưa trả', icon: Receipt, badge: '12 Pending', badgeBg: 'bg-amber-100', badgeText: 'text-amber-700', iconBg: 'bg-[#fce7f3] text-[#973774]' },
    { label: 'Doanh thu tháng này', value: '45.000.000 đ', icon: Banknote, badge: '+12.5%', badgeBg: 'bg-[#eef2ff]', badgeText: 'text-[#4b49cb]', iconBg: 'bg-[#e0e7ff] text-[#3e3bbf]' },
    { label: 'Yêu cầu bảo trì', value: '3', sub: 'yêu cầu', icon: Wrench, badge: 'High Priority', badgeBg: 'bg-red-100', badgeText: 'text-red-700', iconBg: 'bg-[#ffe4e6] text-[#b41340]' }
  ]

  return (
    <div className="w-full max-w-7xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold tracking-tight text-[#2c2f31] mb-2">Bảng Điều Khiển</h2>
        <p className="text-[#595c5e]">Chào buổi sáng, {user?.fullName?.split(' ').pop() || 'Tân'}. Dưới đây là tổng quan hệ thống SmartDorm hôm nay.</p>
      </div>

      {/* Bento Grid Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl flex flex-col justify-between hover:shadow-md transition-shadow border border-[#e5e9eb]">
            <div className="flex justify-between items-start mb-4">
              <div className={cn("p-3 rounded-xl", item.iconBg)}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className={cn("text-xs font-bold px-2.5 py-1 rounded-lg", item.badgeBg, item.badgeText)}>
                {item.badge}
              </span>
            </div>
            <div>
              <p className="text-[#595c5e] text-sm font-medium">{item.label}</p>
              <h3 className="text-2xl font-extrabold text-[#2c2f31] mt-1">
                {item.value} 
                {item.sub && <span className="text-sm font-normal text-[#595c5e] ml-1.5">{item.sub}</span>}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Chart */}
        <div className="xl:col-span-2 bg-white p-6 md:p-8 rounded-2xl border border-[#e5e9eb]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h4 className="text-lg font-bold text-[#2c2f31]">Biểu đồ doanh thu</h4>
              <p className="text-sm text-[#595c5e] mt-1">Hiệu suất tài chính năm 2023</p>
            </div>
            <select className="bg-[#f5f7f9] border border-[#e5e9eb] rounded-xl text-xs font-bold py-2 px-4 outline-none focus:border-[#4b49cb]">
              <option>Năm nay</option>
              <option>Năm ngoái</option>
            </select>
          </div>
          
          <div className="w-full h-[280px]">
             <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4b49cb" stopOpacity={0.2}/>
                    <stop offset="100%" stopColor="#4b49cb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#eef1f3" strokeDasharray="4 4" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 600, fill: '#595c5e' }} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e9eb', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ color: '#2c2f31', fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#4b49cb" 
                  strokeWidth={3} 
                  fill="url(#chartGradient)" 
                  activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: '#4b49cb' }} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Maintenance Panel */}
        <div className="bg-[#4b49cb] p-6 md:p-8 rounded-2xl text-white flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h4 className="text-xl font-bold mb-2">Thông báo bảo trì</h4>
            <p className="text-sm opacity-90 mb-6">Sửa chữa hệ thống điện khu A vào Chủ nhật tuần này.</p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl">
                <Zap className="w-5 h-5 text-indigo-200" />
                <div>
                  <p className="text-sm font-bold">Điện lực</p>
                  <p className="text-[11px] opacity-80 mt-0.5">10:00 - 14:00</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/10 p-4 rounded-xl">
                <Droplet className="w-5 h-5 text-indigo-200" />
                <div>
                  <p className="text-sm font-bold">Nước sinh hoạt</p>
                  <p className="text-[11px] opacity-80 mt-0.5">Ổn định</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative z-10 pt-8">
            <button className="w-full bg-white text-[#4b49cb] py-3 rounded-xl font-bold text-sm hover:bg-[#f5f7f9] transition-colors">
              Gửi thông báo cư dân
            </button>
          </div>
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-[40px] transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/20 rounded-full blur-[30px] transform -translate-x-1/2 translate-y-1/2"></div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden border border-[#e5e9eb]">
        <div className="p-6 border-b border-[#e5e9eb] flex justify-between items-center">
          <h4 className="text-lg font-bold text-[#2c2f31]">Hóa đơn gần đây</h4>
          <button className="text-[#4b49cb] text-sm font-semibold flex items-center gap-1 hover:underline">
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[#595c5e] uppercase text-xs font-bold tracking-wider border-b border-[#e5e9eb] bg-[#f8fafc]">
                <th className="px-6 py-4 font-semibold">Phòng</th>
                <th className="px-6 py-4 font-semibold">Khách hàng</th>
                <th className="px-6 py-4 font-semibold">Ngày lập</th>
                <th className="px-6 py-4 font-semibold text-right">Số tiền</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e9eb]">
              {recentBills.length > 0 ? recentBills.map((b, i) => (
                <tr key={i} className="hover:bg-[#f8fafc] transition-colors">
                  <td className="px-6 py-4 font-bold text-[#2c2f31]">{b.roomId?.name || '---'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-full bg-[#eef2ff] flex items-center justify-center text-[#4b49cb] text-xs font-bold">
                        {b.tenantId?.fullName?.charAt(0) || 'U'}
                      </div>
                      <span className="text-sm font-medium text-[#2c2f31]">{b.tenantId?.fullName || "Chưa có"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#595c5e]">{b.dueDate ? new Date(b.dueDate).toLocaleDateString('vi-VN') : '--/--/----'}</td>
                  <td className="px-6 py-4 text-sm font-bold text-[#2c2f31] text-right">{formatCurrency(b.totalAmount)} đ</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 text-xs font-semibold rounded-md",
                      b.status === 'paid' ? "bg-green-100 text-green-700" : 
                      b.status === 'unpaid' ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                    )}>
                      {b.status === 'paid' ? 'Đã trả' : 'Chờ trả'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-[#9a9d9f] hover:text-[#4b49cb] hover:bg-[#eef2ff] rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="py-12 text-center text-[#595c5e] text-sm">Chưa có hóa đơn nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
