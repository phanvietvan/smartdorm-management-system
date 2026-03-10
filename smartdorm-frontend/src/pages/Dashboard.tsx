import { useEffect, useState, useMemo } from 'react'
import { dashboardApi, type DashboardStats, type RevenueReport } from '../api/dashboard'
import { billsApi, type Bill } from '../api/bills'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  const isAdmin = user && ['admin', 'manager', 'accountant', 'landlord'].includes(user.role)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [revenue, setRevenue] = useState<RevenueReport | null>(null)
  const [recentBills, setRecentBills] = useState<Bill[]>([])
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

  useEffect(() => {
    const promises: Promise<any>[] = [billsApi.getAll({ status: '' })]
    if (isAdmin) promises.push(dashboardApi.getStats())

    Promise.all(promises)
      .then((results) => {
        const billsRes = results[0]
        const statsRes = isAdmin ? results[1] : null

        if (statsRes) setStats(statsRes.data)
        
        // Sort and take latest 5 bills
        const sortedBills = billsRes.data
          .sort((a: any, b: any) => new Date(b.dueDate || 0).getTime() - new Date(a.dueDate || 0).getTime())
          .slice(0, 5)
        setRecentBills(sortedBills)
      })
      .catch(() => setError('Không thể tải thống kê'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (isAdmin) {
      dashboardApi.getRevenue(selectedYear)
        .then(res => setRevenue(res.data))
        .catch(console.error)
    }
  }, [selectedYear, isAdmin])

  const chartData = useMemo(() => {
    if (!revenue) return []
    return revenue.byMonth.map(m => ({
      name: `Tháng ${m.month}`,
      uv: m.total
    }))
  }, [revenue])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <span className="px-3 py-1 bg-emerald-100/50 text-emerald-600 rounded-full text-xs font-bold">Đã thanh toán</span>
      case 'pending': return <span className="px-3 py-1 bg-amber-100/50 text-amber-600 rounded-full text-xs font-bold">Chưa thanh toán</span>
      case 'overdue': return <span className="px-3 py-1 bg-rose-100/50 text-rose-600 rounded-full text-xs font-bold">Quá hạn</span>
      default: return <span className="px-3 py-1 bg-slate-100/50 text-slate-600 rounded-full text-xs font-bold">{status}</span>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (error) return <div className="alert alert-error">{error}</div>

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
      </div>

      {/* Stats Cards Grid (Admin Only) */}
      {isAdmin && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1 - Phòng */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-500 mb-2">Phòng</p>
              <h2 className="text-[28px] font-bold text-slate-800 leading-none mb-1">
                {stats.rooms.total.toLocaleString()}
              </h2>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-xs font-medium text-emerald-500">{(stats.rooms.available / Math.max(stats.rooms.total, 1) * 100).toFixed(1)}%</span>
            <span className="text-xs text-slate-500 font-medium">Trống ({stats.rooms.available})</span>
          </div>
        </div>

        {/* Card 2 - Total Order (Hóa đơn) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-500 mb-2">Hóa đơn</p>
              <h2 className="text-[28px] font-bold text-slate-800 leading-none mb-1">
                {stats.bills.total.toLocaleString()}
              </h2>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 9h-2V7h-2v5H6v2h2v5h2v-5h2v-2z"/>
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-xs font-medium text-emerald-500">{(stats.bills.paid / Math.max(stats.bills.total, 1) * 100).toFixed(1)}%</span>
            <span className="text-xs text-slate-500 font-medium">Đã thanh toán ({stats.bills.paid})</span>
          </div>
        </div>

        {/* Card 3 - Total Sales (Doanh thu) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-500 mb-2">Doanh thu</p>
              <h2 className="text-2xl font-bold text-slate-800 leading-tight mb-1 truncate" title={formatCurrency(stats.revenue)}>
                {new Intl.NumberFormat('vi-VN', { notation: "compact", compactDisplay: "short" }).format(stats.revenue)}
              </h2>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span className="text-xs font-medium text-emerald-500">Doanh thu năm nay</span>
          </div>
        </div>

        {/* Card 4 - Total Pending */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-500 mb-2">Bảo trì đang chờ</p>
              <h2 className="text-[28px] font-bold text-slate-800 leading-none mb-1">
                {(stats.maintenance.pending).toLocaleString()}
              </h2>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="text-xs text-slate-500 font-medium font-bold text-orange-600 italic">Yêu cầu sửa chữa cần xử lý gấp</span>
          </div>
        </div>
      </div>
      )}

      {/* Sales Details Chart (Admin Only) */}
      {isAdmin && (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 mb-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-bold text-slate-800">Doanh thu theo tháng</h2>
          <div className="relative">
            <select 
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="appearance-none bg-white border border-slate-200 text-slate-600 text-sm rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
            >
              {[new Date().getFullYear(), new Date().getFullYear() - 1].map(y => (
                <option key={y} value={y}>Năm {y}</option>
              ))}
            </select>
            <svg className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        <div className="h-[300px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="99%" height="100%" minHeight={300}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4379EE" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4379EE" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                  tickFormatter={(value) => new Intl.NumberFormat('vi-VN', { notation: "compact", compactDisplay: "short" }).format(value)}
                  width={60}
                />
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(Number(value)), 'Doanh thu']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="uv" 
                  stroke="#4379EE" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorUv)" 
                  activeDot={{ r: 6, fill: '#4379EE', stroke: '#fff', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">Không có dữ liệu</div>
          )}
        </div>
      </div>
      )}

      {/* Deals Details Table */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-800">Hóa đơn gần đây</h2>
        </div>

        <div className="overflow-x-auto">
          {recentBills.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 bg-slate-50/50">
                  <th className="py-4 px-4 font-semibold text-sm rounded-tl-lg">Phòng & Người thuê</th>
                  <th className="py-4 px-4 font-semibold text-sm">Tháng/Năm</th>
                  <th className="py-4 px-4 font-semibold text-sm">Ngày tới hạn</th>
                  <th className="py-4 px-4 font-semibold text-sm">Tổng tiền</th>
                  <th className="py-4 px-4 font-semibold text-sm rounded-tr-lg">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {recentBills.map((bill) => (
                  <tr key={bill._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                          {bill.roomId?.name?.charAt(0) || 'P'}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700">{bill.roomId?.name}</p>
                          <p className="text-xs text-slate-500">{bill.tenantId?.fullName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-medium">{bill.month}/{bill.year}</td>
                    <td className="py-4 px-4 text-slate-500">{bill.dueDate ? new Date(bill.dueDate).toLocaleDateString('vi-VN') : 'N/A'}</td>
                    <td className="py-4 px-4 font-bold text-slate-700">{formatCurrency(bill.totalAmount)}</td>
                    <td className="py-4 px-4">
                      {getStatusBadge(bill.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-slate-500">Chưa có hóa đơn nào</div>
          )}
        </div>
      </div>
    </div>
  )
}
