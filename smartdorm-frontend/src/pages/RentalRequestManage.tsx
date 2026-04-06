import { useEffect, useState } from 'react'
import { rentalApi, type RentalRequest } from '../api/rentalRequests'
import SuccessScreen from '../components/SuccessScreen'

export default function RentalRequestManage() {
  const [requests, setRequests] = useState<RentalRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processingId, setProcessingId] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const fetchRequests = async () => {
    try {
      const res = await rentalApi.getAll()
      setRequests(res.data)
    } catch (err) {
      setError('Không thể tải danh sách yêu cầu thuê')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleProcess = async (id: string, status: 'approved' | 'rejected') => {
    const note = window.prompt(status === 'approved' ? 'Ghi chú duyệt (Tùy chọn):' : 'Lý do từ chối:')
    if (status === 'rejected' && note === null) return

    setProcessingId(id)
    try {
      const res = await rentalApi.process(id, status, note || '')
      setSuccessMsg(res.data.message || 'Thao tác thành công')
      setShowSuccess(true)
      fetchRequests()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi xử lý yêu cầu')
    } finally {
      setProcessingId('')
    }
  }

  if (loading) return <div className="p-12 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">Đang tải dữ liệu...</div>
  if (error) return <div className="p-8 text-rose-500 font-bold text-center">{error}</div>

  if (showSuccess) {
    return <SuccessScreen message={successMsg} onDone={() => setShowSuccess(false)} />
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length

  return (
    <div className="min-h-screen bg-[var(--sd-surface)] py-12 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
                <span className="h-[3px] w-10 bg-indigo-600 rounded-full"></span>
                <span className="text-indigo-600 font-black text-[10px] uppercase tracking-[0.3em]">Hệ thống xét duyệt</span>
             </div>
             <h1 className="text-5xl font-black text-slate-900 tracking-tightest">Yêu Cầu Thuê Phòng</h1>
             <p className="text-slate-400 font-bold text-xs tracking-widest uppercase italic bg-white inline-block px-3 py-1 rounded-lg border border-slate-100 shadow-sm">
                Bạn có {pendingCount} yêu cầu đang chờ xử lý
             </p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/40 border border-slate-100 overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-50">
                       <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Khách hàng</th>
                       <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phòng yêu cầu</th>
                       <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ngày gửi</th>
                       <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Trạng thái</th>
                       <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Hành động</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50">
                    {requests.map(r => (
                       <tr key={r._id} className="hover:bg-slate-50/30 transition-colors group">
                          <td className="px-10 py-8">
                             <div className="space-y-1">
                                <p className="text-lg font-black text-slate-800 tracking-tight">{r.fullName}</p>
                                <p className="text-[11px] font-bold text-slate-400 flex items-center gap-3">
                                   <span className="text-indigo-600">{r.phone}</span>
                                   <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                   <span>{r.email}</span>
                                </p>
                             </div>
                          </td>
                          <td className="px-10 py-8">
                             <span className="px-5 py-2 bg-slate-100 text-slate-700 rounded-xl font-black text-[12px] tracking-tight border border-slate-200/50">
                                {typeof r.roomId === 'object' ? (r.roomId as any)?.name : 'N/A'}
                             </span>
                          </td>
                          <td className="px-10 py-8">
                             <p className="text-xs font-bold text-slate-500 tabular-nums">
                                {new Date((r as any).createdAt).toLocaleDateString('vi-VN')}
                             </p>
                          </td>
                          <td className="px-10 py-8">
                             <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${
                                r.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                r.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                'bg-rose-50 text-rose-600 border-rose-100'
                             }`}>
                                {r.status === 'pending' ? 'Đang chờ' : r.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                             </span>
                          </td>
                          <td className="px-10 py-8 text-right">
                             {r.status === 'pending' ? (
                                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                   <button 
                                      onClick={() => handleProcess(r._id!, 'rejected')}
                                      className="px-6 py-2.5 bg-white border border-rose-100 text-rose-500 hover:bg-rose-50 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                                   >
                                      Từ chối
                                   </button>
                                   <button 
                                      onClick={() => handleProcess(r._id!, 'approved')}
                                      className="px-6 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 transition-all"
                                   >
                                      Duyệt thuê
                                   </button>
                                </div>
                             ) : (
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Đã xong</p>
                             )}
                          </td>
                       </tr>
                    ))}
                    {requests.length === 0 && (
                       <tr>
                          <td colSpan={5} className="py-20 text-center">
                             <p className="text-slate-300 font-black text-[11px] uppercase tracking-[0.3em]">Hệ thống đang trống</p>
                          </td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  )
}
