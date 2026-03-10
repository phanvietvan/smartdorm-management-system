import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { billsApi, type Bill } from '../api/bills'
import { paymentsApi } from '../api/payments'

export default function BillDetail() {
  const { id } = useParams() as { id: string }
  const [bill, setBill] = useState<Bill | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingVnpay, setProcessingVnpay] = useState(false)

  useEffect(() => {
    billsApi.getById(id).then((r) => setBill(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  const handleVnpayPayment = async () => {
    if (!bill) return
    setProcessingVnpay(true)
    try {
      const res = await paymentsApi.createVnpUrl({
        billId: bill._id,
        amount: bill.totalAmount || 0,
        language: 'vn'
      })
      if (res.data?.vnpUrl) {
        window.location.href = res.data.vnpUrl
      }
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Không thể tạo link thanh toán VNPAY')
      setProcessingVnpay(false)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center p-12">
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

  if (!bill) return (
    <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 font-medium">
      Không tìm thấy hóa đơn
      <Link to="/app/bills" className="block text-sm mt-3 text-indigo-600 hover:text-indigo-800 underline">← Trở về danh sách hóa đơn</Link>
    </div>
  )

  const room = typeof bill.roomId === 'object' ? bill.roomId : null
  const tenant = typeof bill.tenantId === 'object' ? bill.tenantId : null

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Navigation */}
      <div>
        <Link to="/app/bills" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-2 group">
          <svg className="w-4 h-4 mr-1.5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Danh sách hóa đơn
        </Link>
      </div>

      {/* Invoice Card */}
      <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden relative">
        {/* Accent Banner */}
        <div className={`h-2 w-full ${bill.status === 'paid' ? 'bg-emerald-500' : bill.status === 'overdue' ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
        
        <div className="p-8 md:p-12">
          {/* Invoice Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-slate-100 pb-8">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight flex items-center gap-3">
                Hóa đơn tháng {String(bill.month).padStart(2, '0')} / {bill.year}
              </h1>
              <p className="text-slate-500 font-medium mt-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"></path></svg>
                Mã HĐ: <span className="font-mono text-slate-700">{bill._id.toUpperCase()}</span>
              </p>
            </div>
            
            <div className="flex flex-col items-start md:items-end gap-2">
              <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Trạng thái</span>
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold border 
                ${bill.status === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                  bill.status === 'overdue' ? 'bg-rose-50 text-rose-600 border-rose-200' : 
                  'bg-amber-50 text-amber-600 border-amber-200'}`}
              >
                {bill.status === 'paid' ? 'Đã thanh toán' : bill.status === 'overdue' ? 'Quá hạn' : 'Chờ thanh toán'}
              </span>
            </div>
          </div>

          {/* Parties Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 border-b border-slate-100 pb-10">
            <div>
              <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                Thông tin phòng
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">{room?.name || 'Phòng không xác định'}</h3>
              {room?.floor && <p className="text-slate-600 font-medium">Tầng {room.floor}</p>}
            </div>

            <div>
              <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                Thông tin người thuê
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-1">{tenant?.fullName || 'Khách vãng lai'}</h3>
              {tenant?.phone && (
                <p className="text-slate-600 font-medium flex items-center gap-2 mt-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  {tenant.phone}
                </p>
              )}
              {tenant?.email && (
                <p className="text-slate-600 font-medium flex items-center gap-2 mt-1">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                  {tenant.email}
                </p>
              )}
            </div>
          </div>

          {/* Invoice Items */}
          <div className="mb-12">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Chi tiết thanh toán</h3>
            <div className="bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-100/50 border-b border-slate-200">
                    <th className="py-4 px-6 text-sm font-bold text-slate-600">Hạng mục</th>
                    <th className="py-4 px-6 text-sm font-bold text-slate-600 text-right">Thành tiền (VNĐ)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-white transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800">Tiền thuê phòng</div>
                      <div className="text-sm text-slate-500 mt-0.5">Giá thuê cơ bản tháng {bill.month}/{bill.year}</div>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-slate-700">
                      {(bill.rentAmount || 0).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                  <tr className="hover:bg-white transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800">Tiền điện</div>
                      <div className="text-sm text-slate-500 mt-0.5">Theo đồng hồ điện</div>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-slate-700">
                      {(bill.electricityAmount || 0).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                  <tr className="hover:bg-white transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800">Tiền nước</div>
                      <div className="text-sm text-slate-500 mt-0.5">Theo khối lượng tiêu thụ</div>
                    </td>
                    <td className="py-4 px-6 text-right font-bold text-slate-700">
                      {(bill.waterAmount || 0).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                  {bill.otherAmount ? (
                    <tr className="hover:bg-white transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-800">Phụ phí khác</div>
                      </td>
                      <td className="py-4 px-6 text-right font-bold text-slate-700">
                        {(bill.otherAmount || 0).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ) : null}
                </tbody>
                <tfoot>
                  <tr className="bg-indigo-50 border-t-2 border-indigo-100">
                    <td className="py-5 px-6 font-bold text-indigo-900 text-lg">Tổng cộng cần thanh toán</td>
                    <td className="py-5 px-6 text-right font-black text-indigo-700 text-2xl">
                      {bill.totalAmount?.toLocaleString('vi-VN')} <span className="text-base text-indigo-500 font-bold ml-0.5">₫</span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Actions */}
          {bill.status !== 'paid' && (
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <button
                onClick={handleVnpayPayment}
                disabled={processingVnpay}
                className="px-8 py-3.5 bg-[#005BAA] hover:bg-[#004f94] text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-200 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {processingVnpay ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                    Thanh toán qua VNPAY
                  </>
                )}
              </button>

              <Link
                to="/app/payments" 
                className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors flex justify-center items-center gap-2"
              >
                Báo cáo đã chuyển khoản
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
